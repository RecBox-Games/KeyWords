import { buttons_add } from "../../controller_lib/button.js";
import { get_context, } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT, DrawableRect, DrawableText } from "../../controller_lib/types/drawables.js";
import { Rectangle } from "../../controller_lib/types/shapes.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { confirm_clue, confirm_guess, deny_guess } from "../../utils/utils.js";
import { GUESSER } from "../interfaces.js";


export interface TopBar {
    text: DrawableText;
    subText: DrawableText;
    accept:DrawableRect;
    deny:DrawableRect;
    acceptButton:Button;
    denyButton:Button;
}

export const fill_topbar = (topbar:TopBar ,role:number) => {
    if (role == GUESSER)
    {
        topbar.acceptButton._touchEndCallback = confirm_guess;
        topbar.denyButton._touchEndCallback = deny_guess;
    }
    else
        topbar.acceptButton._touchEndCallback = confirm_clue;
}

export const construct_topbar = ():TopBar =>
{
    const topBar:TopBar = {
        text: {...DEFAULT_DRAWABLE_TEXT, text:""},
        subText:{...DEFAULT_DRAWABLE_TEXT, text:""},
        accept: {...DEFAULT_DRAWABLE_RECT, color:"#00FF00"},
        deny: {...DEFAULT_DRAWABLE_RECT, color:"#FF0000"},
        acceptButton: new Button({x:0, y:0, w:0, h: 0}, undefined, undefined,undefined),
        denyButton: new Button({x:0, y:0, w:0, h: 0}, undefined, undefined, undefined),
    };
    const ctx = get_context();
    const boundingBox:Rectangle = {x:0, y:0, w: ctx.dimensions.x, h: ctx.dimensions.y * 0.1};

    topBar.text.boundingBox = {...boundingBox};

    boundingBox.y += boundingBox.h;
    boundingBox.h = ctx.dimensions.y * 0.05;

    topBar.subText.boundingBox = {...boundingBox};

    boundingBox.w = boundingBox.w * 0.1;
    boundingBox.x = ctx.dimensions.x * 0.5 - (boundingBox.w + boundingBox.w * 0.5);
    topBar.accept.boundingBox = {...boundingBox}
    topBar.deny.boundingBox = {...boundingBox, x : ctx.dimensions.x * 0.5 + (boundingBox.w * 0.5)}

    topBar.acceptButton._active = false;
    topBar.denyButton._active = false;

    topBar.acceptButton._boundingBox = topBar.accept.boundingBox;
    topBar.denyButton._boundingBox = topBar.deny.boundingBox;

    return topBar
}
