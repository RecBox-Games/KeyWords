
import { get_context } from "../controller_lib/init.js";
import { Rectangle } from "../controller_lib/types/shapes.js";
import { Button } from "../controller_lib/types/triggerable.js";
import { Board, get_board } from "../game/main/init.js";
import { BOARD_H, BOARD_W, GIVER, GUESSER } from "../game/interfaces.js";
import { Chest } from "../game/main/init_chest.js";
import { buttons_add, buttons_len, buttons_log } from "../controller_lib/button.js";
import { assetsDic, get_asset } from "./assets.js";
import { TurnRole, TurnState } from "./state_handler.js";


export const set_chests_status = (status:boolean) =>
{
    const board:Board = get_board();
    console.log("sets status", status, buttons_len())
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
    const x = (self.data as Chest).id % BOARD_W;
    const y = (self.data as Chest).id / BOARD_W;
    board.overlay.shadow = undefined;
    board.overlay.box.dst = {
        x: self._boundingBox.x + (x < BOARD_W / 2 ? (self._boundingBox as Rectangle).w : -(self._boundingBox as Rectangle).w) ,
        y: self._boundingBox.y + (y < BOARD_H / 2 ? (self._boundingBox as Rectangle).h : -(self._boundingBox as Rectangle).h),
        w: (self._boundingBox as Rectangle).w * 1.5,
        h: (self._boundingBox as Rectangle).h * 1.8,
    }

    if ((self.data as Chest).contents == 'empty'){
        board.overlay.subtext.text = 'There is nothing here :) '
         board.overlay.item.image = null;
    }
    else {
        board.overlay.item.image = get_asset((self.data as Chest).contents.slice(0, -1));
        board.overlay.subtext.text = (self.data as Chest).contents.at(-1) + assetsDic[(self.data as Chest).contents.slice(0, -1)];
    }
    board.overlay.subtext.font = `15px serif`
    board.overlay.subtext.boundingBox = {...board.overlay.box.dst, y:  board.overlay.box.dst.y + board.overlay.box.dst.h * 0.7, h:  board.overlay.box.dst.h * 0.3};
    board.overlay.item.dst = {
        x: board.overlay.box.dst.x + board.overlay.box.dst.w * 0.40,
        y: board.overlay.box.dst.y + board.overlay.box.dst.h * 0.45,
        w: board.overlay.box.dst.w * 0.3,
        h: board.overlay.box.dst.h * 0.3,
    }
    board.showOverlay = true;
}

export const chest_clicked_guessser = (self:Button) =>
{
    const board:Board = get_board();
    const ctx = get_context();
    if (!board.clue)
    {
        console.log("No clue");
        return;
    }

    if (board.guessedWord)
    {
        console.log("Someone already guessed a word, accept or deny ", board.guessedWord);
        return ;
    }
    ctx.ws.send('input:guess' + ',' + (((self.data as Chest).id / BOARD_W) | 0).toString() +
        ',' +  (((self.data as Chest).id % BOARD_W) | 0).toString())
}

export const start_turn = (turn_state: TurnState) =>
{
    const board:Board = get_board();


    board.currentGuesses = turn_state.guesses_remaining;
    board.clue = turn_state.clue;
    if (turn_state.turn.is_guess()) {
        if (turn_state.turn == board.role) {
            if (proposedGuessX != -1) {
                board.topbar.acceptButton._active = true;
                board.topbar.denyButton._active = true;
                board.topbar.subText.text = "";
                board.topbar.text.text = "Validate guess ?";
                // activate and position select graphic
                if (proposedGuessX != -1) {
                    board.selector.xIndex = proposedGuessX;
                    board.selector.yIndex = proposedGuessY;
                    const selector_dst = board.chests[proposedGuessX][proposedGuessY].sprite.dst;
                    console.log("------------------- ", selector_dst);
                    if (board.team == 0 /*TODO: BLUE*/) {
                        board.selector.red = false;
                        board.selector.blue_sprite.dst = selector_dst;
                    } else if (board.team == 1 /*TODO: RED*/) {
                        board.selector.red = true;
                        board.selector.blue_sprite.dst = selector_dst;
                    } else {
                        console.log("board.team is unexpected: ", board.team);
                    }
                }
            } else {
                board.topbar.text.text = "Remaining Guesses " + board.currentGuesses.toString();
                board.topbar.acceptButton._active = false;
                board.topbar.denyButton._active = false;
            }
        } else {
            board.topbar.text.text = "Waiting for a clue...";
            board.currentGuesses = 0;
            board.totalGuesses = 0;
            board.clue = undefined;
            board.topbar.subText.text = "";
        }
    } else if (board.role == GIVER) {
        if (turnRole == board.role) {
            board.topbar.text.text = 'Say a clue to your team, then choose how many chests they must open by giving them keys';
            for (let button of board.topbar.clueCount) {
                button._active = true;
            }
            // board.topbar.acceptButton._active = true;
            //    add buttons
        }
        else {
            board.topbar.subText.text = '';
            board.topbar.text.text = 'Your team has ' + board.currentGuesses.toString() + ' guesses remaining';
            for (let button of board.topbar.clueCount) {
                button._active = false;
            }
        }
    }
    if (!get_board().showOverlay) {
        console.log("No overlay")
        set_chests_status(true);
    }
}

export const end_turn = () =>
{
    const board:Board = get_board();
    board.topbar.text.text = "Other team's turn";
    board.topbar.subText.text = "";
    board.currentGuesses = 0;
    board.totalGuesses = 0;
    set_chests_status(false);
     for (let button of board.topbar.clueCount)
    {
        button._active = false;
    }
}

export const open_chest = (id:number) => {
    const board:Board = get_board();
    const x = id % BOARD_W;
    const y = (id / BOARD_W) | 0; // | 0 to take the integer part, more efficient than floor or ceil

    // add_animation({object: board.chests[y][x].sprite, animate_fn: (object:Animation) => {object = }})
    board.chests[y][x].open = true;
}

export const open_overlay_guesser = (guess:string) =>{
    const board:Board = get_board();

    board.topbar.acceptButton._active = false;
    board.topbar.denyButton._active = false;
    board.guessedWord = undefined;
    board.showOverlay = true;
    set_chests_status(false);
    (board.overlay.exit as Button)._active = true;
    for (let y = 0; y < BOARD_H; y += 1)
    {
        for (let x = 0; x < BOARD_W; x += 1)
        {
            if (board.chests[y][x].text.text == guess)
            {
                board.overlay.subtext.text = "This chest contains {{contents}}";
                break ;
            }
        }
    }

}
export const close_overlay = () =>{
    const board:Board = get_board();

    console.log("close overlay");
    board.showOverlay = false;
    (board.overlay.exit as Button)._active = false;
    set_chests_status(true);
    board.guessedWord = undefined;
}

export const confirm_guess = () => {
    const board:Board = get_board();
    const ctx = get_context();

    ctx.ws.send('input:second,support');
    board.topbar.text.text = "Remaining Guesses " + board.currentGuesses.toString();
    board.topbar.acceptButton._active = false;
    board.topbar.denyButton._active = false;
    board.guessedWord = undefined;
    // board.showOverlay = true;
    set_chests_status(false);
    // (board.overlay.exit as Button)._active = true;
    console.log("confirm",board.overlay.exit)
}

export const deny_guess = () => {
    const board:Board = get_board();
    const ctx = get_context();

    ctx.ws.send('input:second,dissent');
    board.topbar.text.text = "Remaining Guesses " + board.currentGuesses.toString();
    board.topbar.acceptButton._active = false;
    board.topbar.denyButton._active = false;
    board.guessedWord = undefined;
    console.log("deny")
}

export const confirm_clue = (amount:number) => {
    const board:Board = get_board();
    const ctx = get_context();

    board.topbar.text.text = "You gave your team " + amount.toString() + ' keys';
    board.topbar.acceptButton._active = false;
    ctx.ws.send("input:clue," + 'none' + "," + amount.toString());
}
