import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT, DrawableImage, DrawableRect, DrawableText } from "../../controller_lib/types/drawables.js";
import { Rectangle } from "../../controller_lib/types/shapes.js";
import { scale_and_center } from "../../controller_lib/utils.js";
import { get_asset } from "../../utils/assets.js";
import { BOARD_H, GIVER, GUESSER } from "../interfaces.js";


export interface Chest {
    open:boolean;
    id: number;
    contents: string;
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


    const count = parseInt(chest.contents.at(-1) as string);
    const img =  {...DEFAULT_DRAWABLE_IMG};
    const dst = chest.sprite.dst as Rectangle;

    img.image = get_asset(chest.contents.slice(0, -1));
    img.dst = {x: dst.x, y: dst.y + dst.h * 0.2, w: dst.w * 0.32 , h: dst.w * 0.3};

    const dest = img.dst;

    let startX = dst.x + (dst.w * 0.5) - ((count * ((img.dst.w + dest.w * 0.5) * 0.25)));
    if ( count > 1)
        startX += dest.w * 0.25
    for (let x = 0; x < chest.contentimg.length; x += 1)
    {
        dest.x = startX;
        chest.contentimg[x].dst = {...dest};
        startX += dest.w * 0.5;
    }
}

export const fill_chest = (chest:Chest, data:any, role:number) => {
    chest.text.text = data['text'];
    chest.open = data['state'];
    chest.contents = data['contents']
    chest.sprite.image = get_asset('chests')
    if (role == GIVER)
    {

        const count = parseInt(chest.contents.at(-1) as string);
        const img =  {...DEFAULT_DRAWABLE_IMG};

        if (chest.open)
            chest.sprite.src = {y:0, w:37, h:29, x: 37 * 14};
        else
            chest.sprite.src = {y:0, w:37, h:29, x: 37 * 13};
        img.image = get_asset(chest.contents.slice(0, -1));
        if (chest.contentimg.length == 0)
        {
            for (let x = 0; x < count; x += 1)
            {
                chest.contentimg.push({...img});
                // startX += img.dst.w + 10;
            }
        }
        // img.dst.x
    }
    else if (role == GUESSER)
    {
        if (chest.open)
        {
            chest.sprite.src = {y:0, w:37, h:29, x: 37 * 12};
            chest.text.color = '#000000'
        }
        else {
            chest.sprite.src = {y:0, w:37, h:29, x:0};
            chest.text.color = '#FFFFFF'
        }
    }
    size_chest(chest);
}

export const construct_chest = (id:number) : Chest => {
    //fetch content from assets.ts
    const newChest: Chest = {
        open: false,
        id: id,
        contents: "",
        text: {...DEFAULT_DRAWABLE_TEXT, color:"#FFFFFF", font:'19px serif'},
        contentimg: [],
        sprite: {...DEFAULT_DRAWABLE_IMG, src: {x:0, y:0, w:37, h:29}}// {..box} or else it will assign as reference
        // sprite: {...DEFAULT_DRAWABLE_RECT, boundingBox: {...box}}// {..box} or else it will assign as reference
    }

    return newChest;
}
