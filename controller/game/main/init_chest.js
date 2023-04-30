import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_TEXT } from "../../controller_lib/types/drawables.js";
import { get_asset } from "../../utils/assets.js";
import { GIVER, GUESSER } from "../interfaces.js";
// data :
// {[..., {state, text, contentId, asset}, ...]
export const fill_chest = (chest, data, role) => {
    chest.text.text = data['text'];
    chest.text.boundingBox = {
        ...chest.text.boundingBox,
        y: chest.text.boundingBox.y + chest.text.boundingBox.h * 0.7,
        h: chest.text.boundingBox.h * 0.2
    };
    chest.open = data['state'];
    chest.contents = data['contents'];
    chest.sprite.image = get_asset('chest');
    if (role == GIVER) {
        const count = parseInt(chest.contents.at(-1));
        const img = { ...DEFAULT_DRAWABLE_IMG };
        const dst = chest.sprite.dst;
        chest.sprite.src = { y: 0, w: 44, h: 32, x: 44 * 17 };
        img.image = get_asset(chest.contents.slice(0, -1));
        img.dst = { x: dst.x, y: dst.y + dst.h * 0.2, w: dst.w * 0.32, h: dst.w * 0.25 };
        const dest = img.dst;
        let startX = dst.x + (dst.w * 0.5) - ((count * ((img.dst.w + dest.w * 0.5) * 0.25)));
        if (count > 1)
            startX += dest.w * 0.25;
        for (let x = 0; x < count; x += 1) {
            dest.x = startX;
            chest.contentimg.push({ ...img, dst: { ...dest } });
            // startX += img.dst.w + 10;
            startX += dest.w * 0.5;
        }
        console.log(chest.contentimg);
        // img.dst.x
    }
    else if (role == GUESSER) {
        if (chest.open) {
            chest.sprite.src = { y: 0, w: 44, h: 32, x: 44 * 16 };
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
        text: { ...DEFAULT_DRAWABLE_TEXT, color: "#FFFFFF", font: '18px serif' },
        contentimg: [],
        sprite: { ...DEFAULT_DRAWABLE_IMG, src: { x: 0, y: 0, w: 44, h: 32 } } // {..box} or else it will assign as reference
        // sprite: {...DEFAULT_DRAWABLE_RECT, boundingBox: {...box}}// {..box} or else it will assign as reference
    };
    return newChest;
};
