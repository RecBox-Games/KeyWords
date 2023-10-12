import { get_context, } from "../../controller_lib/init.js";
import { Context } from "../../controller_lib/types/context.js";
import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_TEXT, DrawableImage, DrawableText } from "../../controller_lib/types/drawables.js";
import { Rectangle } from "../../controller_lib/types/shapes.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { get_asset } from "../../utils/assets.js";
import { confirm_clue } from "../../utils/input.js";
import { is_guess, TurnRole } from "../../utils/state_handler.js";
import { confirm_guess, deny_guess } from "../../utils/utils.js";


export interface TopBar {
    text: DrawableText;
    subText: DrawableText;
    accept: DrawableImage;
    deny: DrawableImage;
    acceptButton: Button;
    denyButton: Button;
    keyButtons: Button[];
    keySprites: DrawableImage[];
    keyBgSprites: DrawableImage[];
}

export const size_topbar= (topBar:TopBar) => {
    const ctx = get_context();
    const boundingBox:Rectangle = {x:0, y:0, w: ctx.dimensions.x, h: ctx.dimensions.y * 0.06};
    topBar.text.boundingBox = {...boundingBox};
    topBar.subText.boundingBox = {...boundingBox};
    //
    const ctxw = ctx.dimensions.x;
    const ctxh = ctx.dimensions.y;
    boundingBox.x = ctxw * 0.23;
    boundingBox.y = ctxh * 0.013;
    boundingBox.w = ctxw * 0.13;
    boundingBox.h = ctxh * 0.13;
    topBar.accept.dst = {...boundingBox, x: (ctxw * 0.77) - boundingBox.w }
    topBar.deny.dst = {...boundingBox};
    //
    topBar.acceptButton._boundingBox = topBar.accept.dst;
    topBar.denyButton._boundingBox = topBar.deny.dst;
    //
    const dst: Rectangle = {
        x: ctxw * 0.018, y: ctxh * 0.135,
        w: ctxw * 0.09, h: ctxh * 0.16,
    };
    const margin = ctxh * 0.03;
    const yspace = ctxh * 0.015
    for (let x = 0; x < topBar.keyButtons.length; x += 1) {
        topBar.keyBgSprites[x].dst = {...dst};
        topBar.keyBgSprites[x].src = {x: 0, y: 0, w: 30, h: 30};
        topBar.keySprites[x].dst = {x: dst.x + margin,   y: dst.y + margin*.8,
                                    w: dst.w - margin*2, h: dst.h - margin*2};
        topBar.keySprites[x].src = {x: x* 22,y: 0, w: 22, h: 26};
        topBar.keyButtons[x]._boundingBox = {...dst};
        dst.y += dst.h + yspace;
    }
}

export const construct_topbar = ():TopBar => {
    const topBar:TopBar = {
        text: { ...DEFAULT_DRAWABLE_TEXT, text: "" },
        subText: { ...DEFAULT_DRAWABLE_TEXT, text: "" },
        accept: { ...DEFAULT_DRAWABLE_IMG, src: {x:64 * 2, y:0, w:64, h: 32} },
        deny:   { ...DEFAULT_DRAWABLE_IMG, src: {x:64 * 1, y:0, w:64, h: 32} },
        acceptButton: new Button({x:0, y:0, w:0, h: 0}, undefined, undefined,undefined),
        denyButton:   new Button({x:0, y:0, w:0, h: 0}, undefined, undefined, undefined),
        keyButtons:[],
        keySprites:[],
        keyBgSprites:[],
    };
    size_topbar(topBar);
    return topBar
}

export const fill_topbar = (topbar: TopBar, role: TurnRole) => {
    const button = { ...DEFAULT_DRAWABLE_IMG, image: get_asset('buttons') };
    if (is_guess(role)) {
        topbar.accept = { ...button, src: { x: 64 * 2, y: 0, w: 64, h: 32 } };
        topbar.deny =   { ...button, src: { x: 64 * 1, y: 0, w: 64, h: 32 } };
        topbar.acceptButton._touchEndCallback = confirm_guess;
        topbar.denyButton._touchEndCallback = deny_guess;
    } else if (topbar.keyButtons.length == 0) {
        const ctx: Context = get_context();
        const key: DrawableImage = { ...DEFAULT_DRAWABLE_IMG, image: get_asset('keys') };
        const keyBg: DrawableImage = { ...DEFAULT_DRAWABLE_IMG, image: get_asset('key_bg') };
        const dst: Rectangle = {
            x: ctx.dimensions.x * 0.005,
            y: ctx.dimensions.y * 0.05,
            w: ctx.dimensions.x * 0.06,
            h: ctx.dimensions.x * 0.06
        };
        topbar.keySprites.length = 0;
        topbar.keyBgSprites.length = 0;
        for (let x = 0; x < 4; x += 1) {
            topbar.keySprites.push({...key});
            topbar.keyBgSprites.push({...keyBg});
            topbar.keyButtons.push(new Button({ ...dst }, undefined, undefined,
                                             () => { confirm_clue(x + 1); }));
            dst.y += dst.h + ctx.dimensions.y * 0.01;
        }
    }
};
