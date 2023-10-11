import { get_board } from "../game/main/init.js";


export function post_popup() {
    console.log("posting popup");
    var board = get_board();
    board.popup.show = true;
}
