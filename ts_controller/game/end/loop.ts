import { buttons_add } from "../../controller_lib/button.js";
import { drawablesAdd } from "../../controller_lib/draw.js";
import { End, get_end } from "./init.js";

export const end_loop = () => {
    const end:End =  get_end();

    drawablesAdd(end.bg);
    drawablesAdd(end.restartSprite)
    drawablesAdd(end.endSprite)
}
