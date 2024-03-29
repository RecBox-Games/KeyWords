import { buttons_add } from "../../controller_lib/button.js";
import { get_context, } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT } from "../../controller_lib/types/drawables.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { get_asset } from "../../utils/assets.js";
import { TurnRole, is_clue, is_guess } from "../../utils/state_handler.js";
import { close_overlay } from "../../utils/utils.js";
export const size_overlay = (overlay, role) => {
    const ctx = get_context();
    if (is_clue(role)) {
        overlay.box.dst = { x: 0, y: 0, w: ctx.dimensions.x / 14, h: ctx.dimensions.y * 0.15 };
    }
    else if (is_guess(role)) {
        overlay.shadow = { ...DEFAULT_DRAWABLE_RECT };
        overlay.shadow.boundingBox = { x: 0, y: 0, w: ctx.dimensions.x, h: ctx.dimensions.y };
        overlay.box.dst = { x: ctx.dimensions.x * 0.25, y: ctx.dimensions.y * 0.25, w: ctx.dimensions.x * 0.5, h: ctx.dimensions.y * 0.5 };
        overlay.exit._boundingBox = { x: ctx.dimensions.x * 0.25 + 10, y: ctx.dimensions.y * 0.25 + 10, w: 50, h: 50 };
        overlay.exitSprite = { ...DEFAULT_DRAWABLE_RECT };
        overlay.exitSprite.boundingBox = overlay.exit._boundingBox;
        overlay.subtext.boundingBox = { ...overlay.box.dst, h: overlay.box.dst.h * 0.4, y: overlay.box.dst.y + overlay.box.dst.h * 0.2 };
        overlay.item.dst = {
            w: overlay.box.dst.w * .30,
            h: overlay.box.dst.h * .4,
            x: overlay.box.dst.x + (overlay.box.dst.w * .35),
            y: overlay.box.dst.y + overlay.box.dst.h - (overlay.box.dst.h * .45)
        };
    }
};
export const fill_overlay = (overlay, role) => {
    const ctx = get_context();
    size_overlay(overlay, role);
    if (role == TurnRole.RedClue || role == TurnRole.BlueClue) {
        overlay.subtext.font = '24px arial';
        overlay.box.image = get_asset('chest_contents');
    }
    else if (role == TurnRole.RedGuess || role == TurnRole.BlueGuess) {
        overlay.subtext.font = '30px arial';
        if (overlay.shadow) {
            overlay.shadow.color = "rgba(50, 50, 50, 0.3)";
            overlay.shadow.stroke = 0;
        }
        overlay.exit._touchEndCallback = close_overlay;
    }
    overlay.exit._active = false;
    buttons_add(overlay.exit);
};
export const construct_overlay = () => {
    const new_Overlay = {
        box: { ...DEFAULT_DRAWABLE_IMG },
        exit: new Button({ x: 0, y: 0, w: 0, h: 0 }, undefined, undefined, undefined),
        item: { ...DEFAULT_DRAWABLE_IMG },
        subtext: { ...DEFAULT_DRAWABLE_TEXT },
    };
    new_Overlay.exit._active = false;
    buttons_add(new_Overlay.exit);
    return new_Overlay;
};
