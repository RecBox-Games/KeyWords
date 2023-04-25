import { get_context, init_context } from "../controller_lib/init.js";
import { BLUE, GAME, GIVER, GUESSER, RED, TUTORIAL } from "../game/interfaces.js";
import { init_loading } from "../game/loading/init.js";
import { fill_board } from "../game/main/init.js";
import { init_menu } from "../game/menu/init.js";
import { init_tutorial } from "../game/tutorial/tutorial_init.js";
import { set_tutorial_state } from "../game/tutorial/tutorial_loop.js";
import { set_state } from "../main.js";
export const load_app = () => {
    init_context();
    init_loading();
    init_tutorial();
    init_menu();
    // Init context
    // Load assets
    // request state && exec state
    // wait for state & load (store)
};
const parse_rolestate = (msg) => {
    let role = -1;
    let team = -1;
    if (msg.includes('choosing'))
        return [role, team];
    if (msg.includes('red'))
        team = RED;
    else if (msg.includes('blue'))
        team = BLUE;
    if (msg.includes('guesser'))
        role = GUESSER;
    else if (msg.includes('cluer'))
        role = GIVER;
    return [role, team];
};
// const parse_turnstate = (msg:string):[number, number] => {
// }
// const parse_healthstate = (msg:string):[number, number] => {
// }
const parse_cheststate = (msg) => {
    const arr = [];
    const message_str = msg.split(';');
    for (let obj of message_str) {
        const words = obj.split(',');
        arr.push({
            text: words[0],
            state: words[1],
            contents: 1
        });
    }
    return arr;
};
const MESSAE_TYPE = 0;
const PLAYERSTATE = 1;
const TURN_STATE = 2;
const HEALTH_STATE = 3;
const CHEST_STATE = 4;
export const state_handler = () => {
    const ctx = get_context();
    if (!ctx.wsMessage)
        return;
    else {
        const state_specs = ctx.wsMessage.split(':');
        if (state_specs[MESSAE_TYPE] == 'notify')
            console.log('Notify' + state_specs[PLAYERSTATE]);
        else if (state_specs[MESSAE_TYPE] == 'state') {
            const isChoosing = (state_specs[PLAYERSTATE] == 'choosing');
            const [role, team] = parse_rolestate(state_specs[PLAYERSTATE]);
            const chestData = parse_cheststate(state_specs[CHEST_STATE]);
            if (isChoosing) {
                if (role == -1 && team == -1) {
                    set_state(TUTORIAL);
                    set_tutorial_state();
                }
                // else
                // {
                //     set_state(MENU);
                //     set_menu_state(team, role);
                // }
            }
            else if (!isChoosing) {
                set_state(GAME);
                fill_board(role, chestData);
            }
        }
        ctx.wsMessage = null;
    }
};
