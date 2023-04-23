// import { DEFAULTT_BUTTON_RECT, buttons_add } from "./button.js";
import { Context } from "./types/context.js";
import { handleTouchCancel, handleClick, handleTouchEnd, handleTouchMove, handleTouchStart } from "./utils.js";
let context:Context;


// globals
let drag_start_x = 0;
let drag_start_y = 0;

// websocket and main
export const get_context = () :Context => context;

export const init_context = () => {
	const canvas:HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
	const url_arg_str = window.location.search;
	const url_params = new URLSearchParams(url_arg_str);
	const subid = url_params.get('subid');
	const box_ip = window.location.href.split('/')[2].split(':')[0];


	let ws = new WebSocket("ws://" + box_ip + ":50079");
	context = {
		canvas: canvas,
		ctx: canvas.getContext("2d") as CanvasRenderingContext2D,
		dimensions: {x:  canvas.width, y:  canvas.width},
		ws: ws,
		subid:subid as string,
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
		ws = new WebSocket("ws://" + box_ip + ":50079");

	}

	context.ws.onopen = (event) => {
		console.log("openned websocket")

	        byte_array = new UInt8Array(1);
                byte_array[0] = subid;
		context.ws.send(byte_array);

		context.ws.addEventListener('message', (event) => {
            const msg = event.data;
            context.wsMessage = msg;
		//     handleMessage(msg);
		});
	}

}

// wait for websocket to connect
window.onresize = screenChange;
window.onorientationchange = screenChange;

function screenChange() {
    context.canvas.width = Math.max(window.innerWidth, window.innerHeight);
    context.canvas.height = Math.min(window.innerWidth, window.innerHeight);
    context.dimensions.x = Math.max(window.innerWidth, window.innerHeight);
    context.dimensions.y = Math.min(window.innerWidth, window.innerHeight);
    console.log("width", context.dimensions.x, "Height", context.dimensions.y)

    // onFlip(window.innerWidth, window.innerHeight);
}


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
