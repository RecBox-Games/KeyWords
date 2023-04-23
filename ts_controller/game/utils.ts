
import { Rectangle } from "../controller_lib/types/shapes.js";
import { Button } from "../controller_lib/types/triggerable.js";
import { get_board } from "./init.js";
import { BOARD_W, Board, Chest } from "./interfaces.js";

export const set_chests_status = (status:boolean) =>
{
    const board:Board = get_board();
    for (let i = 0; i < BOARD_W; i += 1)
        for (let j = 0; j < BOARD_W; j += 1)
        {
            if (!board.chests[i][j].open)
                board.buttons[i][j]._active = status;
        }
}



export const chest_clicked_giver = (self:Button) =>
{
    const board:Board = get_board();

    console.log("this is I")
    board.overlay.box.boundingBox = {
        x: self._boundingBox.x + (self._boundingBox as Rectangle).w,
        y: self._boundingBox.y - (self._boundingBox as Rectangle).h,
        w: (self._boundingBox as Rectangle).w * 1,
        h: (self._boundingBox as Rectangle).h * 1.3,
    }
    board.overlay.text.boundingBox = {... board.overlay.box.boundingBox, h:  board.overlay.box.boundingBox.h * 0.2};
    board.overlay.text.text = "This chest contains :";
    board.overlay.text.font = `15px serif`
    board.overlay.subtext.text = "{{insert effect}}";
    board.overlay.subtext.font = `15px serif`
    board.overlay.subtext.boundingBox = {...board.overlay.box.boundingBox, y:  board.overlay.box.boundingBox.y + board.overlay.box.boundingBox.h * 0.7, h:  board.overlay.box.boundingBox.h * 0.3};
    board.overlay.item.boundingBox = {
        x: board.overlay.box.boundingBox.x + board.overlay.box.boundingBox.w * 0.25,
        y: board.overlay.box.boundingBox.y + board.overlay.box.boundingBox.h * 0.25,
        w: board.overlay.box.boundingBox.w * 0.5,
        h: board.overlay.box.boundingBox.h * 0.5,
    }

    board.showOverlay = true;
}

export const chest_clicked_guessser = (self:Button) =>
{
    const board:Board = get_board();
    console.log(" :( ")
    if (board.guessedWord)
        console.log("Someone already guessed a word, accept or deny ", board.guessedWord);
    else
    {
        console.log("Guessing ", (self.data as Chest).text.text);
        board.topbar.acceptButton._active = true;
        board.topbar.denyButton._active = true;
        board.topbar.text.text = "Team's guess : \"" + (self.data as Chest).text.text + "\"";
        board.guessedWord = (self.data as Chest).text.text;
    }
}

export const start_turn = () =>
{
    const board:Board = get_board();
    board.topbar.text.text = "Your clue is {{insert_clue}}";
    board.currentGuesses = 0;
    board.totalGuesses = 5;
    board.topbar.subText.text = "";
    set_chests_status(true);
}

export const parse_message = (message:string) =>
{
    console.log("received", message);
}

export const end_turn = () =>
{
    const board:Board = get_board();
    board.topbar.text.text = "Other team's turn";
    board.currentGuesses = 0;
    board.totalGuesses = 5;
    set_chests_status(false);
}

export const open_chest = (id:number) => {
    const board:Board = get_board();
    const x = id % BOARD_W;
    const y = (id / BOARD_W) | 0; // | 0 to take the integer part, more efficient than floor or ceil

    // add_animation({object: board.chests[y][x].sprite, animate_fn: (object:Animation) => {object = }})
    board.chests[y][x].open = true;
}

export const close_overlay = () =>{
    const board:Board = get_board();

    board.showOverlay = false;
    (board.overlay.exit as Button)._active = false;
    set_chests_status(true);
    board.guessedWord = undefined;
}

export const confirm_guess = () => {
    const board:Board = get_board();

    board.topbar.text.text = "Your clue is {{insert_clue}}";
    board.currentGuesses += 1;
    board.topbar.subText.text = "Guess " + board.currentGuesses.toString() + " of " + board.totalGuesses.toString();
    board.topbar.acceptButton._active = false;
    board.topbar.denyButton._active = false;
    board.guessedWord = undefined;
    board.showOverlay = true;
    set_chests_status(false);
    (board.overlay.exit as Button)._active = true;
    console.log("confirm")
}

export const deny_guess = () => {
    const board:Board = get_board();

    board.topbar.text.text = "Your clue is {{insert_clue}}";
    board.topbar.subText.text = "Guess " + board.currentGuesses.toString() + " of " + board.totalGuesses.toString();
    board.topbar.acceptButton._active = false;
    board.topbar.denyButton._active = false;
    board.guessedWord = undefined;
    console.log("deny")
}
