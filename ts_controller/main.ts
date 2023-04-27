import { buttons_flush, buttons_set } from "./controller_lib/button.js";
import { drawablesRenderAll } from "./controller_lib/draw.js";
import { get_context } from "./controller_lib/init.js";
import { size_loading } from "./game/loading/init.js";
import { loading_loop } from "./game/loading/loop.js";
import { size_main } from "./game/main/init.js";
import { main_loop } from "./game/main/loop.js";
import { size_menu } from "./game/menu/init.js";
import { menu_loop } from "./game/menu/menu_loop.js";
import { size_tutorial } from "./game/tutorial/tutorial_init.js";
import { tutorial_loop } from "./game/tutorial/tutorial_loop.js";
import { load_app, state_handler } from "./utils/state_handler.js";

let state = 0;

export const get_state = () => state;
export const set_state = (val:number) => {
    state = val
    buttons_flush();
    // buttons_set(false);
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
    window.addEventListener("resize", (event) => {
        size_loading();
        size_menu();
        size_tutorial();
        size_main();
    })
    window.requestAnimationFrame(app);

}


//TODO: add layer to drawable & sort it before rendering + render functions
