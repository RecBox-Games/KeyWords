import { buttons_add, buttons_flush } from "../../controller_lib/button.js";
import { drawablesAdd } from "../../controller_lib/draw.js";
import { get_end } from "./init.js";
export const end_loop = () => {
    const end = get_end();
    buttons_flush();
    //
    drawablesAdd(end.bg);
    drawablesAdd(end.restartSprite);
    drawablesAdd(end.endSprite);
    //
    buttons_add(end.restartButton);
    buttons_add(end.endButton);
};
