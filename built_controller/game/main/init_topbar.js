import { get_context, } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_TEXT } from "../../controller_lib/types/drawables.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { get_asset } from "../../utils/assets.js";
import { is_guess } from "../../utils/state_handler.js";
import { confirm_clue, confirm_guess, deny_guess } from "../../utils/utils.js";
export const size_topbar = (topBar) => {
    const ctx = get_context();
    const boundingBox = { x: 0, y: 0, w: ctx.dimensions.x, h: ctx.dimensions.y * 0.06 };
    topBar.text.boundingBox = { ...boundingBox };
    topBar.subText.boundingBox = { ...boundingBox };
    boundingBox.h = ctx.dimensions.y * 0.08;
    boundingBox.y = ctx.dimensions.y * 0.013;
    boundingBox.w = ctx.dimensions.y * 0.26;
    boundingBox.h = ctx.dimensions.y * 0.13;
    boundingBox.x = ctx.dimensions.x * 0.23;
    topBar.deny.dst = { ...boundingBox };
    topBar.accept.dst = { ...boundingBox, x: (ctx.dimensions.x * 0.77) - boundingBox.w };
    topBar.acceptButton._active = false;
    topBar.denyButton._active = false;
    topBar.acceptButton._boundingBox = topBar.accept.dst;
    topBar.denyButton._boundingBox = topBar.deny.dst;
    const dst = {
        x: ctx.dimensions.x * 0.005,
        y: ctx.dimensions.y * 0.05,
        w: ctx.dimensions.x * 0.06,
        h: ctx.dimensions.x * 0.06
    };
    for (let x = 0; x < topBar.clueCount.length; x += 1) {
        topBar.clueSprites[x].dst = { ...dst };
        topBar.clueSprites[x].src = { x: x * 22, y: 0, w: 22, h: 26 };
        topBar.clueCount[x]._boundingBox = { ...dst };
        dst.y += dst.h + ctx.dimensions.y * 0.05;
    }
    topBar.exit.boundingBox = {
        x: ctx.dimensions.x * 0.002,
        y: ctx.dimensions.y * 0.002,
        w: ctx.dimensions.x * 0.1,
        h: ctx.dimensions.y * 0.05,
    };
    // topBar.exitBtn._boundingBox = topBar.exit.boundingBox;
};
export const fill_topbar = (topbar, role) => {
    if (is_guess(role)) {
        const button = { ...DEFAULT_DRAWABLE_IMG, image: get_asset('buttons') };
        topbar.accept = { ...button, src: { x: 64 * 2, y: 0, w: 64, h: 32 } };
        topbar.deny = { ...button, src: { x: 64 * 1, y: 0, w: 64, h: 32 } };
        topbar.acceptButton._touchEndCallback = confirm_guess;
        topbar.denyButton._touchEndCallback = deny_guess;
    }
    else if (topbar.clueCount.length == 0) {
        const ctx = get_context();
        const key = { ...DEFAULT_DRAWABLE_IMG, image: get_asset('keys') };
        const dst = {
            x: ctx.dimensions.x * 0.005,
            y: ctx.dimensions.y * 0.05,
            w: ctx.dimensions.x * 0.06,
            h: ctx.dimensions.x * 0.06
        };
        topbar.clueSprites.length = 0;
        for (let x = 0; x < 4; x += 1) {
            topbar.clueSprites.push({ ...key,
            });
            topbar.clueCount.push(new Button({ ...dst }, undefined, undefined, () => { confirm_clue(x + 1); }));
            topbar.clueCount[x]._active = false;
            // dst.x += dst.w + 10;
            dst.y += dst.h + ctx.dimensions.y * 0.01;
        }
        // topbar.acceptButton._touchEndCallback = confirm_clue;
    }
};
export const construct_topbar = () => {
    const topBar = {
        text: { ...DEFAULT_DRAWABLE_TEXT, text: "" },
        subText: { ...DEFAULT_DRAWABLE_TEXT, text: "" },
        accept: { ...DEFAULT_DRAWABLE_IMG, src: { x: 64 * 2, y: 0, w: 64, h: 32 } },
        deny: { ...DEFAULT_DRAWABLE_IMG, src: { x: 64, y: 0, w: 64, h: 32 } },
        acceptButton: new Button({ x: 0, y: 0, w: 0, h: 0 }, undefined, undefined, undefined),
        denyButton: new Button({ x: 0, y: 0, w: 0, h: 0 }, undefined, undefined, undefined),
        clueCount: [],
        clueSprites: [],
        exitBtn: new Button({ x: 0, y: 0, h: 0, w: 0 }, undefined, undefined, (self) => { get_context().ws.send('kill'); }),
        exit: { ...DEFAULT_DRAWABLE_TEXT, text: "EXIT GAME", font: '20px arial', color: '#FF1111' },
    };
    size_topbar(topBar);
    return topBar;
};
