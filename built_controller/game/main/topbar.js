import { get_context, } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_TEXT } from "../../controller_lib/types/drawables.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { get_asset } from "../../utils/assets.js";
import { is_guess } from "../../utils/state_handler.js";
import { activate_button } from "../../utils/submit_button.js";
import { confirm_guess, deny_guess } from "../../utils/utils.js";
import { get_board } from "./init.js";
export const size_topbar = (topBar) => {
    const ctx = get_context();
    const boundingBox = { x: ctx.dimensions.x * 0.25, y: ctx.dimensions.y * 0.013,
        w: ctx.dimensions.x * 0.5, h: ctx.dimensions.y * 0.11 };
    topBar.textBg.dst = { ...boundingBox };
    topBar.text.boundingBox = { ...boundingBox, h: ctx.dimensions.y * 0.07 };
    topBar.subText.boundingBox = { ...boundingBox };
    //
    const ctxw = ctx.dimensions.x;
    const ctxh = ctx.dimensions.y;
    boundingBox.x = ctxw * 0.24;
    boundingBox.y = ctxh * 0.01;
    boundingBox.w = ctxw * 0.12;
    boundingBox.h = ctxh * 0.12;
    topBar.accept.dst = { ...boundingBox, x: (ctxw * 0.76) - boundingBox.w };
    topBar.deny.dst = { ...boundingBox };
    //
    topBar.acceptButton._boundingBox = topBar.accept.dst;
    topBar.denyButton._boundingBox = topBar.deny.dst;
    //
    const dst = {
        x: ctxw * 0.018, y: ctxh * 0.14,
        w: ctxw * 0.09, h: ctxh * 0.16,
    };
    const margin = ctxh * 0.03;
    const yspace = ctxh * 0.01;
    for (let x = 0; x < topBar.keyButtons.length; x += 1) {
        topBar.keyBgSpritesSelected[x].dst = { ...dst };
        topBar.keyBgSpritesSelected[x].src = { x: 0, y: 0, w: 30, h: 30 };
        topBar.keyBgSprites[x].dst = { ...dst };
        topBar.keyBgSprites[x].src = { x: 0, y: 0, w: 30, h: 30 };
        topBar.keySprites[x].dst = { x: dst.x + margin * 1.3, y: dst.y + margin * .8,
            w: dst.w - margin * 2.6, h: dst.h - margin * 2 };
        topBar.keySprites[x].src = { x: x * 22, y: 0, w: 22, h: 26 };
        topBar.keyButtons[x]._boundingBox = { ...dst };
        dst.y += dst.h + yspace;
    }
};
export const construct_topbar = () => {
    const topBar = {
        text: { ...DEFAULT_DRAWABLE_TEXT, text: "" },
        textBg: { ...DEFAULT_DRAWABLE_IMG, src: { x: 0, y: 0, w: 200, h: 30 } },
        subText: { ...DEFAULT_DRAWABLE_TEXT, text: "" },
        accept: { ...DEFAULT_DRAWABLE_IMG, src: { x: 64 * 2, y: 0, w: 64, h: 32 } },
        deny: { ...DEFAULT_DRAWABLE_IMG, src: { x: 64 * 1, y: 0, w: 64, h: 32 } },
        acceptButton: new Button({ x: 0, y: 0, w: 0, h: 0 }, undefined, undefined, undefined),
        denyButton: new Button({ x: 0, y: 0, w: 0, h: 0 }, undefined, undefined, undefined),
        keyButtons: [],
        keySprites: [],
        keyBgSprites: [],
        keyBgSpritesSelected: [],
        isAKeySelected: false,
        selectedKey: 0,
    };
    size_topbar(topBar);
    return topBar;
};
export const fill_topbar = (topbar, role) => {
    const button = { ...DEFAULT_DRAWABLE_IMG, image: get_asset('buttons') };
    topbar.textBg = { ...DEFAULT_DRAWABLE_IMG, src: { x: 0, y: 0, w: 200, h: 30 }, image: get_asset('header') };
    if (is_guess(role)) {
        topbar.accept = { ...button, src: { x: 64 * 2, y: 0, w: 64, h: 32 } };
        topbar.deny = { ...button, src: { x: 64 * 1, y: 0, w: 64, h: 32 } };
        topbar.acceptButton._touchEndCallback = confirm_guess;
        topbar.denyButton._touchEndCallback = deny_guess;
    }
    else if (topbar.keyButtons.length == 0) {
        const ctx = get_context();
        const key = { ...DEFAULT_DRAWABLE_IMG, image: get_asset('keys') };
        const keyBg = { ...DEFAULT_DRAWABLE_IMG, image: get_asset('key_bg') };
        const keyBgSelected = { ...DEFAULT_DRAWABLE_IMG, image: get_asset('key_bg_selected') };
        const dst = {
            x: ctx.dimensions.x * 0.005,
            y: ctx.dimensions.y * 0.05,
            w: ctx.dimensions.x * 0.06,
            h: ctx.dimensions.x * 0.06
        };
        topbar.keySprites.length = 0;
        topbar.keyBgSprites.length = 0;
        topbar.keyBgSpritesSelected.length = 0;
        for (let x = 0; x < 4; x += 1) {
            topbar.keySprites.push({ ...key });
            topbar.keyBgSprites.push({ ...keyBg });
            topbar.keyBgSpritesSelected.push({ ...keyBgSelected });
            topbar.keyButtons.push(new Button({ ...dst }, undefined, undefined, key_button_clicked));
            topbar.keyButtons[x].data = x;
            dst.y += dst.h + ctx.dimensions.y * 0.01;
        }
    }
};
const key_button_clicked = (b) => {
    var topbar = get_board().topbar;
    topbar.isAKeySelected = true;
    activate_button();
    topbar.selectedKey = b.data;
};
