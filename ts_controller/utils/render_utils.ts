import { drawableRenderSingle, drawablesAdd } from "../controller_lib/draw.js";
import { get_context } from "../controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG, DrawableImage } from "../controller_lib/types/drawables.js";
import { Rectangle } from "../controller_lib/types/shapes.js";
import { BOARD_H, BOARD_W } from "../game/interfaces.js";
import { Board, get_board } from "../game/main/init.js";
import { Anim } from "./animation.js";
import { get_asset } from "./assets.js";

let drawable_grass:DrawableImage[] = [];
let drawable_chestgrass:DrawableImage[] = [];
let anim:Anim[] = [];

export const prepare_grass = () => {
    const ctx = get_context();
    const board:Board = get_board();
    const dst_box:Rectangle = {
            x: 0,
            y: 0,
            h: 120,
            w: 600
        };
    // const src_box = {x:0, y:8, w:30, h:32};
    const src_box = {x:0, y:0, h:60, w:300};
    drawable_grass.length = 0;
    // let frame = 0
    // for (let y = -120; y < ctx.dimensions.y; y += dst_box.h / 2)
    // {
    //     const offset = (- Math.random() * 300);
    //     frame = (frame + 1) % 18;
    //     const box = {...src_box};
    //     for (let x = offset; x < ctx.dimensions.x; x += dst_box.w + 50)
    //     {
    //         drawable_grass.push({...DEFAULT_DRAWABLE_IMG, src: box, image: get_asset('grass'), dst:{...dst_box, x:x, y: y}, scale:2});

    //     }
    //     //  anim.push({
    //     //                 frame: frame,
    //     //                 max_frame: 18,
    //     //                 animate_fn : () => {animate_grass()},
    //     //                 object: box
    //     //             })
    // }

    drawable_chestgrass.length = 0;
     for (let x = 0; x < BOARD_W; x += 1)
    {

        for (let y = 0; y < BOARD_H; y += 1)
        {

             drawable_chestgrass.push({...DEFAULT_DRAWABLE_IMG, image: get_asset('grass'), src:src_box,
             dst: {
                ...(board.chests[y][x].sprite.dst as Rectangle),
                h: (board.chests[y][x].sprite.dst as Rectangle).h * 0.3,
                y:((board.chests[y][x].sprite.dst as Rectangle).y + ((board.chests[y][x].sprite.dst as Rectangle).h - (board.chests[y][x].sprite.dst as Rectangle).h * 0.27))
                }})
                anim.push({
                            frame: 0,
                            max_frame: 18,
                            animate_fn : () => {animate_grass()},
                            object: src_box
                        })
            // drawableRenderSingle(ctx, drawable_chestgrass);
        }
    }
    // drawable_grass = {...DEFAULT_DRAWABLE_IMG, image: get_asset('grass'), src:src_box, dst:{...dst_box}};
    // drawable_chestgrass = {...DEFAULT_DRAWABLE_IMG, image: get_asset('grass_chest'), src:src_box, dst:{...dst_box}};
    console.log(drawable_grass);
}

export const animate_grass = () => {
    for (let single of anim)
    {
        single.frame += 0.085;
        (single.object as Rectangle).x = (single.object as Rectangle).w * (single.frame | 0);
        if (single.frame >= single.max_frame)
            single.frame = 0;

    }
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
    let i = 0;
    // for (let y = 0; y < ctx.dimensions.y; y += (drawable_grass.dst as Rectangle).h / 4)
    // {
    //     for (let x = offsets[i]; x < ctx.dimensions.x; x += (drawable_grass.dst as Rectangle).w)
    //     {
    //         if (drawable_grass.dst)
    //         {
    //             drawable_grass.dst.x = x;
    //             drawable_grass.dst.y = y;
    //             drawableRenderSingle(ctx, drawable_grass);
    //         }
    //     }
    //     i += 1;

    // }

    for (let obj of drawable_grass)
    {
        drawablesAdd(obj);
    }

}
export const size_grass = () => {
      const board:Board = get_board();
    for (let obj of drawable_chestgrass)
    {
        if (obj.dst)
            obj.dst.y += (board.chests[0][0].sprite.dst as Rectangle).h * 0.5
        drawablesAdd(obj)
    }
}

export const render_chest_grass = () => {

    const ctx = get_context();


    for (let obj of drawable_chestgrass)
    {
        drawablesAdd(obj)
    }
    // drawable_chestgrass.dst = {
    //             x: 0,
    //             y: 0,
    //             h: (ctx.dimensions.y - ctx.dimensions.y * 0.12) / 5.4,
    //             w: ctx.dimensions.x / 6
    //         };
    // for (let x = 0; x < BOARD_W; x += 1)
    // {
    //     for (let y = 0; y < BOARD_H; y += 1)
    //     {
    //         drawable_chestgrass.dst = board.chests[y][x].sprite.dst;
    //         drawableRenderSingle(ctx, drawable_chestgrass);
    //     }
    // }
}
