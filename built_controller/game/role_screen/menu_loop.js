import { buttons_add, buttons_flush } from "../../controller_lib/button.js";
import { drawablesAdd } from "../../controller_lib/draw.js";
import { get_role_screen } from "./init.js";
import { TurnRole, get_game_state } from "../../utils/state_handler.js";
import { get_popup } from "../../utils/popup.js";
// TODO set button bounding box to be a bit bigge than text
export const role_screen_loop = () => {
    const role_screen = get_role_screen();
    const role_state = get_game_state().role_state;
    const popup = get_popup();
    //////// Buttons ////////
    buttons_flush();
    // popup
    if (popup.show) {
        buttons_add(popup.x_button);
    }
    else {
        buttons_add(role_screen.exitBtn);
        if (role_state.role == TurnRole.Choosing) {
            buttons_add(role_screen.blueTeam.guesserBtn);
            buttons_add(role_screen.redTeam.guesserBtn);
            if (!role_state.blue_cluer_taken) {
                buttons_add(role_screen.blueTeam.giverBtn);
            }
            if (!role_state.red_cluer_taken) {
                buttons_add(role_screen.redTeam.giverBtn);
            }
        }
    }
    //////// Drawables ////////      
    if (role_screen.bg) {
        drawablesAdd(role_screen.bg);
    }
    drawablesAdd(role_screen.text);
    drawablesAdd(role_screen.exit);
    drawablesAdd(role_screen.blueTeam.giverSprite);
    drawablesAdd(role_screen.blueTeam.guesserSprite);
    drawablesAdd(role_screen.redTeam.giverSprite);
    drawablesAdd(role_screen.redTeam.guesserSprite);
    if (popup.show) {
        drawablesAdd(popup.base_sprite);
        drawablesAdd(popup.x_sprite);
        drawablesAdd(popup.header);
        drawablesAdd(popup.message);
    }
};
