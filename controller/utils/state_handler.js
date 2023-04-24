import { get_context, init_context } from "../controller_lib/init.js";
import { init_loading } from "../game/loading/init.js";
import { init_menu } from "../game/menu/init.js";
import { init_tutorial } from "../game/tutorial/tutorial_init.js";
import { set_state } from "../main.js";
export const load_app = () => {
    set_state(0);
    init_context();
    init_loading();
    init_tutorial();
    init_menu();
    // Init context
    // Load assets
    // request state && exec state
    // wait for state & load (store)
};
export const state_handler = () => {
    const ctx = get_context();
    if (!ctx.wsMessage)
        return;
    else
        console.log('Received ', ctx.wsMessage);
};
