import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_TEXT, DrawableImage,
         DrawableText } from "../controller_lib/types/drawables.js";
import { get_context } from "../controller_lib/init.js";
import { Rectangle } from "../controller_lib/types/shapes.js";
import { Button } from "../controller_lib/types/triggerable.js";
import { get_asset } from "./assets.js";

let confirmation:Confirmation;
export const get_confirmation = ():Confirmation => {return confirmation};

// Confirmation //
export interface Confirmation {
    is_showing: boolean,
    confirm_callback: () => void,
    //
    container_sprite: DrawableImage,
    message: DrawableText,
    confirm_sprite: DrawableImage,
    confirm_button: Button,
    cancel_sprite: DrawableImage,
    cancel_button: Button,
}

// setting data for confirmation //
export function construct_confirmation() {
    confirmation =  {
        is_showing: false,
        confirm_callback: () => {},
        container_sprite: {...DEFAULT_DRAWABLE_IMG},
        message: {...DEFAULT_DRAWABLE_TEXT, color: "#220000", font: "26px arial"},
        confirm_sprite: {...DEFAULT_DRAWABLE_IMG},
        confirm_button: new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined),
        cancel_sprite: {...DEFAULT_DRAWABLE_IMG},
        cancel_button: new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined),
    }
}

export function initialize_confirmation() {
    // graphics source //
    confirmation.container_sprite.image = get_asset('confirmation');
    confirmation.container_sprite.src = {x:0, y:0, w:100, h:50};
    //
    confirmation.confirm_sprite.image = get_asset('buttons');
    confirmation.confirm_sprite.src = {x: 64*7, y: 0, w: 64, h: 32};
    confirmation.confirm_button._touchEndCallback = confirm_clicked;
    //
    confirmation.cancel_sprite.image = get_asset('buttons');
    confirmation.cancel_sprite.src = {x: 64*6, y: 0, w: 64, h: 32};
    confirmation.cancel_button._touchEndCallback = close_confirmation;
    //
    resize_confirmation();
}

export function resize_confirmation() {
    // graphics destination //
    const ctx = get_context();
    const ctxw = ctx.dimensions.x;
    const ctxh = ctx.dimensions.y;;
    const c_box: Rectangle = {
        x: ctxw * 0.3,  y: ctxh * 0.3,
        w: ctxw * 0.4,  h: ctxh * 0.4,
    };
    const message_box: Rectangle = {
        x: c_box.x + c_box.w * 0.1,
        y: c_box.y + c_box.h * 0.2,
        w: c_box.w * 0.8,  h: c_box.h * 0.15,
    };
    const btn_scale = .5;
    const margin = 0.12;
    const confirm_box: Rectangle = {
        x: c_box.x + c_box.w * margin,
        y: c_box.y + c_box.h * 0.5,
        w: c_box.w * (64*btn_scale / 100),
        h: c_box.h * (32*btn_scale / 50),
    };
    const cancel_box: Rectangle = {
        ...confirm_box,
        x: c_box.x + c_box.w - confirm_box.w - margin * c_box.w,
    };
    confirmation.container_sprite.dst = c_box;
    confirmation.message.boundingBox = message_box;
    confirmation.confirm_sprite.dst          = confirm_box;
    confirmation.confirm_button._boundingBox = confirm_box;
    confirmation.cancel_sprite.dst          = cancel_box;
    confirmation.cancel_button._boundingBox = cancel_box;
}


export const post_confirmation = (message: string, confirm_callback: () => void) => {
    confirmation.message.text = message;
    confirmation.confirm_callback = confirm_callback;
    confirmation.is_showing = true;
}

export const close_confirmation = (_self: Button) => {
    confirmation.is_showing = false;
}

function confirm_clicked() {
    confirmation.confirm_callback();
    confirmation.is_showing = false;
}

