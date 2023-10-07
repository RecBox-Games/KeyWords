import { buttons_add } from "../../controller_lib/button.js";
import { drawablesAdd } from "../../controller_lib/draw.js";
import { get_context } from "../../controller_lib/init.js";
import { Context } from "../../controller_lib/types/context.js";
import { DEFAULT_DRAWABLE_IMG } from "../../controller_lib/types/drawables.js";
import { get_asset } from "../../utils/assets.js";
import { animate_grass, render_grass } from "../../utils/render_utils.js";
import { BLUE, GIVER, GUESSER, RED } from "../interfaces.js";
import { Menu, get_menu, size_menu } from "./init.js";
import { RoleState, TurnRole } from "../../utils/state_handler.js";

// TODO set button bounding box to be a bit bigge than text

export const set_menu_state = (role_state: RoleState) => {
    const ctx: Context = get_context();
    const menu: Menu = get_menu();

    menu.bg = {...DEFAULT_DRAWABLE_IMG, image: get_asset('keywords_background'), }
    size_menu();

    menu.role = role_state.role;
    buttons_add(menu.exitBtn)
    menu.redTeam.cluegiver = role_state.red_cluer_taken == true ? true : false;
    menu.blueTeam.cluegiver = role_state.blue_cluer_taken == true ? true : false;
    if (role_state.role == TurnRole.Choosing)
    {
        if (!role_state.blue_cluer_taken)
        {
            buttons_add(menu.blueTeam.giverBtn);
            menu.blueTeam.giverSprite.src = {x:54 * 2 + 0.5, y:0, h:49, w:54}
        }
        else
            menu.blueTeam.giverSprite.src = {x:54 * 4 + 0.5, y:0, h:49, w:54}
        buttons_add(menu.blueTeam.guesserBtn);
        if (!role_state.red_cluer_taken)
        {
            buttons_add(menu.redTeam.giverBtn);
            menu.redTeam.giverSprite.src = {x: 54 * 3 + 0.5, y:0, h:49, w:54}
        }
        else
            menu.redTeam.giverSprite.src = {x: 54 * 4 + 0.5, y:0, h:49, w:54}

        buttons_add(menu.redTeam.guesserBtn);
        menu.blueTeam.giverBtn._active = true;
        menu.blueTeam.guesserBtn._active = true;
        menu.redTeam.giverBtn._active = true;
        menu.redTeam.guesserBtn._active = true;
        return ;
    }
    menu.blueTeam.giverBtn._active = false;
    menu.blueTeam.guesserBtn._active = false;
    menu.redTeam.giverBtn._active = false;
    menu.redTeam.guesserBtn._active = false;
    menu.text.text = "Waiting for game to start...";
}

export const menu_loop = () => {
    const menu:Menu = get_menu();

    if (menu.bg)
        drawablesAdd(menu.bg);
    // animate_grass();
    // render_grass();
    // drawablesAdd(menu.container);
    drawablesAdd(menu.text);
    // drawablesAdd(menu.blueTeam.name);
    // drawablesAdd(menu.redTeam.name);
    drawablesAdd(menu.exit)
    if (menu.team == -1 )
    {
        drawablesAdd(menu.blueTeam.giverSprite);
        drawablesAdd(menu.blueTeam.guesserSprite);
        drawablesAdd(menu.redTeam.giverSprite);
        drawablesAdd(menu.redTeam.guesserSprite);
    }
}
