
import { get_context } from "../controller_lib/init.js";
import { Rectangle } from "../controller_lib/types/shapes.js";
import { Button } from "../controller_lib/types/triggerable.js";
import { Board, get_board } from "../game/main/init.js";
import { BOARD_H, BOARD_W, GIVER, GUESSER } from "../game/interfaces.js";
import { Chest } from "../game/main/init_chest.js";
import { buttons_add, buttons_len, buttons_log } from "../controller_lib/button.js";
import { assetsDic, get_asset } from "./assets.js";
import { ProposedGuess, TurnState, is_guess, is_blue, is_clue } from "./state_handler.js";


export const set_chests_status = (status: boolean) => {
    const board: Board = get_board();
    console.log("sets status", status, buttons_len())
    for (let i = 0; i < BOARD_W; i += 1) {
        for (let j = 0; j < BOARD_W; j += 1) {
            if (!board.chests[i][j].state.open) {
                board.buttons[i][j]._active = status;
            }
        }
    }
}

export const chest_clicked_giver = (self: Button) => {
    const board: Board = get_board();
    const the_chest = (self.data as Chest)
    board.overlay.shadow = undefined;
    board.overlay.box.dst = {
        x: self._boundingBox.x + (the_chest.x < BOARD_W / 2
            ? (self._boundingBox as Rectangle).w
            : -(self._boundingBox as Rectangle).w),
        y: self._boundingBox.y + (the_chest.y < BOARD_H / 2
            ? (self._boundingBox as Rectangle).h
            : -(self._boundingBox as Rectangle).h),
        w: (self._boundingBox as Rectangle).w * 1.5,
        h: (self._boundingBox as Rectangle).h * 1.8,
    }

    if (the_chest.state.content == 'empty') {
        board.overlay.subtext.text = 'There is nothing here :) '
        board.overlay.item.image = null;
    }
    else {
        board.overlay.item.image = get_asset(the_chest.state.content.slice(0, -1));
        board.overlay.subtext.text = the_chest.state.content.at(-1)
            + assetsDic[the_chest.state.content.slice(0, -1)];
    }
    board.overlay.subtext.font = `15px arial`
    board.overlay.subtext.boundingBox = { ...board.overlay.box.dst, y: board.overlay.box.dst.y + board.overlay.box.dst.h * 0.7, h: board.overlay.box.dst.h * 0.3 };
    board.overlay.item.dst = {
        x: board.overlay.box.dst.x + board.overlay.box.dst.w * 0.40,
        y: board.overlay.box.dst.y + board.overlay.box.dst.h * 0.45,
        w: board.overlay.box.dst.w * 0.3,
        h: board.overlay.box.dst.h * 0.3,
    }
    board.showOverlay = true;
}

export const chest_clicked_guessser = (self: Button) => {
    const board: Board = get_board();
    const ctx = get_context();
    if (board.guessedWord) {
        console.log("Someone already guessed a word, accept or deny ", board.guessedWord);
        return;
    }
    ctx.ws.send('input:guess' + ',' + (((self.data as Chest).x) | 0).toString() +
        ',' + (((self.data as Chest).y) | 0).toString())
}

export const start_turn = (turn_state: TurnState) => {
    const board: Board = get_board();
    board.currentGuesses = turn_state.guesses_remaining;
    board.clue = turn_state.clue;
    if (is_guess(board.role)) {
        if (board.role === turn_state.turn) {
            if (turn_state.proposed_guess.exists) {
                board.topbar.acceptButton._active = true;
                board.topbar.denyButton._active = true;
                board.topbar.subText.text = "";
                board.topbar.text.text = "Validate guess ?";
                const x = turn_state.proposed_guess.x;
                const y = turn_state.proposed_guess.y;
                board.selector.xIndex = x;
                board.selector.yIndex = y;
                var selector_dst = Object.assign({}, board.chests[x][y].sprite.dst);
                if (selector_dst && selector_dst.w) {
                    selector_dst.x -= 2;
                    selector_dst.y += 5;
                    selector_dst.w += 13;
                    selector_dst.h += 7;
                }
                console.log("------------------- ", selector_dst);
                if (is_blue(board.role)) {
                    board.selector.red = false;
                    board.selector.blue_sprite.dst = selector_dst;
                }
                else {
                    board.selector.red = true;
                    board.selector.red_sprite.dst = selector_dst;
                }
            }
            else {
                let clueText = typeof board.clue === "string" ? board.clue : '';
                let guessesText = board.currentGuesses.toString();
                board.topbar.text.text = "Your clue: " + clueText + ' | ' + "Keys: " + guessesText;
                board.topbar.acceptButton._active = false;
                board.topbar.denyButton._active = false;
            }
        }
        else {
            board.topbar.text.text = "Waiting for a clue...";
            board.currentGuesses = 0;
            board.totalGuesses = 0;
            board.clue = {};
            board.topbar.subText.text = "";
        }
    }
    else if (is_clue(board.role)) {
        const input = document.getElementById("clue_input");
        if (board.role === turn_state.turn) {
            board.topbar.text.text = "Give your teammate a clue";
            if (input){
                present_input(input);
                input.blur();
            }
            for (let button of board.topbar.clueCount) {
                button._active = true;
            }

            // board.topbar.acceptButton._active = true;
            //    add buttons
        }
        else {
            board.topbar.text.text ="";
            if (input) input.style.display = 'none';
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

export const end_turn = () => {
    const board: Board = get_board();
    board.topbar.text.text = "Other team's turn";
    board.topbar.subText.text = "";
    board.currentGuesses = 0;
    board.totalGuesses = 0;
    set_chests_status(false);
    for (let button of board.topbar.clueCount) {
        button._active = false;
    }
}

export const open_chest = (id: number) => {
    const board: Board = get_board();
    const x = id % BOARD_W;
    const y = (id / BOARD_W) | 0; // | 0 to take the integer part, more efficient than floor or ceil

    // add_animation({object: board.chests[y][x].sprite, animate_fn: (object:Animation) => {object = }})
    board.chests[y][x].state.open = true;
}

/*export const open_overlay_guesser = (guess:string) =>{
    const board:Board = get_board();

    board.topbar.acceptButton._active = false;
    board.topbar.denyButton._active = false;
    board.guessedWord = undefined;
    board.showOverlay = true;
    set_chests_status(false);
    (board.overlay.exit as Button)._active = true;
    for (let y = 0; y < BOARD_H; y += 1) {
        for (let x = 0; x < BOARD_W; x += 1) {
            if (board.chests[y][x].text.text == guess) {
                board.overlay.subtext.text = "This chest contains {{contents}}";
                break ;
            }
        }
    }
}
*/

export const close_overlay = () => {
    const board: Board = get_board();

    console.log("close overlay");
    board.showOverlay = false;
    (board.overlay.exit as Button)._active = false;
    set_chests_status(true);
    board.guessedWord = undefined;
}

export const confirm_guess = () => {
    const board: Board = get_board();
    const ctx = get_context();

    ctx.ws.send('input:second,support');
    board.topbar.text.text = "Remaining Guesses " + board.currentGuesses.toString();
    board.topbar.acceptButton._active = false;
    board.topbar.denyButton._active = false;
    board.guessedWord = undefined;
    // board.showOverlay = true;
    set_chests_status(false);
    // (board.overlay.exit as Button)._active = true;
    console.log("confirm", board.overlay.exit)
}

export const deny_guess = () => {
    const board: Board = get_board();
    const ctx = get_context();

    ctx.ws.send('input:second,dissent');
    board.topbar.text.text = "Remaining Guesses " + board.currentGuesses.toString();
    board.topbar.acceptButton._active = false;
    board.topbar.denyButton._active = false;
    board.guessedWord = undefined;
    console.log("deny")
}

export const confirm_clue = (amount: number) => {
    const board: Board = get_board();
    const ctx = get_context();
    let keyText = amount == 1 ? "key" : "keys"
    board.topbar.subText.text = "Clue " + board.clue + " - You gave your team " + amount.toString() + ' ' + keyText;
    board.topbar.acceptButton._active = false;
    ctx.ws.send("input:clue," + board.clue + "," + amount.toString());
}

function present_input(input: HTMLElement) {
    input.style.display = "flex";
    input.style.position = "fixed";
    input.style.left = "68vw";
    input.style.width = "20%";
    input.style.fontSize = "20px";
    input.style.background = "transparent";
    input.style.border = "none";
    input.style.borderBottom = "2px solid white";
    input.style.paddingBottom = "4px";
    input.style.paddingLeft = "12px";
    input.style.paddingRight = "12px";
    input.style.color = "black";
    input.style.fontWeight = "bold";   

    (input as HTMLInputElement).value = "";
    input.onchange = handle_input;
    document.addEventListener('touchstart', function(e) {
        if (input === document.activeElement) {
            handle_input(e);
        }
    });
    input.addEventListener("blur", function(e) {
        setTimeout(function() {
            handle_input(e);
        }, 50);
    });
}

function handle_input(e: Event) {
    if ((e.target as HTMLInputElement).value != "") {
        get_board().clue = (e.target as HTMLInputElement).value;
        get_board().topbar.acceptButton._active = true;
    }
    else {
        get_board().topbar.acceptButton._active = false;
    }
    console.log((e.target as HTMLInputElement).value);
}
