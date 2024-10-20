var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }

    var stompClient = null;
    var drawingId = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
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
        });
    }

    return {

        init: function () {

            drawingId = document.getElementById("drawing").value;
            var can = document.getElementById("canvas");

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