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

export const fill_chest = (chest:Chest, data:any, role:number) => {
    chest.text.text = data['text'];
    chest.open = data['state'];
    chest.contents = data['contents']
    if (role == GIVER)
    {
        chest.sprite.image = get_asset('silhouette')

        const count = parseInt(chest.contents.at(-1) as string);
        const img =  {...DEFAULT_DRAWABLE_IMG, src: {x:0, y:0, w:44, h:32}};
        const dst = chest.sprite.dst as Rectangle;
        img.image = get_asset(chest.contents.slice(0, -1));
        img.dst = {x: dst.x, y: dst.y + dst.h * 0.05, w: dst.h * 0.75, h: dst.h * 0.75};

        // let start = (img.dst.w + 10) * count;
        const contentTotalWidth =  20 * count;
        let startX = dst.x + (dst.w * 0.5);
        // console.log('newbox', img.dst)

        startX -= contentTotalWidth * 0.5;
        // start =  (start / 2 )+ img.dst.x + (img.dst.w / 2)
        const dest = img.dst;
        // const newbox = scale_and_center({...img.dst, w:( img.dst.w + 10 )* count}, img.dst, 1);
        for (let x = 0; x < count; x += 1)
        {
            dest.x = startX;
            chest.contentimg.push({...img, dst: {...dest}});
            // startX += img.dst.w + 10;
            startX += 10;
        }
        console.log(chest.contentimg)
        // img.dst.x
    }
    else if (role == GUESSER)
    {
        chest.sprite.image = get_asset('chest');
        if (chest.open)
        {
            chest.sprite.src = {y:0, w:44, h:32, x: 44 * 4};
            chest.text.color = '#000000'
        }
        else {
            chest.sprite.src = {y:0, w:44, h:32, x:0};
            chest.text.color = '#FFFFFF'
        }
    }
}

export const construct_chest = (id:number) : Chest => {
    //fetch content from assets.ts
    const newChest: Chest = {
        open: false,
        id: id,
        contents: "",
        text: {...DEFAULT_DRAWABLE_TEXT, color:"#FFFFFF"},
        contentimg: [],
        sprite: {...DEFAULT_DRAWABLE_IMG, src: {x:0, y:0, w:44, h:32}}// {..box} or else it will assign as reference
        // sprite: {...DEFAULT_DRAWABLE_RECT, boundingBox: {...box}}// {..box} or else it will assign as reference
    }

    return newChest;
}
