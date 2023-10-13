import { buttons_add } from "../../controller_lib/button.js";
import { drawablesAdd } from "../../controller_lib/draw.js";
import { get_asset } from "../../utils/assets.js";
import { get_tutorial } from "./tutorial_init.js";
export const set_tutorial_state = () => {
    const tutorial = get_tutorial();
    tutorial.bg.image = get_asset('keywords_background');
    tutorial.box.image = get_asset(`tutorial`);
    buttons_add(tutorial.button);
};
export const tutorial_loop = () => {
    const tutorial = get_tutorial();
    if (tutorial.bg)
        drawablesAdd(tutorial.bg);
    if (tutorial.box) {
        // console.log('aaaaaaaa', tutorial.box)
        drawablesAdd(tutorial.box);
    }
};
