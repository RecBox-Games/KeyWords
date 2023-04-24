import { drawablesAdd } from "../../controller_lib/draw.js";
import { get_context } from "../../controller_lib/init.js";
import { Context } from "../../controller_lib/types/context.js";
import { Menu } from "./init.js";


let menu:Menu;

const BLUE_TEAM = 1;
const RED_TEAM = 2;
const GUESS = 0;
const CLUE = 1;



// TODO set button bounding box to be a bit bigge than text
const set_menu_state = (team:number, role:number) => {
    let ctx:Context = get_context();

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

    ctx.ctx.font = menu.blueTeam.name.text = "Blue team " + (menu.role == GUESS ? "guesser" : "clue giver");
    ctx.ctx.font = menu.redTeam.name.text = "Red team " + (menu.role == GUESS ? "guesser" : "clue giver");
}

export const menu_loop = () => {
    drawablesAdd(menu.container);
    drawablesAdd(menu.text);
    if (menu.team != RED_TEAM)
        drawablesAdd(menu.blueTeam.name);
    if (menu.team != BLUE_TEAM)
        drawablesAdd(menu.redTeam.name);
    if (!menu.team)
    {
        drawablesAdd(menu.blueTeam.giverSprite);
        drawablesAdd(menu.blueTeam.guesserSprite);
        drawablesAdd(menu.redTeam.giverSprite);
        drawablesAdd(menu.redTeam.guesserSprite);
    }
}
