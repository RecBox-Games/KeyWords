/*import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_TEXT, DrawableImage,
         DrawableText } from "../controller_lib/types/drawables.js";
import { get_context } from "../controller_lib/init.js";
import { Rectangle } from "../controller_lib/types/shapes.js";
import { Button } from "../controller_lib/types/triggerable.js";
import { get_asset } from "./assets.js";

let help:Help;
export const get_help = ():Help => {return help};

// Help //
export interface Help {
    help_sprite: DrawableImage,
    help_button: Button,
}

// setting data for help //
export function construct_help() {
    help =  {
        help_sprite: {...DEFAULT_DRAWABLE_IMG},
        help_button: new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined),
    }
}

export function initialize_help() {
    //
    help.help_sprite.image = get_asset('buttons');
    help.help_sprite.src = {x: 64*7, y: 0, w: 64, h: 32};
    help.help_button._touchEndCallback = help_clicked;
    //
    resize_help();
}

export function resize_help() {
    // graphics destination //
    const ctx = get_context();
    const ctxw = ctx.dimensions.x;
    const ctxh = ctx.dimensions.y;;
    const help_box: Rectangle = {
        x: ctxw * 0.008,  y: ctxh * 0.015,
        w: ctxw * 0.112,   h: ctxw * 0.05
    };
    help.help_sprite.dst          = help_box;
    help.help_button._boundingBox = help_box;
}


export const post_help = (message: string, help_callback: () => void) => {
    help.message.text = message;
    help.help_callback = help_callback;
    help.is_showing = true;
}

export const close_help = (_self: Button) => {
    help.is_showing = false;
}

export const show_popup = (_self: Button) => {
    get_popup() help.is_showing = false;
}

function help_clicked() {
    help.help_callback();
    help.is_showing = false;
}

*/
