import { handleTouchCancel, handleClick, handleTouchEnd, handleTouchMove, handleTouchStart } from "./utils.js";
let context;
// globals
let drag_start_x = 0;
let drag_start_y = 0;
// websocket and main
export const get_context = () => context;
export const init_context = () => {
    const canvas = document.querySelector("canvas");
    const url_arg_str = window.location.search;
    const url_params = new URLSearchParams(url_arg_str);
    const subid = url_params.get('subid');
    const box_ip = window.location.href.split('/')[2].split(':')[0];
    let ws = new WebSocket("ws://" + box_ip + ":50079");
    context = {
        canvas: canvas,
        ctx: canvas.getContext("2d"),
        dimensions: { x: canvas.width, y: canvas.width },
        ws: ws,
        subid: parseInt(subid),
        box_ip: box_ip,
        wsState: 0,
        wsMessage: null
    };
    // if (ws.readyState == WebSocket.CLOSED) {
    //     ws = new WebSocket("ws://" + box_ip + ":50079");
    // }
    screenChange();
    // window.onload = () => {
    // 	context.dimensions.x = window.innerWidth;
    // 	context.dimensions.y = window.innerHeight;
    //     context.canvas.width = document.body.clientWidth;
    //     context.canvas.height = document.body.clientWidth;
    // }
    context.ws.onclose = (event) => {
        console.log("closed websocket");
        context.wsState = 0;
        context.ws = new WebSocket("ws://" + box_ip + ":50079");
    };
    context.ws.onopen = (event) => {
        console.log("opened websocket");
        context.wsState = 1;
        let byte_array = new Uint8Array(1);
        byte_array[0] = context.subid;
        context.ws.send(byte_array);
        context.ws.addEventListener('message', (event) => {
	    if(event.data instanceof ArrayBuffer) {
		const msg = new Uint8Array(event.data);
		console.log(msg);
		context.wsMessage = msg;
		if( msg[0] == "reload") {
		    console.log("Message is ", msg[0]);
		    location.reload();
		}	
	    }
	    else {
		const msg = event.data;
		context.wsMessage = msg;
	    }
            //     handleMessage(msg);
        });
    };
};
// wait for websocket to connect
window.onresize = screenChange;
window.onorientationchange = screenChange;
function screenChange() {
    // context.canvas.width = Math.max(window.innerWidth, window.innerHeight);
    // context.canvas.height = Math.min(window.innerWidth, window.innerHeight);
    // context.dimensions.x = Math.max(window.innerWidth, window.innerHeight);
    // context.dimensions.y = Math.min(window.innerWidth, window.innerHeight);
    // let ratio = window.innerWidth / window.innerHeight;
    // if (!(ratio >= 0.8 && ratio <= 1.25))
    //     return ;
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
    context.dimensions.x = window.innerWidth;
    context.dimensions.y = window.innerHeight;
    // size_loading();
    // size_menu();
    // size_tutorial();
    // size_main();
    // size_end();
    // console.log(context.dimensions)
    // onFlip(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", (event) => {
    screenChange();
});
window.addEventListener("touchstart", (event) => {
    for (let touch of event.changedTouches) {
        handleTouchStart(touch.identifier, touch.pageX, touch.pageY);
    }
});
window.addEventListener("touchmove", (event) => {
    for (let touch of event.changedTouches) {
        handleTouchMove(touch.identifier, touch.pageX, touch.pageY);
    }
});
window.addEventListener("touchend", (event) => {
    for (let touch of event.changedTouches) {
        handleTouchEnd(touch.identifier, touch.pageX, touch.pageY);
    }
});
window.addEventListener("touchcancel", (event) => {
    for (let touch of event.changedTouches) {
        handleTouchCancel(touch.identifier, touch.pageX, touch.pageY);
    }
});
window.addEventListener('click', (event) => {
    handleClick(event.clientX, event.clientY);
});
