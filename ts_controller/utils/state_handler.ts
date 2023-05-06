import { buttons_log } from "../controller_lib/button.js";
import { get_context, init_context } from "../controller_lib/init.js";
import { Context } from "../controller_lib/types/context.js";
import { fill_end, init_end } from "../game/end/init.js";
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
    init_end();


    // Init context
    // Load assets
    // request state && exec state
    // wait for state & load (store)

}

const NONE = -1;
const MESSAE_TYPE = 0;
const PLAYERSTATE = 1;
const TURN_STATE = 2;
const HEALTH_STATE = 3;
const CHEST_STATE = 4;
const CHOOSING = -1;
const PLAYING = 2;
const OVER = 4;

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
        return [CHOOSING, CHOOSING, redclue, blueclue];
    }
    else {
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

const parse_turnstate = (msg:string):[number, number, number, string, number, boolean] => {
    let role = CHOOSING;
    let team = CHOOSING;
    let clue = ""
    let guessCount = 0;
    let guessState = false;
    let turnState = -1;
    // {tutorial,over,redcluing,bluecluing,<guessing_state>}
    // where <guessing_state> is
        // {redguessing,blueguessing},<clue>,<guesses_remaining>,<proposed_guess>
        // where <proposed_guess> is either true or false
    const state = msg.split(',')

    if (state[0] == 'tutorial')
        turnState = TUTORIAL;
    else if (state[0] == 'over')
        turnState = OVER
    else
    {
        turnState = PLAYING;
        clue = state[1];
        guessCount = parseInt(state[2]);
        guessState = (state[3] == 'true');
        if (state[0].includes('red'))
            team = RED;
        else if (state[0].includes('blue'))
            team = BLUE;
        if (state[0].includes('guessing'))
            role = GUESSER;
        else if (state[0].includes('cluing'))
            role = GIVER;
    }
    console.log("state 0", state, state[0], state[0] == 'over', turnState)
    return [turnState, role, team, clue, guessCount, guessState];
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
            const [role, team, redclue, blueclue] = parse_rolestate(state_specs[PLAYERSTATE]);
            const [turnState, turnRole, turnTeam, clue, guessCount, guessState] = parse_turnstate(state_specs[TURN_STATE]);
            const chestData = parse_cheststate(state_specs[CHEST_STATE])

            console.log("State",turnState, role, team, redclue, blueclue, turnRole, turnTeam, clue, guessCount, guessState)
            if (turnState == TUTORIAL)
            {
                set_state(TUTORIAL)
                set_tutorial_state();
            }
            else if (role == CHOOSING)
            {
                set_state(MENU);
                set_menu_state(team, role, redclue, blueclue);
            }
            else if (turnState == PLAYING) {
                set_state(GAME);
                fill_board(role, team, chestData);

                if (turnTeam != team)
                    end_turn();
                else {
                    start_turn(turnRole, clue, guessCount, "", guessState);
                }
            }
            else if (turnState == OVER) {
                set_state(OVER)
                fill_end();
            }
        }
        ctx.wsMessage = null;
    }

}
