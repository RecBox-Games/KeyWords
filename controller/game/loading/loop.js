import { drawablesAdd } from "../../controller_lib/draw.js";
import { get_context } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_RECT } from "../../controller_lib/types/drawables.js";
import { get_loading } from "./init.js";
export const loading_loop = () => {
    const loading = get_loading();
    const ctx = get_context();
    if (!loading.sent && loading.done && (loading.barProgress | 0) >= (loading.progress | 0) && ctx.wsState == 1) {
        loading.sent = true;
        ctx.ws.send('staterequest');
    }
    loading.BG.boundingBox.x = 0;
    loading.BG.boundingBox.y = 0;
    loading.BG.boundingBox.w = ctx.dimensions.x;
    loading.BG.boundingBox.h = ctx.dimensions.y;
    if (loading.bar.boundingBox.w <= loading.progress * loading.barBG.boundingBox.w)
        loading.bar.boundingBox.w += 0.01 * loading.barBG.boundingBox.w;
    else
        loading.barProgress = loading.progress;
    drawablesAdd(loading.BG);
    drawablesAdd(loading.barBG);
    drawablesAdd(loading.bar);
    drawablesAdd(loading.text);
    const line1 = { ...DEFAULT_DRAWABLE_RECT, color: `#F0FFFF` };
    const line2 = { ...DEFAULT_DRAWABLE_RECT, color: `#FF0FFF` };
    const line3 = { ...DEFAULT_DRAWABLE_RECT, color: `#FFF0FF` };
    const line4 = { ...DEFAULT_DRAWABLE_RECT, color: `#FFFF0F` };
    line1.boundingBox = { ...line1.boundingBox, w: ctx.dimensions.x, y: ctx.dimensions.y - 50, h: 50 };
    line2.boundingBox = { ...line2.boundingBox, w: ctx.dimensions.x, y: 0, h: 50 };
    line3.boundingBox = { ...line3.boundingBox, w: 50, y: 0, h: ctx.dimensions.y, x: 0 };
    line4.boundingBox = { ...line4.boundingBox, w: 50, y: 0, h: ctx.dimensions.y, x: ctx.dimensions.x - 50 };
    drawablesAdd(line1);
    drawablesAdd(line2);
    drawablesAdd(line3);
    drawablesAdd(line4);
    // console.log(line)
    // loading.text.text = 'Loading' + ('.'.repeat(((loading.text.text.length - 'Loading'.length) + 1) % 3))
    // console.log("aa", ('.'.repeat((loading.text.text.length - 'Loading'.length) % 3)));
};
