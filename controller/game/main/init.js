import { buttons_add } from "../../controller_lib/button.js";
import { get_context, } from "../../controller_lib/init.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { chest_clicked_giver, chest_clicked_guessser } from "../../utils/utils.js";
import { BOARD_H, BOARD_W, GIVER, GUESSER } from "../interfaces.js";
import { construct_chest, fill_chest } from "./init_chest.js";
import { construct_overlay, fill_overlay } from "./init_overlay.js";
import { construct_topbar, fill_topbar } from "./init_topbar.js";
let board;
export const get_board = () => { return board; };
// const construct_chestGiver = (x:number, y: number, box:Rectangle) => {
// }
const fill_board_data = (role, team, data) => {
    board.team = team;
    board.role = role;
    for (let y = 0; y < BOARD_H; y += 1) {
        for (let x = 0; x < BOARD_W; x += 1) {
            fill_chest(board.chests[y][x], data[x + BOARD_W * y]);
            if (role == GUESSER) {
                board.buttons[y][x]._touchEndCallback = chest_clicked_guessser;
            }
            else if (role == GIVER) {
                board.buttons[y][x]._hoverCallback = chest_clicked_giver;
                board.buttons[y][x]._touchEndCallback = () => { get_board().showOverlay = false; };
                board.buttons[y][x]._active = true;
            }
            buttons_add(board.buttons[y][x]);
        }
    }
};
const construct_board_row = (row, boundingBox) => {
    const chest_Arr = [];
    const button_Arr = [];
    const gapx = get_context().dimensions.x / 16;
    for (let x = 0; x < BOARD_W; x += 1) {
        let newChest = construct_chest(x + (BOARD_W * row), boundingBox);
        let newButton = new Button({ ...boundingBox }, undefined, undefined, undefined);
        newButton.data = newChest;
        buttons_add(newButton);
        chest_Arr.push(newChest);
        button_Arr.push(newButton);
        boundingBox.x += gapx + boundingBox.w;
    }
    return [chest_Arr, button_Arr];
};
// role
// data :
// {[..., {state, contentId, asset}, ...]
//
// }
const construct_Board = () => {
    const ctx = get_context();
    let x;
    let y;
    const chests_arr = [];
    const buttons_arr = [];
    const gapy = (ctx.dimensions.y - ctx.dimensions.y * 0.1) * 0.05;
    const gapx = (ctx.dimensions.x / 16);
    const boundingBox = {
        x: gapx,
        y: (ctx.dimensions.y * 0.2),
        h: (ctx.dimensions.y - ctx.dimensions.y * 0.12) / 8,
        w: ctx.dimensions.x / 8
    };
    for (y = 0; y < BOARD_H; y += 1) {
        const [chests, buttons] = construct_board_row(y, boundingBox);
        chests_arr.push(chests);
        buttons_arr.push(buttons);
        boundingBox.x = gapx;
        boundingBox.y += gapy + boundingBox.h;
        // arr.length = 10;
    }
    ;
    board.buttons = buttons_arr;
    board.chests = chests_arr;
};
export const init_main_screen = () => {
    board = {
        buttons: [],
        chests: [],
        topbar: construct_topbar(),
        overlay: construct_overlay(),
        guessedWord: undefined,
        totalGuesses: 4,
        currentGuesses: 2,
        showOverlay: false,
        clue: undefined,
        team: -1,
        role: -1
    };
    construct_Board();
};
export const fill_board = (role, team, data) => {
    if (!board)
        init_main_screen();
    console.log("chests", data);
    fill_topbar(board.topbar, role);
    fill_overlay(board.overlay, role);
    fill_board_data(role, team, data);
};
