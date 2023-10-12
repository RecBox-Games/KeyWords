import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_TEXT, DrawableImage,
         DrawableText } from "../controller_lib/types/drawables.js";
import { get_context } from "../controller_lib/init.js";
import { Rectangle } from "../controller_lib/types/shapes.js";
import { Button } from "../controller_lib/types/triggerable.js";
import { get_asset } from "./assets.js";

let menu:Menu;
export const get_menu = ():Menu => {return menu};

// Menu //
export interface Menu {
    show: boolean,
    header: DrawableText,
    base_sprite: DrawableImage,
    x_sprite: DrawableImage,
    x_button: Button,
}

// opening and closing menu //
export function post_menu() {
    fill_menu();
    size_menu();
    menu.header.text = "Menu";
    menu.show = true;
}

export const exit_menu_clicked = (_self:Button) => {
    menu.show = false;
}

// setting data for menu //
export function init_menu() {
    var button = new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined);
    menu =  {
        show: false,
        header: {...DEFAULT_DRAWABLE_TEXT, color: "#220000", font: "30px times"},
        base_sprite: {...DEFAULT_DRAWABLE_IMG},
        x_sprite: {...DEFAULT_DRAWABLE_IMG},
        x_button: button,
    }
}

export function size_menu() {
    const ctx = get_context();
    const base_box: Rectangle = {
        x: ctx.dimensions.x * 0.16,
        y: ctx.dimensions.y * 0.16,
        w: ctx.dimensions.x * 0.68,
        h: ctx.dimensions.y * 0.64,
    };
    menu.base_sprite.dst = base_box;
    const x_box: Rectangle = {
        x: base_box.x + base_box.w * (186/200),
        y: base_box.y + base_box.h * (3/100),
        w: base_box.w * (11/200),
        h: base_box.h * (11/100),
    }
    menu.x_sprite.dst = x_box;
    menu.x_button._boundingBox = x_box;
    const header_box: Rectangle = {
        x: base_box.x,
        y: base_box.y,
        w: base_box.w,
        h: base_box.h * (12/100),
    }
    menu.header.boundingBox = header_box;
}

export function fill_menu() {
    menu.base_sprite.image = get_asset('menu');
    menu.base_sprite.src = {x:0, y:0, w:200, h:100};
    menu.x_sprite.image = get_asset('x');
    menu.x_sprite.src = {x:0, y:0, w:11, h:11};
    menu.x_button._touchEndCallback = exit_menu_clicked;
}
