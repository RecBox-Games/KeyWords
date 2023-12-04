import { get_context } from "../controller_lib/init.js";
import { Button } from "../controller_lib/types/triggerable.js";
import { Board, get_board } from "../game/main/init.js";
import { BOARD_W } from "../game/interfaces.js";
import { Chest } from "../game/main/init_chest.js";
import {game_over, TurnState, is_guess, is_blue, is_clue } from "./state_handler.js";

import { Input, get_input, show_input, hide_input, clear_input } from "./input.js";
import { get_popup } from "./popup.js";
import { get_menu } from "./menu.js";
import { get_confirmation } from "./confirmation.js";
import { drawablesAdd } from "../controller_lib/draw.js";
import { buttons_add } from "../controller_lib/button.js";
import { get_submit_button } from "./submit_button.js";


export const chest_clicked_guessser = (self: Button) => {
    const board: Board = get_board();
    const ctx = get_context();
    if (board.guessedWord) {
        console.log("Someone already guessed a word, accept or deny ", board.guessedWord);
        return;
    }
    ctx.ws.send('input:guess' + ',' + (((self.data as Chest).x) | 0).toString() +
        ',' + (((self.data as Chest).y) | 0).toString())
}

export const start_turn = (turn_state: TurnState) => {
    const board: Board = get_board();
    const input: Input = get_input();
    board.currentGuesses = turn_state.guesses_remaining;
    board.clue = turn_state.clue;
    if (is_guess(board.role)) {
        console.log("active input:" + input.is_active);
        if (board.role === turn_state.turn) {
            if (turn_state.proposed_guess.exists) {
                board.topbar.subText.text = "";
                const chosen_x = turn_state.proposed_guess.x;
                const chosen_y = turn_state.proposed_guess.y
                const chosen_word = board.chests[chosen_x][chosen_y].text.text;
                board.topbar.text.text = "'" + chosen_word + "' chosen";
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
            } else {
                let clueText = "Your clue: " + board.clue;
                let guessesText = board.currentGuesses.toString();
                let keysText = "Keys: " + guessesText;
                let verbalClueText = "Verbal clue   ";                
                board.topbar.text.text =  board.clue ? clueText + '   ' + keysText : verbalClueText + keysText;
            }
        }
        else if (!game_over()) {
            board.topbar.text.text = "Waiting for a clue";
            board.currentGuesses = 0;
            board.totalGuesses = 0;
            board.clue = {};
            board.topbar.subText.text = "";
        }
        else{
           board.topbar.text.text = "GAME OVER";
        }
    }
    else if (is_clue(board.role)) {
        if (board.role === turn_state.turn) {
           
             board.topbar.text.text = 'Give your team some keys';
            //if(is_blue(board.role)) set_blue_input_border();
            //else set_red_input_border();            
            clear_input();
            show_input();

        }
        else if (!game_over()){
                const guesses = board.currentGuesses.toString();
                console.log(guesses);
                const plur = guesses == '1' ? "key" : "keys";
                board.topbar.subText.text = '';
            
                board.topbar.text.text = 'Your team has ' + guesses + ' ' + plur + ' left';
                if (input) hide_input();
        }
        else{
            board.topbar.text.text = "GAME OVER";
        }
    }
}

export const end_turn = () => {
    const board: Board = get_board();
    board.topbar.text.text = "Other team's turn";
    board.topbar.subText.text = "";
    board.currentGuesses = 0;
    board.totalGuesses = 0;
    
    if(!game_over()){
        board.topbar.text.text = "Other team's turn";
    }
    else{
        board.topbar.text.text = "GAME OVER";
    }
    
    
}

export const open_chest = (id: number) => {
    const board: Board = get_board();
    const x = id % BOARD_W;
    const y = (id / BOARD_W) | 0; // | 0 to take the integer part, more efficient than floor or ceil

    // add_animation({object: board.chests[y][x].sprite, animate_fn: (object:Animation) => {object = }})
    board.chests[y][x].state.open = true;
}

export const confirm_guess = () => {
    const board: Board = get_board();
    const ctx = get_context();

    ctx.ws.send('input:second,support');
    board.topbar.text.text = "Remaining Guesses " + board.currentGuesses.toString();
    board.guessedWord = undefined;
}

export const deny_guess = () => {
    const board: Board = get_board();
    const ctx = get_context();

    ctx.ws.send('input:second,dissent');
    board.topbar.text.text = "Remaining Guesses " + board.currentGuesses.toString();
    board.guessedWord = undefined;
    console.log("deny")
}


// returns true iff a menu/popup is open or input box is active
export function buttons_add_menus() {
    let popup = get_popup();
    let menu = get_menu();
    let confirmation = get_confirmation();
    let input = get_input();
    let submit_button = get_submit_button();

    /*let help = get_help();

    // help
    drawablesAdd(help.help_sprite);
*/
    
    // submit
    if (submit_button.is_active && !input.is_active) {
        buttons_add(submit_button.button);
    }

    // confirmation
    if (confirmation.is_showing) {
        buttons_add(confirmation.confirm_button);
        buttons_add(confirmation.cancel_button);
        return true;
    }
    
    // popup
    if (popup.is_showing) {
        buttons_add(popup.gotit_button);
        buttons_add(popup.exit_button);
        return true;
    }

    // input box
    if (input.is_active) {
        return true;
    }
    
    // menu
    if (menu.is_showing) {
        buttons_add(menu.x_button);        
        buttons_add(menu.end_game_button);        
        buttons_add(menu.toggle_walkthrough_button);
        return true;
    }
}

export function drawables_add_menus() {
    let popup = get_popup();
    let menu = get_menu();
    let confirmation = get_confirmation();

    /*let help = get_help();

    // help
    drawablesAdd(help.help_sprite);
    */
    
    // popup
    if (popup.is_showing) {
        drawablesAdd(popup.base_sprite);
        drawablesAdd(popup.gotit_sprite);
        drawablesAdd(popup.header);
        drawablesAdd(popup.message);
    }

    // menu
    if (menu.is_showing) {
        drawablesAdd(menu.container_sprite);
        drawablesAdd(menu.x_sprite);
        drawablesAdd(menu.header);
        drawablesAdd(menu.end_game_sprite);
        drawablesAdd(menu.toggle_walkthrough_sprite);
        if (menu.is_tut_enabled) {
            drawablesAdd(menu.tut_enabled_sprite);
        } else {
            drawablesAdd(menu.tut_disabled_sprite);
        }
    }

    // confirmation
    if (confirmation.is_showing) {
        drawablesAdd(confirmation.container_sprite);
        drawablesAdd(confirmation.message);
        drawablesAdd(confirmation.confirm_sprite);
        drawablesAdd(confirmation.cancel_sprite);
    }

}
