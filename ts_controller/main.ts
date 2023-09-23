import { buttons_flush, buttons_set } from "./controller_lib/button.js";
import { drawablesRenderAll } from "./controller_lib/draw.js";
import { get_context } from "./controller_lib/init.js";
import { size_end } from "./game/end/init.js";
import { end_loop } from "./game/end/loop.js";
import { size_loading } from "./game/loading/init.js";
import { loading_loop } from "./game/loading/loop.js";
import { size_main } from "./game/main/init.js";
import { main_loop } from "./game/main/loop.js";
import { size_menu } from "./game/menu/init.js";
import { menu_loop } from "./game/menu/menu_loop.js";
import { size_tutorial } from "./game/tutorial/tutorial_init.js";
import { tutorial_loop } from "./game/tutorial/tutorial_loop.js";
import { prepare_grass } from "./utils/render_utils.js";
import { load_app, state_handler } from "./utils/state_handler.js";

let state = 0;

export const get_state = () => state;
export const set_state = (val:number) => {
    state = val
    buttons_flush();
    // buttons_set(false);
    };

const loops:Function[] = [loading_loop, tutorial_loop, menu_loop, main_loop, end_loop]


const app = () => {
    state_handler();

	const ctx = get_context();
    	  if (ctx.ws && ctx.ws.readyState === WebSocket.OPEN) {
          	 // WebSocket is open, you can use it
          	 // For example, you can send a message:
          	 // ctx.ws.send('Hello WebSocket!');
			 console.log("websocket open");
    	  } else {
          	// WebSocket is not open or doesn't exist
        	// Handle this situation as needed
			 console.log("websocket closed");
    	}

    loops[state]();
    drawablesRenderAll();
	window.requestAnimationFrame(app);
}

window.onerror = (event, source, lineno, colno, error) => {
    const ctx = get_context();

    if (ctx.ws)
        ctx.ws.send('warn:' + 'error : ' + error +'at ' + source + ' line:' + lineno);
}

window.onload = () => {
    console.log("init");
    load_app();
    window.addEventListener("resize", (event) => {
        // const context= get_context();
        // if (context && context.ws && context.ws.readyState)
        //     {
        //         // console.log("??")
        //         context.ws.send(" Canvas HERE size is | w: " + context.dimensions.x.toString() + " h: " + context.dimensions.y.toString());
        //     }
        size_loading();
        size_menu();
        size_tutorial();
        size_main();
        size_end();
        prepare_grass();
    })
    window.requestAnimationFrame(app);

}


//TODO: add layer to drawable & sort it before rendering + render functions
