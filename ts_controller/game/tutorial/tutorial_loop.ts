import { drawablesAdd } from "../../controller_lib/draw.js";
import { Tutorial, get_tutorial } from "./tutorial_init.js";

export const tutorial_loop = () => {
    const tutorial:Tutorial =  get_tutorial();

    drawablesAdd(tutorial.box)
    drawablesAdd(tutorial.text)
}
