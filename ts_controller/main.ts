import { buttons_flush } from "./controller_lib/button.js";
import { drawablesRenderAll } from "./controller_lib/draw.js";
import { get_context } from "./controller_lib/init.js";
import { size_end } from "./game/end/init.js";
import { end_loop } from "./game/end/loop.js";
import { size_loading } from "./game/loading/init.js";
import { loading_loop } from "./game/loading/loop.js";
import { size_main } from "./game/main/init.js";
import { main_loop } from "./game/main/loop.js";
import { Menu, get_menu, size_menu } from "./game/menu/init.js";
import { menu_loop } from "./game/menu/menu_loop.js";
import { get_asset } from "./utils/assets.js";
import { size_popup } from "./utils/popup.js";
import { prepare_grass } from "./utils/render_utils.js";
import { load_app, handle_message, RoleState, TurnRole } from "./utils/state_handler.js";
import { DEFAULT_DRAWABLE_IMG } from "./controller_lib/types/drawables.js";

let state = 0;

export const get_state = () => state;
export const set_state = (val:number) => {
    state = val
    buttons_flush();
    // buttons_set(false);
    };

const loops:Function[] = [loading_loop, loading_loop, menu_loop, main_loop, end_loop]
// TODO: get rid of the double or do greater refactor


const app = () => {
    handle_message();
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
        size_loading();
        size_menu();
        size_main();
        size_end();
        prepare_grass();
        size_popup();
    })
    window.requestAnimationFrame(app);

}


export const set_menu_state = (role_state: RoleState) => {
    const menu: Menu = get_menu();

    menu.bg = {...DEFAULT_DRAWABLE_IMG, image: get_asset('keywords_background'), }
    size_menu();

    menu.role = role_state.role;
    menu.redTeam.cluegiver = role_state.red_cluer_taken == true ? true : false;
    menu.blueTeam.cluegiver = role_state.blue_cluer_taken == true ? true : false;
    if (role_state.role == TurnRole.Choosing) {
        if (!role_state.blue_cluer_taken) {
            menu.blueTeam.giverSprite.src = {x:54 * 2 + 0.5, y:0, h:49, w:54}
        } else {
            menu.blueTeam.giverSprite.src = {x:54 * 4 + 0.5, y:0, h:49, w:54}
        }
        if (!role_state.red_cluer_taken) {
            menu.redTeam.giverSprite.src = {x: 54 * 3 + 0.5, y:0, h:49, w:54}
        } else {
            menu.redTeam.giverSprite.src = {x: 54 * 4 + 0.5, y:0, h:49, w:54}
        }
        menu.blueTeam.giverBtn._active = true;
        menu.blueTeam.guesserBtn._active = true;
        menu.redTeam.giverBtn._active = true;
        menu.redTeam.guesserBtn._active = true;
    } else {
        menu.blueTeam.giverBtn._active = false;
        menu.blueTeam.guesserBtn._active = false;
        menu.redTeam.giverBtn._active = false;
        menu.redTeam.guesserBtn._active = false;
        menu.text.text = "Waiting for game to start...";
    }
}

