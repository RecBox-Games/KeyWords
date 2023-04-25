import { buttons_flush } from "./controller_lib/button.js";
import { drawablesRenderAll } from "./controller_lib/draw.js";
import { get_context } from "./controller_lib/init.js";
import { loading_loop } from "./game/loading/loop.js";
import { main_loop } from "./game/main/loop.js";
import { menu_loop } from "./game/menu/menu_loop.js";
import { tutorial_loop } from "./game/tutorial/tutorial_loop.js";
import { load_app, state_handler } from "./utils/state_handler.js";

let state = 0;

export const get_state = () => state;
export const set_state = (val:number) => {
    state = val
    // buttons_flush();
    };

const loops:Function[] = [loading_loop, tutorial_loop, menu_loop, main_loop]


const app = () => {
    state_handler();
    loops[state]();
    drawablesRenderAll();
	window.requestAnimationFrame(app);
}

window.onload = () => {
    console.log("init");
    load_app();
    window.requestAnimationFrame(app);
}


//TODO: add layer to drawable & sort it before rendering + render functions
