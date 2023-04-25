import { buttons_add } from "../../controller_lib/button.js";
import { drawablesAdd } from "../../controller_lib/draw.js";
import { get_context } from "../../controller_lib/init.js";
import { BLUE, GIVER, GUESSER, RED } from "../interfaces.js";
import { get_menu } from "./init.js";
// TODO set button bounding box to be a bit bigge than text
export const set_menu_state = (team, role) => {
    const ctx = get_context();
    const menu = get_menu();
    if (role == -1 && team == -1) {
        buttons_add(menu.blueTeam.giverBtn);
        buttons_add(menu.blueTeam.guesserBtn);
        buttons_add(menu.redTeam.giverBtn);
        buttons_add(menu.redTeam.guesserBtn);
        return;
    }
    menu.team = team;
    menu.role = role;
    menu.text.text = "Waiting for game to start...";
    menu.blueTeam.name.font = '50px serif';
    menu.redTeam.name.font = '50px serif';
    menu.blueTeam.name.boundingBox = {
        ...menu.container.boundingBox,
        y: menu.container.boundingBox.y + menu.container.boundingBox.h * 2
    };
    menu.redTeam.name.boundingBox = {
        ...menu.container.boundingBox,
        y: menu.container.boundingBox.y + menu.container.boundingBox.h * 2
    };
    ctx.ctx.font = menu.blueTeam.name.text = "Blue team " + (menu.role == GUESSER ? "guesser" : "clue giver");
    ctx.ctx.font = menu.redTeam.name.text = "Red team " + (menu.role == GIVER ? "guesser" : "clue giver");
};
export const menu_loop = () => {
    const menu = get_menu();
    drawablesAdd(menu.container);
    drawablesAdd(menu.text);
    if (menu.team != RED)
        drawablesAdd(menu.blueTeam.name);
    if (menu.team != BLUE)
        drawablesAdd(menu.redTeam.name);
    if (!menu.team) {
        drawablesAdd(menu.blueTeam.giverSprite);
        drawablesAdd(menu.blueTeam.guesserSprite);
        drawablesAdd(menu.redTeam.giverSprite);
        drawablesAdd(menu.redTeam.guesserSprite);
    }
};