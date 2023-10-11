import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_TEXT, DrawableImage,
         DrawableText } from "../controller_lib/types/drawables.js";
import { buttons_add } from "../controller_lib/button.js";
import { get_context } from "../controller_lib/init.js";
import { Rectangle } from "../controller_lib/types/shapes.js";
import { Button } from "../controller_lib/types/triggerable.js";
import { Board, get_board } from "../game/main/init.js";
import { get_asset } from "./assets.js";
import { set_chests_active } from "./utils.js";

// Popup //
export interface Popup {
    show: boolean,
    message: DrawableText,
    base_sprite: DrawableImage,
    x_sprite: DrawableImage,
    x_button: Button,
}

// openning and closing popup //
export function post_popup(msg: string) {
    var popup = get_board().popup;
    popup.message.text = msg;
    popup.show = true;
    popup.x_button._active = true;
    buttons_add(popup.x_button);
    set_chests_active(false);
}

export const exit_popup_clicked = (_self:Button) => {
    const board:Board = get_board();
    board.popup.show = false;
    set_chests_active(true);
}

// setting data for popup //
export function construct_popup(): Popup {
    var button = new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined);
    button._active = false;
    buttons_add(button);
    return {
        show: false,
        message: {...DEFAULT_DRAWABLE_TEXT, color: "#220000", font: "26px times", center: false, wrap: true},
        base_sprite: {...DEFAULT_DRAWABLE_IMG},
        x_sprite: {...DEFAULT_DRAWABLE_IMG},
        x_button: button,
    }
}

export function size_popup() {
    var popup = get_board().popup;
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
    const message_box: Rectangle = {
        x: base_box.x + base_box.w * (18/200),
        y: base_box.y + base_box.h * (20/100),
        w: base_box.w * (164/200),
        h: base_box.h * (70/100),
    }
    popup.message.boundingBox = message_box;
    
}

export function fill_popup() {
    var popup = get_board().popup;
    popup.base_sprite.image = get_asset('popup');
    popup.base_sprite.src = {x:0, y:0, w:200, h:100};
    popup.x_sprite.image = get_asset('x');
    popup.x_sprite.src = {x:0, y:0, w:11, h:11};
    popup.x_button._touchEndCallback = exit_popup_clicked;
}
