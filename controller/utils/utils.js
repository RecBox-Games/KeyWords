import { get_context } from "../controller_lib/init.js";
import { get_board } from "../game/main/init.js";
import { BOARD_W, GUESSER } from "../game/interfaces.js";
export const set_chests_status = (status) => {
    const board = get_board();
    for (let i = 0; i < BOARD_W; i += 1)
        for (let j = 0; j < BOARD_W; j += 1) {
            if (!board.chests[i][j].open)
                board.buttons[i][j]._active = status;
        }
};
export const chest_clicked_giver = (self) => {
    const board = get_board();
    console.log("this is I");
    board.overlay.box.boundingBox = {
        x: self._boundingBox.x + self._boundingBox.w,
        y: self._boundingBox.y - self._boundingBox.h,
        w: self._boundingBox.w * 1,
        h: self._boundingBox.h * 1.3,
    };
    board.overlay.text.boundingBox = { ...board.overlay.box.boundingBox, h: board.overlay.box.boundingBox.h * 0.2 };
    board.overlay.text.text = "This chest contains :";
    board.overlay.text.font = `15px serif`;
    board.overlay.subtext.text = "{{insert effect}}";
    board.overlay.subtext.font = `15px serif`;
    board.overlay.subtext.boundingBox = { ...board.overlay.box.boundingBox, y: board.overlay.box.boundingBox.y + board.overlay.box.boundingBox.h * 0.7, h: board.overlay.box.boundingBox.h * 0.3 };
    board.overlay.item.boundingBox = {
        x: board.overlay.box.boundingBox.x + board.overlay.box.boundingBox.w * 0.25,
        y: board.overlay.box.boundingBox.y + board.overlay.box.boundingBox.h * 0.25,
        w: board.overlay.box.boundingBox.w * 0.5,
        h: board.overlay.box.boundingBox.h * 0.5,
    };
    board.showOverlay = true;
};
export const chest_clicked_guessser = (self) => {
    const board = get_board();
    if (!board.clue) {
        console.log("No clue");
        return;
    }
    if (board.guessedWord) {
        console.log("Someone already guessed a word, accept or deny ", board.guessedWord);
        return;
    }
    console.log("Guessing ", self.data.text.text);
    board.topbar.acceptButton._active = true;
    board.topbar.denyButton._active = true;
    board.topbar.text.text = "Team's guess : \"" + self.data.text.text + "\"";
    board.guessedWord = self.data.text.text;
};
export const start_turn = (role) => {
    const board = get_board();
    if (role == GUESSER) {
        board.topbar.text.text = "Waiting for a clue...";
        board.currentGuesses = 0;
        board.totalGuesses = 0;
        board.clue = undefined;
        board.topbar.subText.text = "";
    }
    else {
        const input = document.getElementById("clue_input");
        const number = document.getElementById("clue_number");
        board.topbar.acceptButton._active = true;
        if (input) {
            input.style.display = "flex";
            input.style.position = "absolute";
            input.style.top = "4%";
            input.style.left = "33%";
            input.style.width = "15%";
            input.style.fontSize = "20px";
            input.style.background = "transparent";
            input.style.border = "none";
            input.style.borderBottom = "1px solid";
            input.value = "";
            input.onchange = (e) => {
                get_board().clue = e.target.value;
                console.log(e.target.value);
            };
        }
        if (number) {
            number.style.display = "flex";
            number.style.position = "absolute";
            number.style.top = "4%";
            number.style.left = "55%";
            number.style.width = "5%";
            number.style.fontSize = "20px";
            number.style.background = "transparent";
            number.style.border = "none";
            number.style.borderBottom = "1px solid";
            number.value = (1).toString();
            number.onchange = (e) => {
                const val = parseInt(e.target.value);
                get_board().totalGuesses = Math.min(Math.max(1, val), 5);
                console.log(val);
            };
        }
    }
    set_chests_status(true);
};
export const parse_message = (message) => {
    console.log("received", message);
};
export const end_turn = () => {
    const board = get_board();
    board.topbar.text.text = "Other team's turn";
    board.currentGuesses = 0;
    board.totalGuesses = 0;
    set_chests_status(false);
};
export const open_chest = (id) => {
    const board = get_board();
    const x = id % BOARD_W;
    const y = (id / BOARD_W) | 0; // | 0 to take the integer part, more efficient than floor or ceil
    // add_animation({object: board.chests[y][x].sprite, animate_fn: (object:Animation) => {object = }})
    board.chests[y][x].open = true;
};
export const close_overlay = () => {
    const board = get_board();
    board.showOverlay = false;
    board.overlay.exit._active = false;
    set_chests_status(true);
    board.guessedWord = undefined;
};
export const confirm_guess = () => {
    const board = get_board();
    board.topbar.text.text = "Your clue is {{insert_clue}}";
    board.currentGuesses += 1;
    board.topbar.subText.text = "Guess " + board.currentGuesses.toString() + " of " + board.totalGuesses.toString();
    board.topbar.acceptButton._active = false;
    board.topbar.denyButton._active = false;
    board.guessedWord = undefined;
    board.showOverlay = true;
    set_chests_status(false);
    board.overlay.exit._active = true;
    console.log("confirm");
};
export const deny_guess = () => {
    const board = get_board();
    board.topbar.text.text = "Your clue is {{insert_clue}}";
    board.topbar.subText.text = "Guess " + board.currentGuesses.toString() + " of " + board.totalGuesses.toString();
    board.topbar.acceptButton._active = false;
    board.topbar.denyButton._active = false;
    board.guessedWord = undefined;
    console.log("deny");
};
export const confirm_clue = () => {
    const board = get_board();
    const ctx = get_context();
    board.topbar.text.text = "Your clue is " + board.clue;
    board.topbar.acceptButton._active = false;
    ctx.ws.send("input:clue," + board.clue + board.totalGuesses.toString());
    document.getElementById("clue_input").style.display = 'none';
    document.getElementById("clue_number").style.display = 'none';
};
