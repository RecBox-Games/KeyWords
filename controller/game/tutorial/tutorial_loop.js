import { drawablesAdd } from "../../controller_lib/draw.js";
import { get_tutorial } from "./tutorial_init.js";
export const tutorial_loop = () => {
    const tutorial = get_tutorial();
    drawablesAdd(tutorial.box);
    drawablesAdd(tutorial.text);
};
