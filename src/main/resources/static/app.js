var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }

    var stompClient = null;
    var subscription = null;

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

    var connectAndSubscribe = function (room) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);

            subscription = stompClient.subscribe(`/topic/newpoint.${room}`, function (eventbody) {
                const point = JSON.parse(eventbody.body);
                
                var x = point.x;
                var y = point.y;
    
                //alert(x + " " + y );
                addPointToCanvas(point);
            });
        });
    }

    return {

        init: function () {
            this.disconnect();

            var drawingId = document.getElementById("drawing").value;
            var can = document.getElementById("canvas");

            //websocket connection
            connectAndSubscribe(drawingId);

            if (window.PointerEvent) {
                can.addEventListener("pointerdown", function (event) {
                    point = getMousePosition(event);
                    app.publishPoint(point.x, point.y, drawingId);
                });
            } else {
                can.addEventListener("mousedown", function (event) {
                    point = getMousePosition(event);
                    app.publishPoint(point.x, point.y, drawingId);
                });
            }
        },

        publishPoint: function(px,py,room){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            //addPointToCanvas(pt);
            //creando un objeto literal
            stompClient.send(`/topic/newpoint.${room}`, {}, JSON.stringify(pt)); 

            //publicar el evento
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
                if(subscription){
                    subscription.unsubscribe();
                }
            }
            //setConnected(false);
            console.log("Disconnected");
        }
    };

})();