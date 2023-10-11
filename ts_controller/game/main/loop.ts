import { drawablesAdd } from "../../controller_lib/draw.js";
import { get_context } from "../../controller_lib/init.js";
import { Context } from "../../controller_lib/types/context.js";
import { DEFAULT_DRAWABLE_RECT } from "../../controller_lib/types/drawables.js";
import { Rectangle } from "../../controller_lib/types/shapes.js";
import { get_popup } from "../../utils/popup.js";
import { get_game_state, is_blue, is_clue } from "../../utils/state_handler.js";
import { BOARD_H, BOARD_W } from "../interfaces.js";
import { Board, get_board } from "./init.js";


export const main_loop = () => {
    const board:Board = get_board();
    const ctx:Context = get_context();
    const rect:Rectangle = {x: 0, y: 0, w: ctx.dimensions.x, h: ctx.dimensions.y};

    if (board.bg)
        drawablesAdd(board.bg);
    drawablesAdd({...DEFAULT_DRAWABLE_RECT, boundingBox: rect, color: is_blue(board.role) ? '#0000FF' : '#FF0000', stroke: 6})
    // drawablesAdd(board.topbar.exit);
    for (let i = 0; i < BOARD_H; i += 1)
        for (let j = 0; j < BOARD_W; j += 1)
        {
            drawablesAdd(board.chests[i][j].sprite);
            drawablesAdd(board.chests[i][j].text)
            if (is_clue(board.role) && !board.chests[i][j].state.open)
            {
                for (let obj of board.chests[i][j].contentimg)
                    drawablesAdd(obj);
            }
        }
    drawablesAdd(board.topbar.text);
    for (let i in board.topbar.clueCount) {
        if (board.topbar.clueCount[i]._active) {
            drawablesAdd(board.topbar.clueSprites[i]);
        }
    }
    if (get_game_state().turn_state.proposed_guess.exists && board.role === get_game_state().turn_state.turn) {
        if (board.selector.red) {
            drawablesAdd(board.selector.red_sprite);         
        } else {
            drawablesAdd(board.selector.blue_sprite);            
        }
    }
    if (!board.guessedWord) {
        drawablesAdd(board.topbar.subText);
    }
    if (board.topbar.acceptButton._active)
        drawablesAdd(board.topbar.accept);
    if (board.topbar.denyButton._active)
        drawablesAdd(board.topbar.deny);
    if (board.showOverlay) {
        // if (board.overlay.shadow)
        //     drawablesAdd(board.overlay.shadow);
        drawablesAdd(board.overlay.box);
        drawablesAdd(board.overlay.subtext);
        drawablesAdd(board.overlay.item);
    }
    const popup = get_popup();
    if (popup.show) {
        drawablesAdd(popup.base_sprite);
        drawablesAdd(popup.x_sprite);
        drawablesAdd(popup.header);
        drawablesAdd(popup.message);
    }
}
