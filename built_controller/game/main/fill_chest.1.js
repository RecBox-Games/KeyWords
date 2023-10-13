import { DEFAULT_DRAWABLE_IMG } from "../../controller_lib/types/drawables.js";
import { get_asset } from "../../utils/assets.js";
import { GUESSER } from "../interfaces.js";
import { size_chest } from "./init_chest.js";
export const fill_chest = (chest, state, role) => {
    chest.state = state;
    chest.sprite.image = get_asset('chests');
    if (is_cl(role)) {
        const count = parseInt(chest.contents.at(-1));
        const img = { ...DEFAULT_DRAWABLE_IMG };
        if (chest.open)
            chest.sprite.src = { y: 0, w: 37, h: 29, x: 37 * 14 };
        else
            chest.sprite.src = { y: 0, w: 37, h: 29, x: 37 * 13 };
        img.image = get_asset(chest.contents.slice(0, -1));
        if (chest.contentimg.length == 0) {
            for (let x = 0; x < count; x += 1) {
                chest.contentimg.push({ ...img });
                // startX += img.dst.w + 10;
            }
        }
        // img.dst.x
    }
    else if (role == GUESSER) {
        if (chest.open) {
            chest.sprite.src = { y: 0, w: 37, h: 29, x: 37 * 12 };
            chest.text.color = '#000000';
        }
        else {
            chest.sprite.src = { y: 0, w: 37, h: 29, x: 0 };
            chest.text.color = '#FFFFFF';
        }
    }
    size_chest(chest);
};
