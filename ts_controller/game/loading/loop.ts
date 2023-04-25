import { drawablesAdd } from "../../controller_lib/draw.js";
import { get_context } from "../../controller_lib/init.js";
import { Context } from "../../controller_lib/types/context.js";
import { Loading, get_loading } from "./init.js"

export const loading_loop = () => {
    const loading:Loading = get_loading();
    const ctx:Context = get_context();

    if (!loading.sent && loading.done && (loading.barProgress | 0) >= (loading.progress | 0) &&  ctx.wsState == 1)
    {
        loading.sent = true;
        ctx.ws.send('staterequest')
    }
    loading.BG.boundingBox.x = 0;
    loading.BG.boundingBox.y = 0;
    loading.BG.boundingBox.w = ctx.dimensions.x;
    loading.BG.boundingBox.h = ctx.dimensions.y;

    if (loading.bar.boundingBox.w <= loading.progress * loading.barBG.boundingBox.w)
        loading.bar.boundingBox.w += 0.01 * loading.barBG.boundingBox.w;
    else
        loading.barProgress = loading.progress
    drawablesAdd(loading.BG);
    drawablesAdd(loading.barBG);
    drawablesAdd(loading.bar);
    drawablesAdd(loading.text);

    // loading.text.text = 'Loading' + ('.'.repeat(((loading.text.text.length - 'Loading'.length) + 1) % 3))
    // console.log("aa", ('.'.repeat((loading.text.text.length - 'Loading'.length) % 3)));
}
