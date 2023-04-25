import { buttons_add } from "../../controller_lib/button.js";
import { drawablesAdd } from "../../controller_lib/draw.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { Tutorial, get_tutorial } from "./tutorial_init.js";

export const set_tutorial_state = () => {
    const tutorial:Tutorial =  get_tutorial();

    buttons_add(tutorial.button as Button);
}

export const tutorial_loop = () => {
    const tutorial:Tutorial =  get_tutorial();

    drawablesAdd(tutorial.box)
    drawablesAdd(tutorial.text)
}
