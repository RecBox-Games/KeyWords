import { buttons_add, buttons_flush } from "../../controller_lib/button.js";
import { drawablesAdd } from "../../controller_lib/draw.js";
import { get_context } from "../../controller_lib/init.js";
import { Context } from "../../controller_lib/types/context.js";
import { get_popup } from "../../utils/popup.js";
import { RoleScreen, get_role_screen } from "../role_screen/init.js";
import { Loading, get_loading } from "./init.js"

export const loading_loop = () => {
    const loading: Loading = get_loading();
    const ctx: Context = get_context();
    const role_screen: RoleScreen = get_role_screen();
    const popup = get_popup();

    //////// Buttons ////////
    buttons_flush();
    // popup
    if (popup.is_showing) {
        buttons_add(popup.gotit_button);
    }

    //////// Drawables ////////
    if (!popup.is_showing) {
        drawablesAdd(popup.base_sprite);
    }
    drawablesAdd(loading.title);
    drawablesAdd(loading.barBG);
    drawablesAdd(loading.bar);
    if (popup.is_showing) {
        drawablesAdd(popup.base_sprite);
        drawablesAdd(popup.gotit_sprite);
        drawablesAdd(popup.header);
        drawablesAdd(popup.message);
    }
    
    //////// other ////////      
    if (!loading.sent && loading.done &&
        (loading.barProgress | 0) >= (loading.progress | 0) &&
        ctx.wsState == 1) {
        loading.sent = true;
        ctx.ws.send('staterequest')
    }
    if ( loading.bar.src && loading.bar.dst && loading.barBG.dst && loading.bar.src.w <= 80) {
        loading.bar.src.w = loading.barProgress * 80;
        loading.bar.dst.w = loading.barBG.dst.w * loading.barProgress;
    }
    if (loading.barProgress < loading.progress) {
        loading.barProgress += 0.05;
    }
}
