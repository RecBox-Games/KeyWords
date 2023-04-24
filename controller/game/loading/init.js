import { get_context } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT } from "../../controller_lib/types/drawables.js";
const loading = {
    text: { ...DEFAULT_DRAWABLE_TEXT },
    barBG: { ...DEFAULT_DRAWABLE_RECT },
    bar: { ...DEFAULT_DRAWABLE_RECT }
};
export const get_loading = () => loading;
export const init_loading = () => {
    const ctx = get_context();
    const box = {
        x: ctx.dimensions.x * 0.25,
        y: ctx.dimensions.y * 0.75,
        w: ctx.dimensions.x * 0.5,
        h: ctx.dimensions.y * 0.2
    };
    loading.barBG.boundingBox = box;
    loading.bar.boundingBox = box;
    loading.text.text = 'Loading';
    loading.text.font = '4px serif';
    ctx.ws.send('staterequest');
};
