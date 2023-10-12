import { buttons_add, buttons_flush } from "../../controller_lib/button.js";
import { drawablesAdd } from "../../controller_lib/draw.js";
import { get_context } from "../../controller_lib/init.js";
import { Context } from "../../controller_lib/types/context.js";
import { DEFAULT_DRAWABLE_RECT } from "../../controller_lib/types/drawables.js";
import { Rectangle } from "../../controller_lib/types/shapes.js";
import { get_menu } from "../../utils/menu.js";
import { get_popup } from "../../utils/popup.js";
import { get_game_state, is_blue, is_clue, is_guess } from "../../utils/state_handler.js";
import { BOARD_H, BOARD_W } from "../interfaces.js";
import { Board, get_board } from "./init.js";
import { get_input } from "../../utils/input.js";


export const main_loop = () => {
    const board:Board = get_board();
    const ctx:Context = get_context();
    const popup = get_popup();
    const menu = get_menu();
    const role = get_game_state().role_state.role;
    const turn = get_game_state().turn_state.turn;
    const input = get_input();


    //////// Buttons ////////
    buttons_flush();

    // popup
    if (popup.show) {
        buttons_add(popup.x_button);
    }

    // input box
    else if (input.is_active) {
    }
    
    // menu
    else if (menu.show) {
        buttons_add(menu.x_button);        
    } else {

        // menu button
        buttons_add(menu.open_button);

        // guess accept/deny
        if (get_game_state().turn_state.proposed_guess.exists) {
            buttons_add(board.topbar.acceptButton);
            buttons_add(board.topbar.denyButton);
        }

        // key buttons
        else if (is_clue(role) && role === turn) {
            for (let i in board.topbar.keyButtons) {
                buttons_add(board.topbar.keyButtons[i]);
            }
        }

        // chests
        else if (is_guess(role) && role === turn) {
            for (let i = 0; i < BOARD_H; i += 1) {
                for (let j = 0; j < BOARD_W; j += 1) {
                    buttons_add(board.buttons[j][i]);
                }
            }
        }
    }

    //////// Drawables ////////
    // board
    if (board.bg) {
        drawablesAdd(board.bg);
    }
    const rect: Rectangle = {x: 0, y: 0, w: ctx.dimensions.x, h: ctx.dimensions.y};
    drawablesAdd({...DEFAULT_DRAWABLE_RECT, boundingBox: rect, color: is_blue(board.role) ? '#0000FF' : '#FF0000', stroke: 6})

    // chests
    for (let i = 0; i < BOARD_H; i += 1) {
        for (let j = 0; j < BOARD_W; j += 1) {
            drawablesAdd(board.chests[i][j].sprite);
            drawablesAdd(board.chests[i][j].text)
            if (is_clue(board.role) && !board.chests[i][j].state.open) {
                for (let obj of board.chests[i][j].contentimg) {
                    drawablesAdd(obj);
                }
            }
        }
    }

    // topbar (including key buttons)
    drawablesAdd(menu.open_sprite);
    drawablesAdd(board.topbar.text);
    if (is_clue(role) && role === turn) {
        for (let i in board.topbar.keyButtons) {
            drawablesAdd(board.topbar.keySprites[i]);
        }
    }
    if (get_game_state().turn_state.proposed_guess.exists) {
        drawablesAdd(board.topbar.accept);
        drawablesAdd(board.topbar.deny);
    }
    if (!board.guessedWord) {
        drawablesAdd(board.topbar.subText);
    }

    // selector
    if (get_game_state().turn_state.proposed_guess.exists && board.role === get_game_state().turn_state.turn) {
        if (board.selector.red) {
            drawablesAdd(board.selector.red_sprite);
        } else {
            drawablesAdd(board.selector.blue_sprite);
        }
    }

    // popup
    if (popup.show) {
        drawablesAdd(popup.base_sprite);
        drawablesAdd(popup.x_sprite);
        drawablesAdd(popup.header);
        drawablesAdd(popup.message);
    }

    // menu
    else if (menu.show) {
        drawablesAdd(menu.container_sprite);
        drawablesAdd(menu.x_sprite);
        drawablesAdd(menu.header);
    }
}
