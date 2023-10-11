import { buttons_add } from "../../controller_lib/button.js";
import { get_context, } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG, DrawableImage } from "../../controller_lib/types/drawables.js";
import { Rectangle } from "../../controller_lib/types/shapes.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { get_asset } from "../../utils/assets.js";
import { size_grass } from "../../utils/render_utils.js";
import { ChestState, None, TurnRole, is_guess } from "../../utils/state_handler.js";
import { cancel_clicked, chest_clicked_giver, chest_clicked_guessser } from "../../utils/utils.js";
import { BOARD_H, BOARD_W, GIVER } from "../interfaces.js";
import { Chest, construct_chest, fill_chest, size_chest } from "./init_chest.js";
import { Overlay, construct_overlay, fill_overlay, size_overlay } from "./init_overlay.js";
import { TopBar, construct_topbar, fill_topbar, size_topbar } from "./init_topbar.js";

export interface Selector {
    red:boolean,
    xIndex:number,
    yIndex:number,
    red_sprite:DrawableImage;
    blue_sprite:DrawableImage;
}

export interface Popup {
    show: boolean,
    base_sprite: DrawableImage,
    x_sprite: DrawableImage,
    x_button: Button,
}

export interface Board {
    chests: Chest[][];
    topbar: TopBar;
    buttons: Button[][];
    selector: Selector;
    guessedWord: string | undefined;
    totalGuesses: number;
    currentGuesses: number | None;
    overlay: Overlay;
    showOverlay: boolean;
    clue: string | None;
    role: TurnRole,
    popup: Popup,
    bg?: DrawableImage
}

let board:Board;
export const get_board = ():Board => {return board};

const fill_board_data = (role: TurnRole, chest_states: ChestState[][]) => {
    board.role = role;
    // selectors
    board.selector.red_sprite.image = get_asset('phone_select_red'); // TODO: may need to set src
    board.selector.blue_sprite.image = get_asset('phone_select_blue');
    //
    for (let j = 0; j < BOARD_H; j += 1) {
        for (let i = 0; i < BOARD_W; i += 1) {
            fill_chest(board.chests[j][i], chest_states[j][i], role);
            board.chests[j][i].x = j; // Not going to go fix whatever is causing this
            board.chests[j][i].y = i;
            if (is_guess(role)) {
                board.buttons[j][i]._touchEndCallback = chest_clicked_guessser;
            } else if (role == GIVER) {
                board.buttons[j][i]._touchStartCallback = chest_clicked_giver;
                board.buttons[j][i]._touchEndCallback = () => {get_board().showOverlay = false;};

            }
            buttons_add(board.buttons[j][i]);
        }
    }
}

const size_board = () => {
    const ctx = get_context();
    const gapy = ctx.dimensions.y * 0.0001;
    const gapx = 0;
    const boundingBox:Rectangle = {
            x:  ctx.dimensions.y * 0.15,
            y: (ctx.dimensions.y * 0.05),
            h: (ctx.dimensions.y * 0.185),
            w: ctx.dimensions.x * 0.172
        };
    for (let y = 0; y < BOARD_H; y += 1) {
        for (let x = 0; x < BOARD_W; x += 1) {
            board.chests[y][x].sprite.dst = {...boundingBox}
            board.chests[y][x].text.boundingBox = {...boundingBox}
            board.buttons[y][x]._boundingBox = {...boundingBox}
            boundingBox.x += gapx + boundingBox.w;
        }
        boundingBox.x = ctx.dimensions.y * 0.15;
        boundingBox.y += gapy + boundingBox.h + 2;
    }
    size_popup();
}


const construct_board_row = (row:number): [Chest[], Button[]]  => {
    const chest_Arr: (Chest)[] = [];
    const button_Arr: Button[] = [];

    for (let x = 0; x < BOARD_W; x += 1) {
        let newChest:Chest = construct_chest(x + (BOARD_W * row)) ;
        let newButton:Button = new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined);

        newButton.data = newChest;
        newButton._active = false;
        buttons_add(newButton);
        chest_Arr.push(newChest);
        button_Arr.push(newButton);
    }
    return [chest_Arr, button_Arr]
}

// role
// data :
// {[..., {state, contentId, asset}, ...]
//
// }
const construct_Board = () => {
    const ctx = get_context();
    const chests_arr : (Chest [])[] = [];
    const buttons_arr: (Button[])[] = [];

    for (let y = 0; y < BOARD_H; y += 1) {
        const [chests, buttons] = construct_board_row(y);

        chests_arr.push(chests);
        buttons_arr.push(buttons);
    };
    board.buttons = buttons_arr;
    board.chests = chests_arr;
}


export const init_main_screen = () => {
    board = {
        buttons: [],
        chests: [],
        selector: construct_selector(),
        topbar: construct_topbar(),
        overlay: construct_overlay(),
        guessedWord:undefined,
        totalGuesses: 4,
        currentGuesses:2,
        showOverlay: false,
        clue: {},
        role: TurnRole.Starting,
        popup: construct_popup(),
    };
    construct_Board();
    size_main();
}


export const construct_selector = ():Selector => {
    const selector:Selector = {
        red: false,
        xIndex:-1,
        yIndex:-1,
        red_sprite:{...DEFAULT_DRAWABLE_IMG, src: {x:0, y:0, w:43, h:35}},
        blue_sprite:{...DEFAULT_DRAWABLE_IMG, src: {x:0, y:0, w:43, h:35}},
    }
    return selector;
}

export const size_main = () => {
    size_topbar(board.topbar);
    size_overlay(board.overlay, board.role);
    size_board();
    size_grass();
    board.chests.map((arr) => arr.map((e) => size_chest(e)))
}

export const fill_board = (role:TurnRole, data:any[]) => {
    if (!board) {
        init_main_screen();
    }
    console.log("filling board")
    board.bg = {...DEFAULT_DRAWABLE_IMG, image: get_asset('keywords_background'), }
    //
    fill_popup();
    fill_topbar(board.topbar, role);
    fill_overlay(board.overlay, role);
    fill_board_data(role, data);
    size_main();
}

function construct_popup(): Popup {
    var button = new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined);
    button._active = false;
    buttons_add(button);
    return {
        show: false,
        base_sprite: {...DEFAULT_DRAWABLE_IMG },
        x_sprite: {...DEFAULT_DRAWABLE_IMG },
        x_button: button,
    }
}

function size_popup() {
    const ctx = get_context();
    const base_box: Rectangle = {
        x: ctx.dimensions.x * 0.16,
        y: ctx.dimensions.y * 0.16,
        w: ctx.dimensions.x * 0.68,
        h: ctx.dimensions.y * 0.64,
    };
    board.popup.base_sprite.dst = base_box;
    const x_box: Rectangle = {
        x: base_box.x + base_box.w * (186/200),
        y: base_box.y + base_box.h * (3/100),
        w: base_box.w * (11/200),
        h: base_box.h * (11/100),
    }
    board.popup.x_sprite.dst = x_box;
    board.popup.x_button._boundingBox = base_box;
}

function fill_popup() {
    board.popup.base_sprite.image = get_asset('popup');
    board.popup.base_sprite.src = {x:0, y:0, w:200, h:100};
    board.popup.x_sprite.image = get_asset('x');
    board.popup.x_sprite.src = {x:0, y:0, w:11, h:11};
    board.popup.x_button._touchStartCallback = cancel_clicked;
}
