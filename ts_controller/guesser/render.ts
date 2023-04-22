

import { drawablesAdd} from "../controller_lib/draw.js";
import { get_board } from "./init.js";
import { BOARD_H, BOARD_W, Board } from "./interfaces.js";


export const main_loop = () => {
    const board:Board = get_board();

    drawablesAdd(board.background);
    for (let i = 0; i < BOARD_H; i += 1)
        for (let j = 0; j < BOARD_W; j += 1)
        {
            drawablesAdd(board.chests[i][j].sprite);
            drawablesAdd(board.chests[i][j].text)
        }
    drawablesAdd(board.topbar.text);
    if (board.guessedWord)
    {
        drawablesAdd(board.topbar.accept);
        drawablesAdd(board.topbar.deny);
    }
    else
        drawablesAdd(board.topbar.subText);
    if (board.showOverlay)
    {
        drawablesAdd(board.overlay.shadow);
        drawablesAdd(board.overlay.box);
        drawablesAdd(board.overlay.exitSprite);
        drawablesAdd(board.overlay.text);
        drawablesAdd(board.overlay.subtext);
        drawablesAdd(board.overlay.item);
    }
}
