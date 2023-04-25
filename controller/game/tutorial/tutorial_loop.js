import { buttons_add } from "../../controller_lib/button.js";
import { drawablesAdd } from "../../controller_lib/draw.js";
import { get_tutorial } from "./tutorial_init.js";
export const set_tutorial_state = () => {
    const tutorial = get_tutorial();
    buttons_add(tutorial.button);
};
export const tutorial_loop = () => {
    const tutorial = get_tutorial();
    drawablesAdd(tutorial.box);
    drawablesAdd(tutorial.text);
};
