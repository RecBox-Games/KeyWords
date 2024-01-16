import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_TEXT, DrawableImage, DrawableText } from "../../controller_lib/types/drawables.js";
import { Rectangle } from "../../controller_lib/types/shapes.js";
import { get_asset } from "../../utils/assets.js";
import { ChestState, TurnRole, is_clue } from "../../utils/state_handler.js";


export interface Chest {
    x: number,
    y: number,
    state:ChestState;
    text:DrawableText;
    // sprite:DrawableRect;
    sprite:DrawableImage;
    contentimg: DrawableImage[];
}

// data :
// {[..., {state, text, contentId, asset}, ...]

export const size_chest = (chest:Chest) => {
    chest.text.boundingBox = {
        y: chest.text.boundingBox.y + chest.text.boundingBox.h * 0.7,
        h: chest.text.boundingBox.h * 0.2,
        x: chest.text.boundingBox.x + chest.text.boundingBox.w * 0.07,
        w: chest.text.boundingBox.w  - chest.text.boundingBox.w * 0.07
    };


    const count = parseInt(chest.state.content.at(-1) as string);
    const img =  {...DEFAULT_DRAWABLE_IMG};
    const dst = chest.sprite.dst as Rectangle;

    img.image = get_asset(chest.state.content.slice(0, -1));
    img.dst = {
        x: dst.x,        y: dst.y + dst.h * 0.16,
        w: dst.w * 0.32, h: dst.h * 0.47,
    };

    const dest = img.dst;

    let startX = dst.x + (dst.w * 0.5) - ((count * ((img.dst.w + dest.w * 0.5) * 0.25)));
    if ( count > 1) {
        startX += dest.w * 0.25
    }
    for (let x = 0; x < chest.contentimg.length; x += 1) {
        dest.x = startX;
        chest.contentimg[x].dst = {...dest};
        startX += dest.w * 0.5;
    }
}

export const fill_chest = (chest: Chest, state: ChestState, role: TurnRole) => {
    chest.state = state;
    chest.text.text = state.word;
    chest.sprite.image = get_asset('chests')
    if (chest.state.open) {
        chest.sprite.src = { y: 0, w: 37, h: 29, x: 37 * 1 };
        chest.text.color = '#200000'
    } else {
        chest.sprite.src = { y: 0, w: 37, h: 29, x: 37 * 0 };
        chest.text.color = '#FFFFFF'
    }
    if (is_clue(role)) {
        const count = parseInt(chest.state.content.at(-1) as string);
        const img =  {...DEFAULT_DRAWABLE_IMG};
        img.image = get_asset(chest.state.content.slice(0, -1));
        chest.contentimg = [];
        for (let x = 0; x < count; x += 1) {
            chest.contentimg.push({ ...img });
        }
    }
    size_chest(chest);
}

export const construct_chest = (id:number) : Chest => {
    //fetch content from assets.ts
    const newChest: Chest = {
        x: -1,
        y: -1,
        state: {word: "", open: false, content: ""},
        text: {...DEFAULT_DRAWABLE_TEXT, color:"#FFFFFF", font:'20px arial'},
        contentimg: [],
        sprite: {...DEFAULT_DRAWABLE_IMG, src: {x:0, y:0, w:37, h:29}}// {..box} or else it will assign as reference
        // sprite: {...DEFAULT_DRAWABLE_RECT, boundingBox: {...box}}// {..box} or else it will assign as reference
    }

    return newChest;
}


