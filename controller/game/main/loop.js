import { drawablesAdd } from "../../controller_lib/draw.js";
import { BOARD_H, BOARD_W, GIVER } from "../interfaces.js";
import { get_board } from "./init.js";
export const main_loop = () => {
    const board = get_board();
    if (board.bg)
        drawablesAdd(board.bg);
    // render_grass();
    // drawablesAdd(board.topbar.exit);
    for (let i = 0; i < BOARD_H; i += 1)
        for (let j = 0; j < BOARD_W; j += 1) {
            drawablesAdd(board.chests[i][j].sprite);
            drawablesAdd(board.chests[i][j].text);
            if (board.role == GIVER && !board.chests[i][j].open) {
                for (let obj of board.chests[i][j].contentimg)
                    drawablesAdd(obj);
                // drawablesAdd(board.chests[i][j].contentimg);
            }
        }
    drawablesAdd(board.topbar.text);
    for (let i in board.topbar.clueCount) {
        if (board.topbar.clueCount[i]._active) {
            drawablesAdd(board.topbar.clueSprites[i]);
            // console.log("ACTIVE",i, board.topbar.clueSprites[i].dst )
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
        if (board.overlay.shadow)
            drawablesAdd(board.overlay.shadow);
        drawablesAdd(board.overlay.box);
        // if (board.overlay.exitSprite)
        //     drawablesAdd(board.overlay.exitSprite);
        drawablesAdd(board.overlay.text);
        drawablesAdd(board.overlay.subtext);
        drawablesAdd(board.overlay.item);
    }
    // render_chest_grass();
    // animate_grass();
};
