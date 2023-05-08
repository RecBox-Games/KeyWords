import { get_context } from "../controller_lib/init.js";
import { get_board } from "../game/main/init.js";
import { BOARD_H, BOARD_W, GIVER, GUESSER } from "../game/interfaces.js";
import { buttons_len } from "../controller_lib/button.js";
import { assetsDic, get_asset } from "./assets.js";
export const set_chests_status = (status) => {
    const board = get_board();
    console.log("sets status", status, buttons_len());
    for (let i = 0; i < BOARD_W; i += 1)
        for (let j = 0; j < BOARD_W; j += 1) {
            if (!board.chests[i][j].open)
                board.buttons[i][j]._active = status;
        }
};
export const chest_clicked_giver = (self) => {
    const board = get_board();
    const x = self.data.id % BOARD_W;
    const y = self.data.id / BOARD_W;
    board.overlay.shadow = undefined;
    board.overlay.box.dst = {
        x: self._boundingBox.x + (x < BOARD_W / 2 ? self._boundingBox.w : -self._boundingBox.w),
        y: self._boundingBox.y + (y < BOARD_H / 2 ? self._boundingBox.h : -self._boundingBox.h),
        w: self._boundingBox.w * 1.5,
        h: self._boundingBox.h * 1.8,
    };
    if (self.data.contents == 'empty') {
        board.overlay.subtext.text = 'There is nothing here :) ';
        board.overlay.item.image = null;
    }
    else {
        board.overlay.item.image = get_asset(self.data.contents.slice(0, -1));
        board.overlay.subtext.text = self.data.contents.at(-1) + assetsDic[self.data.contents.slice(0, -1)];
    }
    board.overlay.subtext.font = `15px serif`;
    board.overlay.subtext.boundingBox = { ...board.overlay.box.dst, y: board.overlay.box.dst.y + board.overlay.box.dst.h * 0.7, h: board.overlay.box.dst.h * 0.3 };
    board.overlay.item.dst = {
        x: board.overlay.box.dst.x + board.overlay.box.dst.w * 0.40,
        y: board.overlay.box.dst.y + board.overlay.box.dst.h * 0.45,
        w: board.overlay.box.dst.w * 0.3,
        h: board.overlay.box.dst.h * 0.3,
    };
    board.showOverlay = true;
};
export const chest_clicked_guessser = (self) => {
    const board = get_board();
    const ctx = get_context();
    if (!board.clue) {
        console.log("No clue");
        return;
    }
    if (board.guessedWord) {
        console.log("Someone already guessed a word, accept or deny ", board.guessedWord);
        return;
    }
    ctx.ws.send('input:guess' + ',' + ((self.data.id / BOARD_W) | 0).toString() + ',' + ((self.data.id % BOARD_W) | 0).toString());
};
export const start_turn = (turnRole, clue, guessRemain, guess, guessState) => {
    const board = get_board();
    board.currentGuesses = guessRemain;
    board.clue = clue;
    board.guessedWord = guess;
    if (board.role == GUESSER) {
        if (turnRole == board.role) {
            if (guessState) {
                board.topbar.acceptButton._active = true;
                board.topbar.denyButton._active = true;
                board.topbar.subText.text = "";
                board.topbar.text.text = "Validate guess ?";
            }
            else {
                board.topbar.text.text = "Remaining Guesses " + board.currentGuesses.toString();
                board.topbar.acceptButton._active = false;
                board.topbar.denyButton._active = false;
            }
        }
        else {
            board.topbar.text.text = "Waiting for a clue...";
            board.currentGuesses = 0;
            board.totalGuesses = 0;
            board.clue = undefined;
            board.topbar.subText.text = "";
        }
    }
    else if (board.role == GIVER) {
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
        console.log("No overlay");
        set_chests_status(true);
    }
};
export const end_turn = () => {
    const board = get_board();
    board.topbar.text.text = "Other team's turn";
    board.topbar.subText.text = "";
    board.currentGuesses = 0;
    board.totalGuesses = 0;
    set_chests_status(false);
    for (let button of board.topbar.clueCount) {
        button._active = false;
    }
};
export const open_chest = (id) => {
    const board = get_board();
    const x = id % BOARD_W;
    const y = (id / BOARD_W) | 0; // | 0 to take the integer part, more efficient than floor or ceil
    // add_animation({object: board.chests[y][x].sprite, animate_fn: (object:Animation) => {object = }})
    board.chests[y][x].open = true;
};
export const open_overlay_guesser = (guess) => {
    const board = get_board();
    board.topbar.acceptButton._active = false;
    board.topbar.denyButton._active = false;
    board.guessedWord = undefined;
    board.showOverlay = true;
    set_chests_status(false);
    board.overlay.exit._active = true;
    for (let y = 0; y < BOARD_H; y += 1) {
        for (let x = 0; x < BOARD_W; x += 1) {
            if (board.chests[y][x].text.text == guess) {
                board.overlay.subtext.text = "This chest contains {{contents}}";
                break;
            }
        }
    }
};
export const close_overlay = () => {
    const board = get_board();
    console.log("close overlay");
    board.showOverlay = false;
    board.overlay.exit._active = false;
    set_chests_status(true);
    board.guessedWord = undefined;
};
export const confirm_guess = () => {
    const board = get_board();
    const ctx = get_context();
    ctx.ws.send('input:second,support');
    board.topbar.text.text = "Remaining Guesses " + board.currentGuesses.toString();
    board.topbar.acceptButton._active = false;
    board.topbar.denyButton._active = false;
    board.guessedWord = undefined;
    // board.showOverlay = true;
    set_chests_status(false);
    // (board.overlay.exit as Button)._active = true;
    console.log("confirm", board.overlay.exit);
};
export const deny_guess = () => {
    const board = get_board();
    const ctx = get_context();
    ctx.ws.send('input:second,dissent');
    board.topbar.text.text = "Remaining Guesses " + board.currentGuesses.toString();
    board.topbar.acceptButton._active = false;
    board.topbar.denyButton._active = false;
    board.guessedWord = undefined;
    console.log("deny");
};
export const confirm_clue = (amount) => {
    const board = get_board();
    const ctx = get_context();
    board.topbar.text.text = "You gave your team " + amount.toString() + ' keys';
    board.topbar.acceptButton._active = false;
    ctx.ws.send("input:clue," + 'none' + "," + amount.toString());
};
