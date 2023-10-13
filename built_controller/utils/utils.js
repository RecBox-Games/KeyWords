import { get_context } from "../controller_lib/init.js";
import { get_board } from "../game/main/init.js";
import { BOARD_W } from "../game/interfaces.js";
import { is_guess, is_blue, is_clue } from "./state_handler.js";
import { get_input, show_input, hide_input, clear_input } from "./input.js";
export const chest_clicked_guessser = (self) => {
    const board = get_board();
    const ctx = get_context();
    if (board.guessedWord) {
        console.log("Someone already guessed a word, accept or deny ", board.guessedWord);
        return;
    }
    ctx.ws.send('input:guess' + ',' + ((self.data.x) | 0).toString() +
        ',' + ((self.data.y) | 0).toString());
};
export const start_turn = (turn_state) => {
    const board = get_board();
    const input = get_input();
    board.currentGuesses = turn_state.guesses_remaining;
    board.clue = turn_state.clue;
    if (is_guess(board.role)) {
        console.log("active input:" + input.is_active);
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
                }
                else {
                    board.selector.red = true;
                    board.selector.red_sprite.dst = selector_dst;
                }
            }
            else {
                let clueText = typeof board.clue === "string" ? board.clue : '';
                let guessesText = board.currentGuesses.toString();
                board.topbar.text.text = "Your clue: " + clueText + '   ' + "Keys: " + guessesText;
            }
        }
        else {
            board.topbar.text.text = "Waiting for a clue...";
            board.currentGuesses = 0;
            board.totalGuesses = 0;
            board.clue = {};
            board.topbar.subText.text = "";
        }
    }
    else if (is_clue(board.role)) {
        if (board.role === turn_state.turn) {
            board.topbar.text.text = 'Give your team some keys.';
            //if(is_blue(board.role)) set_blue_input_border();
            //else set_red_input_border();
            clear_input();
            show_input();
        }
        else {
            const guesses = board.currentGuesses.toString();
            const plur = guesses == '1' ? "key" : "keys";
            board.topbar.subText.text = '';
            board.topbar.text.text = 'Your team has ' + guesses + ' ' + plur + ' left';
            if (input)
                hide_input();
        }
    }
};
export const end_turn = () => {
    const board = get_board();
    board.topbar.text.text = "Other team's turn";
    board.topbar.subText.text = "";
    board.currentGuesses = 0;
    board.totalGuesses = 0;
};
export const open_chest = (id) => {
    const board = get_board();
    const x = id % BOARD_W;
    const y = (id / BOARD_W) | 0; // | 0 to take the integer part, more efficient than floor or ceil
    // add_animation({object: board.chests[y][x].sprite, animate_fn: (object:Animation) => {object = }})
    board.chests[y][x].state.open = true;
};
export const confirm_guess = () => {
    const board = get_board();
    const ctx = get_context();
    ctx.ws.send('input:second,support');
    board.topbar.text.text = "Remaining Guesses " + board.currentGuesses.toString();
    board.guessedWord = undefined;
};
export const deny_guess = () => {
    const board = get_board();
    const ctx = get_context();
    ctx.ws.send('input:second,dissent');
    board.topbar.text.text = "Remaining Guesses " + board.currentGuesses.toString();
    board.guessedWord = undefined;
    console.log("deny");
};