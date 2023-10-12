import { get_context } from "../controller_lib/init.js";
import { Button } from "../controller_lib/types/triggerable.js";
import { Board, get_board } from "../game/main/init.js";
import { BOARD_H, BOARD_W } from "../game/interfaces.js";
import { Chest } from "../game/main/init_chest.js";
import { TurnState, is_guess, is_blue, is_clue } from "./state_handler.js";

export const chest_clicked_guessser = (self:Button) => {
    const board:Board = get_board();
    const ctx = get_context();
    if (board.guessedWord) {
        console.log("Someone already guessed a word, accept or deny ", board.guessedWord);
        return ;
    }
    ctx.ws.send('input:guess' + ',' + (((self.data as Chest).x) | 0).toString() +
        ',' +  (((self.data as Chest).y) | 0).toString())
}

export const start_turn = (turn_state: TurnState) =>
{
    const board:Board = get_board();


    board.currentGuesses = turn_state.guesses_remaining;
    board.clue = turn_state.clue;
    if (is_guess(board.role)) {
        if (board.role === turn_state.turn) {
            if (turn_state.proposed_guess.exists) {
                board.topbar.subText.text = "";
                board.topbar.text.text = "Validate guess ?";
                const x = turn_state.proposed_guess.x;
                const y = turn_state.proposed_guess.y;
                board.selector.xIndex = x;
                board.selector.yIndex = y;
                var selector_dst = Object.assign({}, board.chests[x][y].sprite.dst);
                if (selector_dst && selector_dst.w) {
                    selector_dst.x -= 2;
                    selector_dst.y += 5;
                    selector_dst.w += 13;
                    selector_dst.h += 7;
                }
                if (is_blue(board.role)) {
                    board.selector.red = false;
                    board.selector.blue_sprite.dst = selector_dst;
                } else {
                    board.selector.red = true;
                    board.selector.red_sprite.dst = selector_dst;
                } 
            } else {
                board.topbar.text.text = "Remaining Guesses " + board.currentGuesses.toString();
            }
        } else {
            board.topbar.text.text = "Waiting for a clue...";
            board.currentGuesses = 0;
            board.totalGuesses = 0;
            board.clue = {};
            board.topbar.subText.text = "";
        }
    } else if (is_clue(board.role)) {
        if (board.role === turn_state.turn) {
            board.topbar.text.text = 'Your turn. Give you team some keys.';
        } else {
            board.topbar.subText.text = '';
            board.topbar.text.text = 'Your team has ' + board.currentGuesses.toString() + ' guesses remaining';
        }
    }
}

export const end_turn = () =>
{
    const board:Board = get_board();
    board.topbar.text.text = "Other team's turn";
    board.topbar.subText.text = "";
    board.currentGuesses = 0;
    board.totalGuesses = 0;
}

export const open_chest = (id:number) => {
    const board:Board = get_board();
    const x = id % BOARD_W;
    const y = (id / BOARD_W) | 0; // | 0 to take the integer part, more efficient than floor or ceil

    // add_animation({object: board.chests[y][x].sprite, animate_fn: (object:Animation) => {object = }})
    board.chests[y][x].state.open = true;
}

export const confirm_guess = () => {
    const board:Board = get_board();
    const ctx = get_context();

    ctx.ws.send('input:second,support');
    board.topbar.text.text = "Remaining Guesses " + board.currentGuesses.toString();
    board.guessedWord = undefined;
}

export const deny_guess = () => {
    const board:Board = get_board();
    const ctx = get_context();

    ctx.ws.send('input:second,dissent');
    board.topbar.text.text = "Remaining Guesses " + board.currentGuesses.toString();
    board.guessedWord = undefined;
    console.log("deny")
}

export const confirm_clue = (amount:number) => {
    const board:Board = get_board();
    const ctx = get_context();

    board.topbar.text.text = "You gave your team " + amount.toString() + ' keys';
    ctx.ws.send("input:clue," + 'none' + "," + amount.toString());
}
