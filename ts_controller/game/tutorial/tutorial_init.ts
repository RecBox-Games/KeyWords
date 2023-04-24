import { buttons_add } from "../../controller_lib/button.js";
import { get_context } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT, DrawableRect, DrawableText } from "../../controller_lib/types/drawables.js";
import { Rectangle } from "../../controller_lib/types/shapes.js";

import { Button } from "../../controller_lib/types/triggerable.js";

export interface Tutorial {
    box: DrawableRect,
    text: DrawableText,
    button?:Button,
}

const tutorial:Tutorial = {
    box : {...DEFAULT_DRAWABLE_RECT},
    text: {...DEFAULT_DRAWABLE_TEXT}
}

export const get_tutorial = () => tutorial;

export const init_tutorial = () => {
    const ctx = get_context();
    const box: Rectangle = {x: ctx.dimensions.x * 0.3, y: ctx.dimensions.y * 0.45 ,w: ctx.dimensions.x * 0.4, h: ctx.dimensions.y * 0.1}

    tutorial.box.boundingBox = box;
    tutorial.text.boundingBox = box;
    tutorial.text.text = "I have read the tutorial";
    tutorial.text.color = '#FFFFFF';
    tutorial.button = new Button(box, undefined, undefined, () => get_context().ws.send('input:ack'));

    buttons_add(tutorial.button);

    return tutorial;
}
