import { buttons_add, buttons_flush } from "../../controller_lib/button.js";
import { drawablesAdd } from "../../controller_lib/draw.js";
import { Menu, get_menu } from "./init.js";
import { TurnRole, get_game_state } from "../../utils/state_handler.js";
import { get_popup } from "../../utils/popup.js";

// TODO set button bounding box to be a bit bigge than text


export const menu_loop = () => {
    const menu:Menu = get_menu();
    const role_state = get_game_state().role_state;
    const popup = get_popup();

    //////// Buttons ////////
    buttons_flush();
    // popup
    if (popup.show) {
        buttons_add(popup.x_button);
    } else {
        buttons_add(menu.exitBtn)
        if (role_state.role == TurnRole.Choosing) {
            buttons_add(menu.blueTeam.guesserBtn);
            buttons_add(menu.redTeam.guesserBtn);
            if (!role_state.blue_cluer_taken) {
                buttons_add(menu.blueTeam.giverBtn);
            }
            if (!role_state.red_cluer_taken) {
                buttons_add(menu.redTeam.giverBtn);
            }
        }
    }
    
    //////// Drawables ////////      
    if (menu.bg) {
        drawablesAdd(menu.bg);
    }
    drawablesAdd(menu.text);
    drawablesAdd(menu.exit)
    drawablesAdd(menu.blueTeam.giverSprite);
    drawablesAdd(menu.blueTeam.guesserSprite);
    drawablesAdd(menu.redTeam.giverSprite);
    drawablesAdd(menu.redTeam.guesserSprite);
    if (popup.show) {
        drawablesAdd(popup.base_sprite);
        drawablesAdd(popup.x_sprite);
        drawablesAdd(popup.header);
        drawablesAdd(popup.message);
    }
}
