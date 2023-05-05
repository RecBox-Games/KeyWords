import { buttons_log } from "../controller_lib/button.js";
import { get_context, init_context } from "../controller_lib/init.js";
import { Context } from "../controller_lib/types/context.js";
import { BLUE, GAME, GIVER, GUESSER, MENU, RED, TUTORIAL } from "../game/interfaces.js";
import { init_loading } from "../game/loading/init.js";
import { fill_board, init_main_screen } from "../game/main/init.js";
import { init_menu } from "../game/menu/init.js";
import { set_menu_state } from "../game/menu/menu_loop.js";
import { init_tutorial } from "../game/tutorial/tutorial_init.js";
import { set_tutorial_state } from "../game/tutorial/tutorial_loop.js";
import { set_state } from "../main.js";
import { prepare_grass } from "./render_utils.js";
import { end_turn, start_turn } from "./utils.js";


export const load_app = () => {
    init_context();
    init_loading();
    init_tutorial();
    init_menu();
    init_main_screen();


    // Init context
    // Load assets
    // request state && exec state
    // wait for state & load (store)

}

const parse_rolestate = (msg:string):[number, number, boolean, boolean] => {
    let role = -1;
    let team = -1;
    let redclue = false;
    let blueclue = false;
    const message_str:string[] = msg.split(',');


    if (message_str[0].includes('choosing'))
    {
        if (message_str[1].includes('true'))
            redclue = true;
        if (message_str[2].includes('true'))
            blueclue = true;
        console.log('clues ', redclue, blueclue)
        return [role, team, redclue, blueclue];
    }
    else {
        console.log('?????')
        if (message_str[0].includes('red'))
            team = RED;
        else if (message_str[0].includes('blue'))
            team = BLUE;
        if (message_str[0].includes('guesser'))
            role = GUESSER;
        else if (message_str[0].includes('cluer'))
            role = GIVER
        return [role, team, false, false];
    }
}

const parse_turnstate = (msg:string):[number, number, string, number, boolean] => {
    let role = -1;
    let team = -1;
    const state = msg.split(',')
    const clue = state[1];
    const guessCount = parseInt(state[2]);
    const guessState = state[3] == 'true';

    if (state[0].includes('red'))
        team = RED;
    else if (state[0].includes('blue'))
        team = BLUE;
    if (state[0].includes('guessing'))
        role = GUESSER;
    else if (state[0].includes('cluing'))
        role = GIVER;
    console.log("turn state",role, team, clue, guessCount, guessState )
    return [role, team, clue, guessCount, guessState];
}

// const parse_healthstate = (msg:string):[number, number] => {

// }

const parse_cheststate = (msg:string):any[]=> {
    const arr:any = [];
    const message_str:string[] = msg.split(';');

    for (let obj of message_str)
    {
        const words:string[] = obj.split(',')
        arr.push({
            text: words[0],
            state: words[1] == 'open',
            contents: words[2]
        })
    }
    return arr;
}

const MESSAE_TYPE = 0;
const PLAYERSTATE = 1;
const TURN_STATE = 2;
const HEALTH_STATE = 3;
const CHEST_STATE = 4;

export const state_handler = () => {
    const ctx = get_context();

    if (!ctx.wsMessage)
        return ;
    else
    {
        const state_specs:string[] = ctx.wsMessage.split(':');

        if (state_specs[MESSAE_TYPE] == 'notify')
            console.log('Notify' +  state_specs[PLAYERSTATE]);
        else if (state_specs[MESSAE_TYPE] == 'state')
        {
            const isChoosing = (state_specs[PLAYERSTATE].includes('choosing'));
            const [role, team, redclue, blueclue] = parse_rolestate(state_specs[PLAYERSTATE]);
            console.log('just parsed', redclue, blueclue)
            const [turnRole, turnTeam, clue, guessCount, guessState] = parse_turnstate(state_specs[TURN_STATE]);
            const chestData = parse_cheststate(state_specs[CHEST_STATE])

            if (isChoosing)
            {
                if (role == -1 && team == -1)
                {
                    set_state(TUTORIAL)
                    set_tutorial_state();
                }
                else
                {
                    set_state(MENU);
                    console.log('just sent', redclue, blueclue)
                    set_menu_state(team, role, redclue, blueclue);
                }
            }
            else if (!isChoosing) {
                set_state(GAME);
                fill_board(role, team, chestData);

                if (turnTeam != team)
                    end_turn();
                else {
                    start_turn(turnRole, clue, guessCount, "", guessState);
                }
            }
        }
        ctx.wsMessage = null;
    }

}
