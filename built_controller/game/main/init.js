import { get_context, } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG } from "../../controller_lib/types/drawables.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { get_asset } from "../../utils/assets.js";
import { size_grass } from "../../utils/render_utils.js";
import { TurnRole, is_guess } from "../../utils/state_handler.js";
import { chest_clicked_guessser } from "../../utils/utils.js";
import { BOARD_H, BOARD_W } from "../interfaces.js";
import { construct_chest, fill_chest, size_chest } from "./init_chest.js";
import { construct_topbar, size_topbar, fill_topbar } from "./topbar.js";
let board;
export const get_board = () => { return board; };
const fill_board_data = (role, chest_states) => {
    board.role = role;
    // selectors
    board.selector.red_sprite.image = get_asset('phone_select_red'); // TODO: may need to set src
    board.selector.blue_sprite.image = get_asset('phone_select_blue');
    //
    for (let j = 0; j < BOARD_H; j += 1) {
        for (let i = 0; i < BOARD_W; i += 1) {
            fill_chest(board.chests[j][i], chest_states[j][i], role);
            board.chests[j][i].x = j;
            board.chests[j][i].y = i;
            if (is_guess(role)) {
                board.buttons[j][i]._touchEndCallback = chest_clicked_guessser;
            }
        }
    }
};
const size_board = () => {
    const ctx = get_context();
    const cw = ctx.dimensions.x;
    const ch = ctx.dimensions.y;
    const startx = cw * 0.122;
    const dst = { x: startx, y: ch * 0.11,
        w: cw * 0.15, h: ch * 0.175 };
    for (let y = 0; y < BOARD_H; y += 1) {
        for (let x = 0; x < BOARD_W; x += 1) {
            board.chests[y][x].sprite.dst = { ...dst };
            board.chests[y][x].text.boundingBox = { ...dst };
            board.buttons[y][x]._boundingBox = { x: dst.x + cw * .02, y: dst.y + ch * .02,
                w: dst.w - cw * .04, h: dst.h - ch * .04 };
            dst.x += dst.w;
        }
        dst.x = startx;
        dst.y += dst.h;
    }
};
const construct_board_row = (row) => {
    const chest_Arr = [];
    const button_Arr = [];
    for (let x = 0; x < BOARD_W; x += 1) {
        let newChest = construct_chest(x + (BOARD_W * row));
        let newButton = new Button({ x: 0, y: 0, w: 0, h: 0 }, undefined, undefined, undefined);
        newButton.data = newChest;
        chest_Arr.push(newChest);
        button_Arr.push(newButton);
    }
    return [chest_Arr, button_Arr];
};
const construct_Board = () => {
    const chests_arr = [];
    const buttons_arr = [];
    for (let y = 0; y < BOARD_H; y += 1) {
        const [chests, buttons] = construct_board_row(y);
        chests_arr.push(chests);
        buttons_arr.push(buttons);
    }
    board.buttons = buttons_arr;
    board.chests = chests_arr;
};
export const init_main_screen = () => {
    board = {
        buttons: [],
        chests: [],
        selector: construct_selector(),
        topbar: construct_topbar(),
        guessedWord: undefined,
        totalGuesses: 4,
        currentGuesses: 2,
        clue: {},
        role: TurnRole.Starting,
    };
    construct_Board();
    size_main();
};
export const construct_selector = () => {
    const selector = {
        red: false,
        xIndex: -1,
        yIndex: -1,
        red_sprite: { ...DEFAULT_DRAWABLE_IMG, src: { x: 0, y: 0, w: 43, h: 35 } },
        blue_sprite: { ...DEFAULT_DRAWABLE_IMG, src: { x: 0, y: 0, w: 43, h: 35 } },
    };
    return selector;
};
export const size_main = () => {
    size_topbar(board.topbar);
    size_board();
    size_grass();
    board.chests.map((arr) => arr.map((e) => size_chest(e)));
};
export const fill_board = (role, data) => {
    if (!board) {
        init_main_screen();
    }
    console.log("filling board");
    board.bg = { ...DEFAULT_DRAWABLE_IMG, image: get_asset('keywords_background'), };
    //
    fill_topbar(board.topbar, role);
    fill_board_data(role, data);
    size_main();
};
