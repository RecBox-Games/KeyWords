import { drawablesAdd } from "../../controller_lib/draw.js";
import { get_loading } from "./init.js";
export const loading_loop = () => {
    const loading = get_loading();
    drawablesAdd(loading.bar);
    drawablesAdd(loading.barBG);
    drawablesAdd(loading.text);
    loading.text.text = 'Loading' + ('.'.repeat((loading.text.text.length - 'Loading'.length) % 3));
};
