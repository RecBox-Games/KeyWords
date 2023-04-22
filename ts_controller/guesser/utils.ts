
import { Button } from "../controller_lib/types/triggerable.js";
import { get_board } from "./init.js";
import { BOARD_W, Board, ChestGuesser } from "./interfaces.js";

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

export const chest_clicked_guessser = (self:Button) =>
{
    const board:Board = get_board();
    if (board.guessedWord)
        console.log("Someone already guessed a word, accept or deny ", board.guessedWord);
    else
    {
        console.log("Guessing ", (self.data as ChestGuesser).text.text);
        board.topbar.acceptButton._active = true;
        board.topbar.denyButton._active = true;
        board.topbar.text.text = "Team's guess : \"" + (self.data as ChestGuesser).text.text + "\"";
        board.guessedWord = (self.data as ChestGuesser).text.text;
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
    board.overlay.exit._active = false;
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
    board.overlay.exit._active = true;
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
