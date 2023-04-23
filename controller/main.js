import { drawablesAdd, drawablesRenderAll } from "./controller_lib/draw.js";
import { get_context, init_context } from "./controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG } from "./controller_lib/types/drawables.js";
import { init_menu, menu_loop } from "./menu.js";
const words = [];
let board;
const init_app = () => {
    init_context();
    const bg = { ...DEFAULT_DRAWABLE_IMG, image: new Image() };
    bg.image.onload = function (e) {
        console.log("loaded");
    };
    board = { background: bg };
    bg.image.src = '../resources/keywords_background.png';
    words.push(["Paper", "Space", "Ground", "Couple", "Table"]);
    words.push(["Paper", "Space", "Ground", "Couple", "Table"]);
    words.push(["Paper", "Space", "Ground", "Couple", "Table"]);
    words.push(["Paper", "Space", "Ground", "Couple", "Table"]);
    words.push(["Paper", "Space", "Ground", "Couple", "Table"]);
    init_menu();
    // board.background.dst = <Rectangle>{x:0, y:0 ,w:context.dimensions.x, h:context.dimensions.y};
};
const app = () => {
    const context = get_context();
    // cp_update();
    drawablesAdd(board.background);
    // drawablesPrint();
    menu_loop();
    drawablesRenderAll();
    // console.log("Hello");
    window.requestAnimationFrame(app);
};
window.onload = () => {
    console.log("init");
    init_app();
    window.requestAnimationFrame(app);
};
//TODO: add layer to drawable & sort it before rendering + render functions
