import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT, DrawableImage, DrawableRect, DrawableText } from "../../controller_lib/types/drawables.js";
import { Rectangle } from "../../controller_lib/types/shapes.js";
import { get_asset } from "../../utils/assets.js";


export interface Chest {
    open:boolean;
    id: number;
    contents: string;
    text:DrawableText;
    // sprite:DrawableRect;
    sprite:DrawableImage;
}

// data :
// {[..., {state, text, contentId, asset}, ...]

export const fill_chest = (chest:Chest, data:any) => {
    chest.text.text = data['text'];
    chest.open = data['state'];
    chest.contents = data['contents']

    chest.sprite.image = get_asset('chest_sprites')
}

export const construct_chest = (id:number, box:Rectangle) : Chest => {
    //fetch content from assets.ts
    const newChest: Chest = {
        open: false,
        id: id,
        contents: "",
        text: {...DEFAULT_DRAWABLE_TEXT, color:"#FFFFFF", boundingBox:{...box}},
        sprite: {...DEFAULT_DRAWABLE_IMG, dst: {...box}, src: {x:0, y:0, w:44, h:32}}// {..box} or else it will assign as reference
        // sprite: {...DEFAULT_DRAWABLE_RECT, boundingBox: {...box}}// {..box} or else it will assign as reference
    }

    return newChest;
}
