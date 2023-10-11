import { buttons_add } from "../controller_lib/button.js";
import { get_board } from "../game/main/init.js";


export function post_popup() {
    console.log("posting popup");
    var board = get_board();
    board.popup.show = true;
    board.popup.x_button._active = true;
    buttons_add(board.popup.x_button);
}
