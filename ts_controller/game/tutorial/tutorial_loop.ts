import { buttons_add } from "../../controller_lib/button.js";
import { drawablesAdd } from "../../controller_lib/draw.js";
import { DEFAULT_DRAWABLE_IMG } from "../../controller_lib/types/drawables.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { get_asset } from "../../utils/assets.js";
import { Tutorial, get_tutorial } from "./tutorial_init.js";

export const set_tutorial_state = () => {
    const tutorial:Tutorial =  get_tutorial();

    tutorial.bg.image = get_asset('keywords_background')
    tutorial.box.image = get_asset(`tutorial`)
    buttons_add(tutorial.button as Button);
}

export const tutorial_loop = () => {
    const tutorial:Tutorial =  get_tutorial();

    if (tutorial.bg)
        drawablesAdd(tutorial.bg);
    if (tutorial.box)
    {
        // console.log('aaaaaaaa', tutorial.box)
        drawablesAdd(tutorial.box)
    }
}
