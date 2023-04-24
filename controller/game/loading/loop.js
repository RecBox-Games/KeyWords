import { drawablesAdd } from "../../controller_lib/draw.js";
import { get_context } from "../../controller_lib/init.js";
import { get_loading } from "./init.js";
export const loading_loop = () => {
    const loading = get_loading();
    const ctx = get_context();
    if (!loading.sent && ctx.ws && ctx.wsState == 1) {
        loading.sent = true;
        ctx.ws.send('staterequest');
    }
    drawablesAdd(loading.BG);
    drawablesAdd(loading.bar);
    drawablesAdd(loading.barBG);
    drawablesAdd(loading.text);
    // loading.text.text = 'Loading' + ('.'.repeat(((loading.text.text.length - 'Loading'.length) + 1) % 3))
    // console.log("aa", ('.'.repeat((loading.text.text.length - 'Loading'.length) % 3)));
};
