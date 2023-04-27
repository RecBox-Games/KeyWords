import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_TEXT } from "../../controller_lib/types/drawables.js";
import { get_asset } from "../../utils/assets.js";
import { GIVER, GUESSER } from "../interfaces.js";
// data :
// {[..., {state, text, contentId, asset}, ...]
export const fill_chest = (chest, data, role) => {
    chest.text.text = data['text'];
    chest.open = data['state'];
    chest.contents = data['contents'];
    if (role == GIVER)
        chest.sprite.image = get_asset('silhouette');
    else if (role == GUESSER) {
        chest.sprite.image = get_asset('chest');
        if (chest.open) {
            chest.sprite.src = { y: 0, w: 44, h: 32, x: 44 * 4 + 6 * 4 };
            chest.text.color = '#000000';
        }
        else {
            chest.sprite.src = { y: 0, w: 44, h: 32, x: 0 };
            chest.text.color = '#FFFFFF';
        }
    }
};
export const construct_chest = (id) => {
    //fetch content from assets.ts
    const newChest = {
        open: false,
        id: id,
        contents: "",
        text: { ...DEFAULT_DRAWABLE_TEXT, color: "#FFFFFF" },
        sprite: { ...DEFAULT_DRAWABLE_IMG, src: { x: 0, y: 0, w: 44, h: 32 } } // {..box} or else it will assign as reference
        // sprite: {...DEFAULT_DRAWABLE_RECT, boundingBox: {...box}}// {..box} or else it will assign as reference
    };
    return newChest;
};
