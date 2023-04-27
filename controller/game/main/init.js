import { buttons_add, buttons_log } from "../../controller_lib/button.js";
import { get_context, } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG } from "../../controller_lib/types/drawables.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { get_asset } from "../../utils/assets.js";
import { chest_clicked_giver, chest_clicked_guessser } from "../../utils/utils.js";
import { BOARD_H, BOARD_W, GIVER, GUESSER } from "../interfaces.js";
import { construct_chest, fill_chest } from "./init_chest.js";
import { construct_overlay, fill_overlay, size_overlay } from "./init_overlay.js";
import { construct_topbar, fill_topbar, size_topbar } from "./init_topbar.js";
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
                board.buttons[y][x]._touchStartCallback = chest_clicked_giver;
                board.buttons[y][x]._touchEndCallback = () => { get_board().showOverlay = false; };
            }
            buttons_add(board.buttons[y][x]);
        }
    }
};
const size_board = () => {
    const ctx = get_context();
    const gapy = (ctx.dimensions.y - ctx.dimensions.y * 0.1) * 0.013;
    const gapx = (ctx.dimensions.x / 40);
    const boundingBox = {
        x: gapx,
        y: (ctx.dimensions.y * 0.13),
        h: (ctx.dimensions.y - ctx.dimensions.y * 0.12) / 5.4,
        w: ctx.dimensions.x / 6
    };
    for (let y = 0; y < BOARD_H; y += 1) {
        for (let x = 0; x < BOARD_W; x += 1) {
            board.chests[y][x].sprite.dst = { ...boundingBox };
            board.chests[y][x].text.boundingBox = { ...boundingBox };
            board.buttons[y][x]._boundingBox = { ...boundingBox };
            boundingBox.x += gapx + boundingBox.w;
        }
        boundingBox.x = gapx;
        boundingBox.y += gapy + boundingBox.h;
    }
};
const construct_board_row = (row) => {
    const chest_Arr = [];
    const button_Arr = [];
    for (let x = 0; x < BOARD_W; x += 1) {
        let newChest = construct_chest(x + (BOARD_W * row));
        let newButton = new Button({ x: 0, y: 0, w: 0, h: 0 }, undefined, undefined, undefined);
        newButton.data = newChest;
        newButton._active = false;
        buttons_add(newButton);
        chest_Arr.push(newChest);
        button_Arr.push(newButton);
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
    const chests_arr = [];
    const buttons_arr = [];
    for (let y = 0; y < BOARD_H; y += 1) {
        const [chests, buttons] = construct_board_row(y);
        chests_arr.push(chests);
        buttons_arr.push(buttons);
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
    size_main();
};
export const size_main = () => {
    size_topbar(board.topbar);
    size_overlay(board.overlay, board.role);
    size_board();
};
export const fill_board = (role, team, data) => {
    // buttons_flush();
    if (!board)
        init_main_screen();
    console.log("filling board");
    buttons_log();
    board.bg = { ...DEFAULT_DRAWABLE_IMG, image: get_asset('keywords_background'), };
    fill_topbar(board.topbar, role);
    fill_overlay(board.overlay, role);
    fill_board_data(role, team, data);
    // buttons_log();
};
