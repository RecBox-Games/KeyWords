import { get_context } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT } from "../../controller_lib/types/drawables.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { set_state } from "../../main.js";
import { MENU } from "../interfaces.js";
import { set_menu_state } from "../menu/menu_loop.js";
const tutorial = {
    box: { ...DEFAULT_DRAWABLE_RECT },
    text: { ...DEFAULT_DRAWABLE_TEXT }
};
export const get_tutorial = () => tutorial;
export const size_tutorial = () => {
    const ctx = get_context();
    const box = { x: ctx.dimensions.x * 0.3, y: ctx.dimensions.y * 0.45, w: ctx.dimensions.x * 0.4, h: ctx.dimensions.y * 0.1 };
    tutorial.box.boundingBox = box;
    tutorial.text.boundingBox = box;
    if (tutorial.button)
        tutorial.button._boundingBox = box;
};
export const init_tutorial = () => {
    tutorial.text.text = "Everyone has read the tutorial";
    tutorial.text.color = '#FFFFFF';
    tutorial.button = new Button({ x: 0, y: 0, w: 0, h: 0 }, undefined, undefined, () => {
        get_context().ws.send('input:ack');
        set_state(MENU);
        set_menu_state(-1, -1);
    });
    size_tutorial();
    return tutorial;
};
