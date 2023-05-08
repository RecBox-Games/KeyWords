import { drawablesAdd } from "../../controller_lib/draw.js";
import { get_context } from "../../controller_lib/init.js";
import { get_loading } from "./init.js";
export const loading_loop = () => {
    const loading = get_loading();
    const ctx = get_context();
    if (!loading.sent && loading.done && (loading.barProgress | 0) >= (loading.progress | 0) && ctx.wsState == 1) {
        loading.sent = true;
        ctx.ws.send('staterequest');
    }
    if (loading.bar.src && loading.bar.dst && loading.barBG.dst && loading.bar.src.w <= 80) {
        loading.bar.src.w = loading.barProgress * 80;
        loading.bar.dst.w = loading.barBG.dst.w * loading.barProgress;
    }
    if (loading.barProgress < loading.progress)
        loading.barProgress += 0.05;
    drawablesAdd(loading.title);
    drawablesAdd(loading.barBG);
    drawablesAdd(loading.bar);
    // console.log("aa", ('.'.repeat((loading.text.text.length - 'Loading'.length) % 3)));
};
