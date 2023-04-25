import { get_context } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT } from "../../controller_lib/types/drawables.js";
const loading = {
    text: { ...DEFAULT_DRAWABLE_TEXT },
    barBG: { ...DEFAULT_DRAWABLE_RECT },
    bar: { ...DEFAULT_DRAWABLE_RECT },
    sent: false,
    BG: { ...DEFAULT_DRAWABLE_RECT },
    progress: 0.0
};
export const get_loading = () => loading;
export const init_loading = () => {
    const ctx = get_context();
    const box = {
        x: ctx.dimensions.x * 0.15,
        y: ctx.dimensions.y * 0.65,
        w: ctx.dimensions.x * 0.70,
        h: ctx.dimensions.y * 0.1
    };
    loading.barBG.boundingBox = box;
    loading.bar.boundingBox = box;
    loading.text.boundingBox = { ...box, y: box.y - (box.h * 2) };
    loading.text.text = 'Loading';
    loading.text.font = '80px serif';
    loading.text.color = '#FF0000';
    loading.BG.boundingBox.w = ctx.dimensions.x;
    loading.BG.boundingBox.h = ctx.dimensions.y;
    loading.BG.color = '#AAAAAA';
    // Promise.allSettled()
    // console.log("socket", ctx.ws, ctx.wsState)
};
