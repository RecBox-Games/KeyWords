import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_TEXT, DrawableImage,
         DrawableText } from "../controller_lib/types/drawables.js";
import { buttons_add } from "../controller_lib/button.js";
import { get_context } from "../controller_lib/init.js";
import { Rectangle } from "../controller_lib/types/shapes.js";
import { Button } from "../controller_lib/types/triggerable.js";
import { get_asset } from "./assets.js";
import { set_chest_buttons_activeness, set_key_buttons_activeness,
         set_menu_buttons_activeness } from "./utils.js";

let popup:Popup;
export const get_popup = ():Popup => {return popup};

// Popup //
export interface Popup {
    show: boolean,
    header: DrawableText,
    message: DrawableText,
    base_sprite: DrawableImage,
    x_sprite: DrawableImage,
    x_button: Button,
}

// opening and closing popup //
export function post_popup(header: string, message: string) {
    return;
    fill_popup();
    size_popup();
    popup.header.text = header;
    popup.message.text = message;
    popup.show = true;
    popup.x_button._active = true;
    buttons_add(popup.x_button);
    set_chest_buttons_activeness(false);
    set_menu_buttons_activeness(false);
    set_key_buttons_activeness(false);
}

export const exit_popup_clicked = (_self:Button) => {
    popup.show = false;
    set_chest_buttons_activeness(true);
    set_menu_buttons_activeness(true);
    set_key_buttons_activeness(true);
}

// setting data for popup //
export function init_popup() {
    var button = new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined);
    button._active = false;
    buttons_add(button);
    popup =  {
        show: false,
        header: {...DEFAULT_DRAWABLE_TEXT, color: "#220000", font: "30px times"},
        message: {...DEFAULT_DRAWABLE_TEXT, color: "#220000", font: "26px times", center: false, wrap: true},
        base_sprite: {...DEFAULT_DRAWABLE_IMG},
        x_sprite: {...DEFAULT_DRAWABLE_IMG},
        x_button: button,
    }
}

export function size_popup() {
    const ctx = get_context();
    const base_box: Rectangle = {
        x: ctx.dimensions.x * 0.16,
        y: ctx.dimensions.y * 0.16,
        w: ctx.dimensions.x * 0.68,
        h: ctx.dimensions.y * 0.64,
    };
    popup.base_sprite.dst = base_box;
    const x_box: Rectangle = {
        x: base_box.x + base_box.w * (186/200),
        y: base_box.y + base_box.h * (3/100),
        w: base_box.w * (11/200),
        h: base_box.h * (11/100),
    }
    popup.x_sprite.dst = x_box;
    popup.x_button._boundingBox = x_box;
    const header_box: Rectangle = {
        x: base_box.x,
        y: base_box.y,
        w: base_box.w,
        h: base_box.h * (12/100),
    }
    const message_box: Rectangle = {
        x: base_box.x + base_box.w * (18/200),
        y: base_box.y + base_box.h * (23/100),
        w: base_box.w * (170/200),
        h: base_box.h * (70/100),
    }
    popup.header.boundingBox = header_box;
    popup.message.boundingBox = message_box;
}

export function fill_popup() {
    popup.base_sprite.image = get_asset('popup');
    popup.base_sprite.src = {x:0, y:0, w:200, h:100};
    popup.x_sprite.image = get_asset('x');
    popup.x_sprite.src = {x:0, y:0, w:11, h:11};
    popup.x_button._touchEndCallback = exit_popup_clicked;
}
