import { get_context, } from "../../controller_lib/init.js";
import { Context } from "../../controller_lib/types/context.js";
import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_TEXT, DrawableImage, DrawableText } from "../../controller_lib/types/drawables.js";
import { Rectangle } from "../../controller_lib/types/shapes.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { get_asset } from "../../utils/assets.js";
import { is_guess, TurnRole } from "../../utils/state_handler.js";
import { confirm_clue, confirm_guess, deny_guess } from "../../utils/utils.js";


export interface TopBar {
    text: DrawableText;
    subText: DrawableText;
    accept: DrawableImage;
    deny: DrawableImage;
    acceptButton: Button;
    denyButton: Button;
    keyButtons: Button[];
    keySprites: DrawableImage[];
}

export const size_topbar= (topBar:TopBar) => {
    const ctx = get_context();
    const boundingBox:Rectangle = {x:0, y:0, w: ctx.dimensions.x, h: ctx.dimensions.y * 0.06};
    topBar.text.boundingBox = {...boundingBox};
    topBar.subText.boundingBox = {...boundingBox};
    //
    boundingBox.x = ctx.dimensions.x * 0.23;
    boundingBox.y = ctx.dimensions.y * 0.013;
    boundingBox.w = ctx.dimensions.y * 0.26;
    boundingBox.h = ctx.dimensions.y * 0.13;
    topBar.accept.dst = {...boundingBox, x: (ctx.dimensions.x * 0.77) - boundingBox.w }
    topBar.deny.dst = {...boundingBox};
    //
    topBar.acceptButton._boundingBox = topBar.accept.dst;
    topBar.denyButton._boundingBox = topBar.deny.dst;
    //
    const dst: Rectangle = {
        x: ctx.dimensions.x * 0.02,
        y: ctx.dimensions.y * 0.20,
        w: ctx.dimensions.x * 0.06,
        h: ctx.dimensions.x * 0.06
    }
    for (let x = 0; x < topBar.keyButtons.length; x += 1) {
        topBar.keySprites[x].dst = {...dst};
        topBar.keySprites[x].src = {x: x* 22,y: 0, w: 22, h: 26};
        topBar.keyButtons[x]._boundingBox = {...dst};
        dst.y += dst.h + ctx.dimensions.y * 0.05;
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
        const dst: Rectangle = {
            x: ctx.dimensions.x * 0.005,
            y: ctx.dimensions.y * 0.05,
            w: ctx.dimensions.x * 0.06,
            h: ctx.dimensions.x * 0.06
        };
        topbar.keySprites.length = 0;
        for (let x = 0; x < 4; x += 1) {
            topbar.keySprites.push({...key});
            topbar.keyButtons.push(new Button({ ...dst }, undefined, undefined,
                                             () => { confirm_clue(x + 1); }));
            dst.y += dst.h + ctx.dimensions.y * 0.01;
        }
    }
};
