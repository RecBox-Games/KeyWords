import { drawablesAdd } from "../controller_lib/draw.js";
import { get_context } from "../controller_lib/init.js";
import { get_board } from "./init.js";
import { BOARD_H, BOARD_W } from "./interfaces.js";
import { parse_message } from "./utils.js";
export const main_loop = () => {
    const board = get_board();
    const ctx = get_context();
    if (ctx.wsMessage) {
        parse_message(ctx.wsMessage);
        ctx.wsMessage = null;
    }
    for (let i = 0; i < BOARD_H; i += 1)
        for (let j = 0; j < BOARD_W; j += 1) {
            drawablesAdd(board.chests[i][j].sprite);
            drawablesAdd(board.chests[i][j].text);
        }
    drawablesAdd(board.topbar.text);
    if (!board.guessedWord) {
        drawablesAdd(board.topbar.subText);
    }
    if (board.topbar.acceptButton._active)
        drawablesAdd(board.topbar.accept);
    if (board.topbar.denyButton._active)
        drawablesAdd(board.topbar.deny);
    if (board.showOverlay) {
        if (board.overlay.shadow)
            drawablesAdd(board.overlay.shadow);
        drawablesAdd(board.overlay.box);
        if (board.overlay.exitSprite)
            drawablesAdd(board.overlay.exitSprite);
        drawablesAdd(board.overlay.text);
        drawablesAdd(board.overlay.subtext);
        drawablesAdd(board.overlay.item);
    }
};
