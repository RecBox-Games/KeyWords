import { get_context, init_context } from "../controller_lib/init.js";
import { fill_end, init_end } from "../game/end/init.js";
import { GAME, MENU, STARTING, OVER } from "../game/interfaces.js";
import { init_loading } from "../game/loading/init.js";
import { fill_board, init_main_screen } from "../game/main/init.js";
import { init_menu } from "../game/menu/init.js";
import { set_menu_state } from "../game/menu/menu_loop.js";
import { set_state } from "../main.js";
import { end_turn, start_turn } from "./utils.js";
import { init_popup, post_popup } from "./popup.js";
import { HEADER_STARTING, INSTRUCTIONS_STARTING,
         HEADER_CHOOSING, INSTRUCTIONS_CHOOSING,         
         HEADER_GIVE_CLUE, INSTRUCTIONS_GIVE_CLUE,
         HEADER_MAKE_GUESS, INSTRUCTIONS_MAKE_GUESS,
         HEADER_SD, INSTRUCTIONS_SD,
       } from "./popup_messages.js";


let game_state: GameState;
export const get_game_state = (): GameState => { return game_state };

// combine turn and role because it's convenient (we can use if turn == role)
export enum TurnRole {
    Starting,
    Over,
    Choosing,
    RedClue,
    RedGuess,
    BlueClue,
    BlueGuess,
    None,
}

let last_turnrole = TurnRole.None;

export function is_red(turnrole: TurnRole): boolean {
    switch (turnrole) {
        case TurnRole.RedClue:
        case TurnRole.RedGuess:
            return true;
        default:
            return false;
    }
}

export function is_blue(turnrole: TurnRole): boolean {
    switch (turnrole) {
        case TurnRole.BlueClue:
        case TurnRole.BlueGuess:
            return true;
        default:
            return false;
    }
}

export function is_guess(turnrole: TurnRole): boolean {
    switch (turnrole) {
        case TurnRole.RedGuess:
        case TurnRole.BlueGuess:
            return true;
        default:
            return false;
    }
}

export function is_clue(turnrole: TurnRole): boolean {
    switch (turnrole) {
        case TurnRole.RedClue:
        case TurnRole.BlueClue:
            return true;
        default:
            return false;
    }
}

export function is_playing(turnrole: TurnRole): boolean {
    switch (turnrole) {
        case TurnRole.RedClue:
        case TurnRole.BlueClue:
        case TurnRole.RedGuess:
        case TurnRole.BlueGuess:
            return true;
        default:
            return false;
    }
}


export interface None {}

export interface GameState {
    role_state: RoleState,
    turn_state: TurnState,
    health_state: HealthState,
    chests_5x5_state: ChestState[][],
}

export interface RoleState {
    role: TurnRole, // can't be TurnRole::{Starting, Over}
    red_cluer_taken: boolean | None,
    blue_cluer_taken: boolean | None,
}

export interface TurnState {
    turn: TurnRole, // can't be TurnRole::{Choosing}
    clue: string | None,
    guesses_remaining: number | None,
    proposed_guess: ProposedGuess,
}

export interface ProposedGuess {
    exists: boolean,
    x: number,
    y: number,
}

export interface HealthState {
    red_team_health: number,
    blue_team_health: number,
}

export interface ChestState {
    word: string,
    open: boolean,
    content: string, // empty, bomb1, bomb2, bomb5, sword1, sword2, heal3
}


const parse_game_state = (msg: string): GameState => {
    const parts = msg.split(':');
    const role_state = parse_role_state(parts[1]);
    const turn_state = parse_turn_state(parts[2]);
    const health_state = parse_health_state(parts[3]);
    const chests_5x5_state = parse_chests_5x5_state(parts[4]);
    //
    const game_state: GameState = {
        role_state,
        turn_state,
        health_state,
        chests_5x5_state,
    };
    return game_state;
}

const parse_turnrole = (msg: string, is_turn: boolean): TurnRole => {
    switch (msg) {
        case "tutorial":
            if (!is_turn) {
                throw new Error("role cannot be 'tutorial' (Starting)");
            }
            return TurnRole.Starting;
        case "over":
            if (!is_turn) {
                throw new Error("role cannot be 'over'");
            }
            return TurnRole.Over;
        case "choosing":
            if (is_turn) {
                throw new Error("turn cannot be 'choosing'");
            }
            return TurnRole.Choosing;
        case "redcluer":
        case "redcluing":
            return TurnRole.RedClue;
        case "redguesser":
        case "redguessing":
            return TurnRole.RedGuess;
        case "bluecluer":
        case "bluecluing":
            return TurnRole.BlueClue;
        case "blueguesser":
        case "blueguessing":
            return TurnRole.BlueGuess;
        case "none":
            return TurnRole.None;
        default:
            throw new Error("Invalid turn or role passed to parse_turnrole " + msg);
    }
}

const parse_role_state = (msg: string): RoleState => {
    const parts = msg.split(',');
    const role = parse_turnrole(parts[0], false);
    //
    const _choosing = role === TurnRole.Choosing;
    //
    const role_state: RoleState = {
        role,
        red_cluer_taken: _choosing ? (parts[1] === 'true' ? true : false) : {},
        blue_cluer_taken: _choosing ? (parts[2] === 'true' ? true : false) : {},
    };
    return role_state;
}

const parse_turn_state = (msg: string): TurnState => {
    const parts = msg.split(',');
    const turn = parse_turnrole(parts[0], true);
    //
    const _guessing = (turn === TurnRole.RedGuess || turn === TurnRole.BlueGuess);
    //
    const turn_state: TurnState = {
        turn,
        clue: _guessing ? parts[1] : {},
        guesses_remaining: _guessing ? parseInt(parts[2]) : {},
        proposed_guess: _guessing ? parse_proposed_guess(parts[3]) : none_proposed_guess(),
    };
    return turn_state;
}

const parse_proposed_guess = (msg: string): ProposedGuess => {
    const _exists = msg != "none";
    //
    const proposed_guess: ProposedGuess = {
        exists: _exists,
        x: _exists ? parseInt(msg[0]) : -1,
        y: _exists ? parseInt(msg[1]) : -1,
    };
    return proposed_guess;
}

const none_proposed_guess = (): ProposedGuess => {
    return {
        exists: false,
        x: -1,
        y: -1,
    }
}

const parse_health_state = (msg: string): HealthState => {
    const parts = msg.split(',');
    const health_state: HealthState = {
        red_team_health: parseInt(parts[0]),
        blue_team_health: parseInt(parts[1]),
    }
    return health_state;
}

const parse_chests_5x5_state = (msg: string): ChestState[][] => {
    const parts = msg.split(';');
    var chests_5x5_state: ChestState[][] = [];
    var flat_i = 0;
    for (let j = 0; j < 5; j++) {
        var chests_5: ChestState[] = [];
        for (let i = 0; i < 5; i++) {
            chests_5.push(parse_chest_state(parts[flat_i]));
            flat_i++;
        }
        chests_5x5_state.push(chests_5);
    }
    return chests_5x5_state;
}

const parse_chest_state = (msg: string): ChestState => {
    const parts = msg.split(',');
    const chest_state: ChestState = {
        word: parts[0],
        open: parts[1] === "open",
        content: parts[2],
    }
    return chest_state;
}

export const load_app = () => {
    init_popup();
    init_context();
    init_loading();
    init_menu();
    init_main_screen();
    init_end();
}


export const handle_message = () => {
    const ctx = get_context();
    if (ctx.wsMessage) {
        const msg = ctx.wsMessage;
        if (msg.startsWith('notify')) {
            console.log(msg);
        } else if (msg.startsWith('state')) {
            game_state = parse_game_state(msg);
            console.log(game_state);
            handle_new_state();
        } else {
            throw new Error("bad message start");
        }
        ctx.wsMessage = null;
    }
}

function handle_new_state() {
    if (game_state.turn_state.turn === TurnRole.Over) {
        set_state(OVER);
        fill_end();
        if (last_turnrole !== TurnRole.Over) {
            post_popup(HEADER_SD, INSTRUCTIONS_SD);
            last_turnrole = TurnRole.Over
        }
    } else if (game_state.turn_state.turn === TurnRole.Starting) {
        set_state(STARTING);
        if (last_turnrole !== TurnRole.Starting) {
            post_popup(HEADER_STARTING, INSTRUCTIONS_STARTING);
            last_turnrole = TurnRole.Starting;
        }
    } else if (game_state.role_state.role === TurnRole.Choosing) { // TODO: same shit as above
        set_state(MENU);
        set_menu_state(game_state.role_state);
        if (last_turnrole !== TurnRole.Choosing) {
            post_popup(HEADER_CHOOSING, INSTRUCTIONS_CHOOSING);
            last_turnrole = TurnRole.Choosing;
        }
    } else {
        set_state(GAME);
        fill_board(game_state.role_state.role, game_state.chests_5x5_state);
        const turnTeam = is_red(game_state.turn_state.turn) ? 'red' : 'blue';
        const roleTeam = is_red(game_state.role_state.role) ? 'red' : 'blue';
        if (turnTeam == roleTeam) {
            start_turn(game_state.turn_state);
            if (game_state.turn_state.turn != last_turnrole) {
                if (is_clue(game_state.role_state.role) && is_clue(game_state.turn_state.turn)) {
                    post_popup(HEADER_GIVE_CLUE, INSTRUCTIONS_GIVE_CLUE);
                } else if (is_guess(game_state.role_state.role) && is_guess(game_state.turn_state.turn)) {
                    const guesses = game_state.turn_state.guesses_remaining;
                    post_popup(HEADER_MAKE_GUESS.replace('<num>', String(guesses)),
                               INSTRUCTIONS_MAKE_GUESS.replace('<num>', String(guesses)));
                }
                last_turnrole = game_state.turn_state.turn;
            }
        } else {
            end_turn();
        }
        // LEFTOFF: post popup here unconditionally for now
    }
    
}

function deep_copy(obj: Object) {
    return JSON.parse(JSON.stringify(obj));
}
