import { buttons_add, buttons_flush } from "./controller_lib/button.js";
import { drawablesAdd } from "./controller_lib/draw.js";
import { get_context } from "./controller_lib/init.js"
import { DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT, DrawableRect, DrawableText } from "./controller_lib/types/drawables.js"
import { Rectangle } from "./controller_lib/types/shapes.js";
import { Button } from "./controller_lib/types/triggerable.js"
import { switch_to_menu } from "./main.js";

interface Tutorial {
    box: DrawableRect,
    text: DrawableText,
    button:Button,
}

let tutorial:Tutorial;

const acknowledge = () => {
    const ctx = get_context();

    buttons_flush();
    ctx.ws.send("ack");
    switch_to_menu();
}

export const init_tutorial = () => {
    const ctx = get_context();
    const box: Rectangle = {x: ctx.dimensions.x * 0.3, y: ctx.dimensions.y * 0.45 ,w: ctx.dimensions.x * 0.4, h: ctx.dimensions.y * 0.1}
    tutorial = {
        box : {...DEFAULT_DRAWABLE_RECT, boundingBox : box},
        button: new Button(box, undefined, undefined, acknowledge),
        text: {...DEFAULT_DRAWABLE_TEXT, boundingBox: box, text: "I have read the tutorial", color: "#FFFFFF"}
        };
    buttons_add(tutorial.button);
}

export const tutorial_loop = () => {
    drawablesAdd(tutorial.box)
    drawablesAdd(tutorial.text)
}
