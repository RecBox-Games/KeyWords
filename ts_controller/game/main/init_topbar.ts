import { buttons_add } from "../../controller_lib/button.js";
import { get_context, } from "../../controller_lib/init.js";
import { Context } from "../../controller_lib/types/context.js";
import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT, DrawableImage, DrawableRect, DrawableText } from "../../controller_lib/types/drawables.js";
import { Rectangle } from "../../controller_lib/types/shapes.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { get_asset } from "../../utils/assets.js";
import { confirm_clue, confirm_guess, deny_guess } from "../../utils/utils.js";
import { GUESSER } from "../interfaces.js";


export interface TopBar {
    text: DrawableText;
    subText: DrawableText;
    accept:DrawableRect;
    deny:DrawableRect;
    acceptButton:Button;
    denyButton:Button;
    clueCount:Button[];
    clueSprites:DrawableImage[];
}

export const size_topbar= (topBar:TopBar) =>
{
    const ctx = get_context();
    const boundingBox:Rectangle = {x:0, y:0, w: ctx.dimensions.x, h: ctx.dimensions.y * 0.07};

    topBar.text.boundingBox = {...boundingBox};

    boundingBox.h = ctx.dimensions.y * 0.08;

    topBar.subText.boundingBox = {...boundingBox};

    boundingBox.y = boundingBox.w * 0.03;
    boundingBox.w = boundingBox.w * 0.05;
    boundingBox.h = boundingBox.h * 0.7;
    boundingBox.x = ctx.dimensions.x * 0.6;
    topBar.accept.boundingBox = {...boundingBox}
    topBar.deny.boundingBox = {...boundingBox, x : boundingBox.x + boundingBox.w * 1.25};

    topBar.acceptButton._active = false;
    topBar.denyButton._active = false;


    topBar.acceptButton._boundingBox = topBar.accept.boundingBox;
    topBar.denyButton._boundingBox = topBar.deny.boundingBox;

    const key:DrawableImage = {...DEFAULT_DRAWABLE_IMG, image:get_asset('key')};
    const dst:Rectangle = {
        x: ctx.dimensions.x * 0.5 - (ctx.dimensions.x * 0.1 * 2),
        y: ctx.dimensions.y * 0.055,
        w: ctx.dimensions.x * 0.1,
        h: ctx.dimensions.y * 0.1
        }
    for (let x = 0; x < topBar.clueCount.length; x += 1)
    {
        topBar.clueSprites.push(
            {...key,
            src: {x: x * 32,y: 0, w: 32, h: 32},
            dst: {...dst}
            });
        topBar.clueSprites[x] .dst = {...dst};
        topBar.clueCount[x]._boundingBox = {...dst};
        // topBar.clueCount.push(new Button({...dst}, undefined, undefined, () => {confirm_clue(x + 1)} ));
        // topBar.clueCount[x]._active = false;
        dst.x += dst.w + 10;
        // buttons_add(topBar.clueCount[x])
    }


}

export const fill_topbar = (topbar:TopBar ,role:number) => {
    if (role == GUESSER)
    {
        topbar.acceptButton._touchEndCallback = confirm_guess;
        topbar.denyButton._touchEndCallback = deny_guess;
        buttons_add(topbar.denyButton)
    }
    else if (topbar.clueCount.length == 0)
    {
        const ctx:Context = get_context();
        const key:DrawableImage = {...DEFAULT_DRAWABLE_IMG, image:get_asset('key')};
        const dst:Rectangle = {
            x: ctx.dimensions.x * 0.5 - (ctx.dimensions.x * 0.1 * 2),
            y: ctx.dimensions.y * 0.055,
            w: ctx.dimensions.x * 0.1,
            h: ctx.dimensions.y * 0.1
            }
        for (let x = 0; x < 4; x += 1)
        {
            topbar.clueSprites.push(
                {...key,
                src: {x: x* 32,y: 0, w: 32, h: 32},
                dst: {...dst}
                });
            topbar.clueCount.push(new Button({...dst}, undefined, undefined, () => {confirm_clue(x + 1)} ));
            topbar.clueCount[x]._active = false;
            dst.x += dst.w + 10;
            buttons_add(topbar.clueCount[x])
        }
        // topbar.acceptButton._touchEndCallback = confirm_clue;

    }
    buttons_add(topbar.acceptButton)

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
        clueCount:[],
        clueSprites:[],
    };
    size_topbar(topBar);
    // buttons_add(topBar.denyButton);
    // buttons_add(topBar.acceptButton);

    return topBar
}
