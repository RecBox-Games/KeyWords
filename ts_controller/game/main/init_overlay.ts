import { buttons_add } from "../../controller_lib/button.js";
import { get_context, } from "../../controller_lib/init.js";
import { Context } from "../../controller_lib/types/context.js";
import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT, DrawableImage, DrawableRect, DrawableText } from "../../controller_lib/types/drawables.js";
import { Rectangle } from "../../controller_lib/types/shapes.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { close_overlay } from "../../utils/utils.js";
import { BOARD_H, GIVER, GUESSER } from "../interfaces.js";



export interface Overlay {
    shadow?: DrawableRect;
    exit: Button;
    exitSprite?: DrawableRect;
    box:DrawableRect;
    text:DrawableText;
    subtext:DrawableText;
    item:DrawableImage;
}

export const size_overlay = (overlay:Overlay ,role:number) => {
    const ctx:Context = get_context();

    if (role == GIVER)
    {
        overlay.box .boundingBox = {x:0, y:0, w: ctx.dimensions.x / 16, h : ctx.dimensions.y * 0.1};

    }
    else if (role == GUESSER)
    {
        overlay.shadow = {...DEFAULT_DRAWABLE_RECT};
        overlay.shadow.boundingBox = {x: 0, y: 0, w : ctx.dimensions.x, h : ctx.dimensions.y};

        overlay.box.boundingBox = {x: ctx.dimensions.x *0.25, y: ctx.dimensions.y *0.25, w : ctx.dimensions.x *0.5, h : ctx.dimensions.y*0.5};
        (overlay.exit._boundingBox as Rectangle) = {x: ctx.dimensions.x *0.25 + 10, y:ctx.dimensions.y *0.25 + 10, w:50, h: 50}

        overlay.exitSprite = {...DEFAULT_DRAWABLE_RECT};
        overlay.exitSprite.boundingBox = ((overlay.exit as Button)._boundingBox as Rectangle);

        overlay.text.boundingBox = {...overlay.box.boundingBox, h: overlay.box.boundingBox.h * 0.2};
        overlay.subtext.boundingBox = {...overlay.box.boundingBox, h: overlay.box.boundingBox.h * 0.4, y: overlay.box.boundingBox.y + overlay.box.boundingBox.h * 0.2};
        overlay.item.dst = {
            w: overlay.box.boundingBox.w * .30,
            h: overlay.box.boundingBox.h *.4,
            x: overlay.box.boundingBox.x + (overlay.box.boundingBox.w * .35),
            y: overlay.box.boundingBox.y + overlay.box.boundingBox.h - (overlay.box.boundingBox.h * .45)
        };
    }
}

export const fill_overlay = (overlay:Overlay ,role:number) => {
    const ctx:Context = get_context();

    size_overlay(overlay, role);
    if (role == GIVER)
    {
        overlay.box.color = '#FFFFFF';
        overlay.subtext.font = '24px serif';
        overlay.box.stroke = 0;
    }
    else if (role == GUESSER)
    {
        overlay.text.text = 'The chest opens';
        overlay.subtext.font = '30px serif';

        if (overlay.shadow)
        {
            overlay.shadow.color = "rgba(50, 50, 50, 0.3)";
            overlay.shadow.stroke = 0;
        }

        overlay.box.color = '#FF0000';
        overlay.box.stroke = 0;

        overlay.exit._touchEndCallback = close_overlay;
    }
    overlay.exit._active = false;
    buttons_add(overlay.exit);
}


export const construct_overlay = () :Overlay => {
    const new_Overlay:Overlay = {
        box:  {...DEFAULT_DRAWABLE_RECT},
        exit: new Button({x:0, y:0, w:0, h: 0}, undefined, undefined, undefined),
        item: {...DEFAULT_DRAWABLE_IMG},
        text: {...DEFAULT_DRAWABLE_TEXT},
        subtext: {...DEFAULT_DRAWABLE_TEXT},
    };
    new_Overlay.exit._active = false;
    buttons_add(new_Overlay.exit);
    return new_Overlay;
}
