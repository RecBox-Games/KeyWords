import { buttons_add } from "../../controller_lib/button.js";
import { get_context, } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT } from "../../controller_lib/types/drawables.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { close_overlay } from "../../utils/utils.js";
export const construct_overlay_giver = () => {
    const ctx = get_context();
    const new_Overlay = {
        box: { boundingBox: { x: 0, y: 0, w: ctx.dimensions.x / 16, h: ctx.dimensions.y * 0.1 }, color: '#FFFFFF', stroke: 0 },
        item: { ...DEFAULT_DRAWABLE_RECT },
        text: { ...DEFAULT_DRAWABLE_TEXT, text: "Contents:" },
        subtext: { ...DEFAULT_DRAWABLE_TEXT, text: "Knife, deals 2 adamage", font: '24px serif' },
    };
    return new_Overlay;
};
export const construct_overlay_guesser = () => {
    const ctx = get_context();
    const new_Overlay = {
        shadow: { boundingBox: { x: 0, y: 0, w: ctx.dimensions.x, h: ctx.dimensions.y }, color: "rgba(50, 50, 50, 0.3)", stroke: 0 },
        box: { boundingBox: { x: ctx.dimensions.x * 0.25, y: ctx.dimensions.y * 0.25, w: ctx.dimensions.x * 0.5, h: ctx.dimensions.y * 0.5 }, color: '#FF0000', stroke: 0 },
        exit: new Button({ x: ctx.dimensions.x * 0.25 + 10, y: ctx.dimensions.y * 0.25 + 10, w: 50, h: 50 }, undefined, undefined, close_overlay),
        exitSprite: { ...DEFAULT_DRAWABLE_RECT },
        item: { ...DEFAULT_DRAWABLE_RECT },
        text: { ...DEFAULT_DRAWABLE_TEXT, text: "The chest opens..." },
        subtext: { ...DEFAULT_DRAWABLE_TEXT, font: '30px serif' },
    };
    new_Overlay.exit._active = false;
    new_Overlay.exitSprite.boundingBox = new_Overlay.exit._boundingBox;
    new_Overlay.text.boundingBox = { ...new_Overlay.box.boundingBox, h: new_Overlay.box.boundingBox.h * 0.2 };
    new_Overlay.subtext.boundingBox = { ...new_Overlay.box.boundingBox, h: new_Overlay.box.boundingBox.h * 0.4, y: new_Overlay.box.boundingBox.y + new_Overlay.box.boundingBox.h * 0.2 };
    new_Overlay.item.boundingBox = {
        w: new_Overlay.box.boundingBox.w * .30,
        h: new_Overlay.box.boundingBox.h * .4,
        x: new_Overlay.box.boundingBox.x + (new_Overlay.box.boundingBox.w * .35),
        y: new_Overlay.box.boundingBox.y + new_Overlay.box.boundingBox.h - (new_Overlay.box.boundingBox.h * .45)
    };
    buttons_add(new_Overlay.exit);
    return new_Overlay;
};
