import { resize_confirmation } from "../utils/confirmation.js";
import { resize_menu } from "../utils/menu.js";
import { resize_submit } from "../utils/submit_button.js";
import { handleTouchCancel, handleClick, handleTouchEnd, handleTouchMove, handleTouchStart } from "./utils.js";
let context;
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
    screenChange();
    context.ws.onclose = (_event) => {
        console.log("closed websocket");
        context.wsState = 0;
        context.ws = new WebSocket("ws://" + box_ip + ":50079");
        location.reload();
    };
    context.ws.onopen = (_event) => {
        console.log("opened websocket");
        context.wsState = 1;
        let byte_array = new Uint8Array(1);
        byte_array[0] = context.subid;
        context.ws.send(byte_array);
        context.ws.onmessage = async (event) => {
            if (event.data instanceof Blob) {
                const blobData = new Uint8Array(await event.data.arrayBuffer()); // Read the Blob as a Uint8Array
                // Check the first byte to trigger a reload if it's equal to 0x01
                if (blobData.length > 0 && blobData[0] === 0x01) {
                    console.log("Hold your hats! It's reload time!");
                    location.reload();
                }
                else {
                    // Handle other binary data
                    console.log("Received binary data:", blobData);
                    // Handle it according to your use case.
                }
            }
            else {
                context.wsMessage = event.data;
            }
        };
    };
};
// wait for websocket to connect
window.onresize = screenChange;
window.onorientationchange = handleOrientationChange;
function handleOrientationChange() {
    location.reload();
}
function screenChange() {
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
    context.dimensions.x = window.innerWidth;
    context.dimensions.y = window.innerHeight;
    resize_menu();
    resize_confirmation();
    resize_submit();
}
window.addEventListener("resize", (_event) => {
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
