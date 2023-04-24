import { buttons_add } from "../../controller_lib/button.js";
import { get_context, } from "../../controller_lib/init.js";
import { Rectangle } from "../../controller_lib/types/shapes.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { chest_clicked_giver, chest_clicked_guessser } from "../../utils/utils.js";
import { BOARD_H, BOARD_W, GUESSER } from "../interfaces.js";
import { Chest, construct_chest } from "./init_chest.js";
import { Overlay, construct_overlay_giver, construct_overlay_guesser } from "./init_overlay.js";
import { TopBar, construct_topbar } from "./init_topbar.js";

export interface Board {
    chests:((Chest)[])[];
    topbar:TopBar;
    buttons:(Button[])[];
    guessedWord: string | undefined;
    totalGuesses: number;
    currentGuesses: number;
    overlay:Overlay;
    showOverlay:boolean;
    clue:string | undefined;
}

let board:Board;

export const get_board = ():Board => {return board};

// const construct_chestGiver = (x:number, y: number, box:Rectangle) => {

// }


const construct_board_row = (row:number, boundingBox:Rectangle, data:any[], role:number): [Chest[], Button[]]  => {
    const chest_Arr: (Chest)[] = [];
    const button_Arr: Button[] = [];
    const gapx = get_context().dimensions.x / 16;

    for (let x = 0; x < BOARD_W; x += 1)
    {
        let newChest:Chest = construct_chest(x + (BOARD_W * row), boundingBox, data) ;
        let newButton:Button = new Button(
            {...boundingBox},
            undefined,
            (
                role == GUESSER
                    ? undefined
                    : chest_clicked_giver
            ),
            ( role == GUESSER ? chest_clicked_guessser : () => {get_board().showOverlay = false;})
        );
// The above both look terrible :(

        newButton.data = newChest;
        buttons_add(newButton);

        chest_Arr.push(newChest);
        button_Arr.push(newButton);
        boundingBox.x += gapx + boundingBox.w;
    }
    return [chest_Arr, button_Arr]
}

// role
// data :
// {[..., {state, contentId, asset}, ...]
//
// }
const construct_Board = (role:number, data:any[]) => {
    const ctx = get_context();

    let x: number;
    let y: number;

    const chests_arr : (Chest [])[] = [];
    const buttons_arr: (Button[])[] = [];
    const gapy = (ctx.dimensions.y - ctx.dimensions.y * 0.1) * 0.05;
    const gapx = (ctx.dimensions.x / 16);
    const boundingBox:Rectangle = {
            x: gapx,
            y: (ctx.dimensions.y * 0.2),
            h: (ctx.dimensions.y - ctx.dimensions.y * 0.12) / 8,
            w: ctx.dimensions.x / 8
        };

    for (y = 0; y < BOARD_H; y += 1)
    {
        const [chests, buttons] = construct_board_row(y, boundingBox, data, role);

        chests_arr.push(chests);
        buttons_arr.push(buttons);

        boundingBox.x = gapx;
        boundingBox.y += gapy + boundingBox.h;
        // arr.length = 10;
    };
    board.buttons = buttons_arr;
    board.chests = chests_arr;
}

export const init_main_screen = (role:number, data:any[]) =>
{
    board = {
        buttons: [],
        chests: [],
        topbar: construct_topbar(role),
        overlay: (role == GUESSER ? construct_overlay_guesser() : construct_overlay_giver()),
        guessedWord:undefined,
        totalGuesses: 4,
        currentGuesses:2,
        showOverlay: false,
        clue: undefined
    };
    construct_Board(role, data);
}
