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
    //
    open_sprite: DrawableImage,
    open_button: Button,
    //
    container_sprite: DrawableImage,
    header: DrawableText,
    x_sprite: DrawableImage,
    x_button: Button,
}

// opening and closing menu //
export const post_menu = (_self: Button) => {
    console.log("--- menu post");
    menu.show = true;
}

export const exit_menu_clicked = (_self:Button) => {
    menu.show = false;
}

// setting data for menu //
export function construct_menu() {
    menu =  {
        show: false,
        open_button: new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined),
        open_sprite: {...DEFAULT_DRAWABLE_IMG},
        header: {...DEFAULT_DRAWABLE_TEXT, text: "Menu", color: "#220000", font: "30px times"},
        container_sprite: {...DEFAULT_DRAWABLE_IMG},
        x_sprite: {...DEFAULT_DRAWABLE_IMG},
        x_button: new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined),
    }
}

export function initialize_menu() {
    // graphics source //
    menu.open_sprite.image = get_asset('buttons');
    menu.open_sprite.src = {x: 64*4, y: 0, w: 64, h: 32};
    menu.open_button._touchEndCallback = post_menu;
    //
    menu.container_sprite.image = get_asset('popup');
    menu.container_sprite.src = {x:0, y:0, w:200, h:100};
    //
    menu.x_sprite.image = get_asset('x');
    menu.x_sprite.src = {x:0, y:0, w:11, h:11};
    menu.x_button._touchEndCallback = exit_menu_clicked;

    // graphics destination //
    const ctx = get_context();
    const ctxw = ctx.dimensions.x;
    const ctxh = ctx.dimensions.y;;
    const open_box: Rectangle = {
        x: ctxw * 0.008,  y: ctxh * 0.015,
        w: ctxw * 0.12,   h: ctxw * 0.06
    };
    const container_box: Rectangle = {
        x: ctxw * 0.16,  y: ctxh * 0.16,
        w: ctxw * 0.68,  h: ctxh * 0.64,
    };
    const x_box: Rectangle = {
        x: container_box.x + container_box.w * (186 / 200),
        y: container_box.y + container_box.h * (3 / 100),
        w: container_box.w * (11 / 200),  h: container_box.h * (11 / 100)
    };
    const header_box: Rectangle = {
        x: container_box.x,  y: container_box.y,
        w: container_box.w,  h: container_box.h * (12 / 100)
    };
    menu.open_sprite.dst          = open_box;
    menu.open_button._boundingBox = open_box;
    menu.container_sprite.dst     = container_box;
    menu.x_sprite.dst             = x_box;
    menu.x_button._boundingBox    = x_box;
    menu.header.boundingBox       = header_box;
}
