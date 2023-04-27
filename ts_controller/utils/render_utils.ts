import { drawableRenderSingle } from "../controller_lib/draw.js";
import { get_context } from "../controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG, DrawableImage } from "../controller_lib/types/drawables.js";
import { Rectangle } from "../controller_lib/types/shapes.js";
import { BOARD_H, BOARD_W } from "../game/interfaces.js";
import { Board, get_board } from "../game/main/init.js";
import { Anim } from "./animation.js";
import { get_asset } from "./assets.js";

let drawable_grass:DrawableImage;
let drawable_chestgrass:DrawableImage;
let anim:Anim = {
    frame: 0.0,
    max_frame: 6,
    animate_fn : () => {animate_grass()},
    object: null
}

export const prepare_grass = () => {
    const ctx = get_context();
    const dst_box:Rectangle = {
            x: 0,
            y: 0,
            h: 120,
            w: 600
        };
    // const src_box = {x:0, y:8, w:30, h:32};
    drawable_grass = {...DEFAULT_DRAWABLE_IMG, image: get_asset('grass'), dst:{...dst_box}, scale:2};
    // drawable_grass = {...DEFAULT_DRAWABLE_IMG, image: get_asset('grass'), src:src_box, dst:{...dst_box}};
    // drawable_chestgrass = {...DEFAULT_DRAWABLE_IMG, image: get_asset('grass_chest'), src:src_box, dst:{...dst_box}};
    console.log(drawable_grass);
}

export const animate_grass = () => {
    anim.frame += 0.05;
    (drawable_grass.src as Rectangle).x = (drawable_grass.src as Rectangle).w * (anim.frame | 0)
    if (anim.frame >= anim.max_frame)
        anim.frame = 0;
}


export const render_grass = () => {
    const ctx = get_context();
    // drawable_grass.dst = {
    //         x: 0,
    //         y: 0,
    //         h: (ctx.dimensions.y - ctx.dimensions.y * 0.12) / 5.4,
    //         w: ctx.dimensions.x / 6
    //     };
    const divx = ctx.dimensions.x / 300;
    const divy = ctx.dimensions.y / 240;
    for (let y = 0; y < ctx.dimensions.y; y += (drawable_grass.dst as Rectangle).h / 4)
    {
        for (let x = 0; x < ctx.dimensions.x; x += (drawable_grass.dst as Rectangle).w)
        {
            if (drawable_grass.dst)
            {
                drawable_grass.dst.x = x;
                drawable_grass.dst.y = y;
                drawableRenderSingle(ctx, drawable_grass);
            }
        }

    }

}

export const render_chest_grass = () => {
    const board:Board = get_board();
    const ctx = get_context();
    drawable_chestgrass.dst = {
                x: 0,
                y: 0,
                h: (ctx.dimensions.y - ctx.dimensions.y * 0.12) / 5.4,
                w: ctx.dimensions.x / 6
            };
    for (let x = 0; x < BOARD_W; x += 1)
    {
        for (let y = 0; y < BOARD_H; y += 1)
        {
            drawable_chestgrass.dst = board.chests[y][x].sprite.dst;
            drawableRenderSingle(ctx, drawable_chestgrass);
        }
    }
}
