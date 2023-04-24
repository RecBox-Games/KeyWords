import { buttons_add } from "../../controller_lib/button.js";
import { get_context, } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT } from "../../controller_lib/types/drawables.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { confirm_clue, confirm_guess, deny_guess } from "../../utils/utils.js";
import { GUESSER } from "../interfaces.js";
export const construct_topbar = (role) => {
    const topBar = {
        text: { ...DEFAULT_DRAWABLE_TEXT, text: "" },
        subText: { ...DEFAULT_DRAWABLE_TEXT, text: "" },
        accept: { ...DEFAULT_DRAWABLE_RECT, color: "#00FF00" },
        deny: { ...DEFAULT_DRAWABLE_RECT, color: "#FF0000" },
        acceptButton: new Button({ x: 0, y: 0, w: 0, h: 0 }, undefined, undefined, (role == GUESSER ? confirm_guess : confirm_clue)),
        denyButton: new Button({ x: 0, y: 0, w: 0, h: 0 }, undefined, undefined, deny_guess),
    };
    const ctx = get_context();
    const boundingBox = { x: 0, y: 0, w: ctx.dimensions.x, h: ctx.dimensions.y * 0.1 };
    topBar.text.boundingBox = { ...boundingBox };
    boundingBox.y += boundingBox.h;
    boundingBox.h = ctx.dimensions.y * 0.05;
    topBar.subText.boundingBox = { ...boundingBox };
    boundingBox.w = boundingBox.w * 0.1;
    boundingBox.x = ctx.dimensions.x * 0.5 - (boundingBox.w + boundingBox.w * 0.5);
    topBar.accept.boundingBox = { ...boundingBox };
    topBar.deny.boundingBox = { ...boundingBox, x: ctx.dimensions.x * 0.5 + (boundingBox.w * 0.5) };
    topBar.acceptButton._active = false;
    topBar.denyButton._active = false;
    topBar.acceptButton._boundingBox = topBar.accept.boundingBox;
    topBar.denyButton._boundingBox = topBar.deny.boundingBox;
    buttons_add(topBar.acceptButton);
    buttons_add(topBar.denyButton);
    return topBar;
};
