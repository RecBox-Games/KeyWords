import { DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT, DrawableImage, DrawableRect, DrawableText } from "../../controller_lib/types/drawables.js";
import { Rectangle } from "../../controller_lib/types/shapes.js";

export interface ChestContents {
    sprite?: DrawableImage;
    name: string;
    effect:string;
}

export interface Chest {
    open:boolean;
    id: number;
    contents: number;
    text:DrawableText;
    sprite:DrawableRect;
}

// data :
// {[..., {state, text, contentId, asset}, ...]

export const fill_chest = (chest:Chest, data:any) => {
    chest.text.text = data['text'];
    chest.open = data['state'];
    chest.contents = data['contents']
}

export const construct_chest = (id:number, box:Rectangle) : Chest => {
    //fetch content from assets.ts
    const newChest: Chest = {
        open: false,
        id: id,
        contents: -1,
        text: {...DEFAULT_DRAWABLE_TEXT, color:"#FFFFFF", boundingBox:{...box}},
        sprite: {...DEFAULT_DRAWABLE_RECT, boundingBox: {...box}}// {..box} or else it will assign as reference
    }

    return newChest;
}
