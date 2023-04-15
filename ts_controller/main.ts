import { drawablesAdd, drawablesPrint, drawablesRenderAll } from "./controller_lib/draw.js";
import { get_context, init_context } from "./controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG, DrawableImage } from "./controller_lib/types/drawables.js";
import { Rectangle } from "./controller_lib/types/shapes.js";
import { cp_update } from "./controller_lib/update.js";

// interface BoardTile {
// 	drawab
// }

// interface Player {
// 	team:string,

// }

interface Board {
    background: DrawableImage;
}

let board:Board;

const init_app = () => {
    init_context();

    const bg:DrawableImage = {...DEFAULT_DRAWABLE_IMG, image: new Image()};
    (bg.image as HTMLImageElement).onload = function (e) {
        console.log("loaded");

        // drawablesAdd(board.background);
        // drawablesPrint();
    }
    board = {background: bg};
    (bg.image as HTMLImageElement).src = '../resources/keywords_background.png';
    // board.background.dst = <Rectangle>{x:0, y:0 ,w:context.dimensions.x, h:context.dimensions.y};
}

const tutorial = () => {

}

const menu = () => {

}


const app = () => {

    const context = get_context();
	// cp_update();

    drawablesAdd(board.background);
    // drawablesPrint();
    drawablesRenderAll();
	// console.log("Hello");
	window.requestAnimationFrame(app);
}

window.onload = () => {
    console.log("init");
    init_app();
    window.requestAnimationFrame(app);
}


//TODO: add layer to drawable & sort it before rendering + render functions
