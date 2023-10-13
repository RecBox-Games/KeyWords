import { buttons_add, buttons_flush } from "../../controller_lib/button.js";
import { drawablesAdd } from "../../controller_lib/draw.js";
import { get_role_screen } from "./init.js";
import { get_game_state } from "../../utils/state_handler.js";
import { get_popup } from "../../utils/popup.js";
import { get_menu } from "../../utils/menu.js";
import { buttons_add_menus, drawables_add_menus } from "../../utils/utils.js";
// TODO set button bounding box to be a bit bigge than text
export const role_screen_loop = () => {
    const role_screen = get_role_screen();
    const role_state = get_game_state().role_state;
    const popup = get_popup();
    const menu = get_menu();
    //////// Buttons ////////
    buttons_flush();
    if (buttons_add_menus()) {
        // pass
    }
    else {
        // menu open button
        buttons_add(menu.open_button);
        // role choices
        buttons_add(role_screen.blueTeam.guesserBtn);
        buttons_add(role_screen.redTeam.guesserBtn);
        if (!role_state.blue_cluer_taken) {
            buttons_add(role_screen.blueTeam.giverBtn);
        }
        if (!role_state.red_cluer_taken) {
            buttons_add(role_screen.redTeam.giverBtn);
        }
    }
    //////// Drawables ////////
    // board
    if (role_screen.bg) {
        drawablesAdd(role_screen.bg);
    }
    // top row
    drawablesAdd(menu.open_sprite);
    drawablesAdd(role_screen.text);
    // role choices
    drawablesAdd(role_screen.blueTeam.giverSprite);
    drawablesAdd(role_screen.blueTeam.guesserSprite);
    drawablesAdd(role_screen.redTeam.giverSprite);
    drawablesAdd(role_screen.redTeam.guesserSprite);
    drawables_add_menus();
};
