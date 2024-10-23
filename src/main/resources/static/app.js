var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }

    var stompClient = null;
    var drawingId = null;

    var clearCanvas = function (){
        canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var addPolygonToCanvas = function (points) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.lineTo(points[0].x, points[0].y);
        ctx.stroke();
        ctx.closePath();
    };
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe(`/topic/newpoint.${drawingId}`, function (eventbody) {
                const point = JSON.parse(eventbody.body);
                
                var x = point.x;
                var y = point.y;
    
                //alert(x + " " + y );
                addPointToCanvas(point);
            }, {id: `room-${drawingId}`});


            stompClient.subscribe(`/topic/newpolygon.${drawingId}`, function (eventbody) {
                const points = JSON.parse(eventbody.body);
                addPolygonToCanvas(points);
            },);
            
        });
    }

    return {

        init: function () {

            drawingId = document.getElementById("drawing").value;
            var can = document.getElementById("canvas");

            clearCanvas();
            connectAndSubscribe();

            if (window.PointerEvent) {
                can.addEventListener("pointerdown", function (event) {
                    point = getMousePosition(event);
                    app.publishPoint(point.x, point.y);
                });
            } else {
                can.addEventListener("mousedown", function (event) {
                    point = getMousePosition(event);
                    app.publishPoint(point.x, point.y);
                });
            }
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            stompClient.send(`/app/newpoint.${drawingId}`, {}, JSON.stringify(pt)); 
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            console.log("Disconnected");
        }
    };

})();