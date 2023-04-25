import { buttons_add } from "../../controller_lib/button.js";
import { drawablesAdd } from "../../controller_lib/draw.js";
import { DEFAULT_DRAWABLE_IMG } from "../../controller_lib/types/drawables.js";
import { get_asset } from "../../utils/assets.js";
import { get_tutorial } from "./tutorial_init.js";
export const set_tutorial_state = () => {
    const tutorial = get_tutorial();
    tutorial.bg = { ...DEFAULT_DRAWABLE_IMG, image: get_asset('keywords_background'), };
    buttons_add(tutorial.button);
};
export const tutorial_loop = () => {
    const tutorial = get_tutorial();
    if (tutorial.bg)
        drawablesAdd(tutorial.bg);
    drawablesAdd(tutorial.box);
    drawablesAdd(tutorial.text);
};
