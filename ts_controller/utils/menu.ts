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
    is_showing: boolean,
    is_tut_enabled: boolean,
    //
    open_sprite: DrawableImage,
    open_button: Button,
    //
    container_sprite: DrawableImage,
    header: DrawableText,
    x_sprite: DrawableImage,
    x_button: Button,
    end_game_sprite: DrawableImage,
    end_game_button: Button,
    toggle_walkthrough_sprite: DrawableImage,
    toggle_walkthrough_button: Button,
    tut_enabled_sprite: DrawableImage,
    tut_disabled_sprite: DrawableImage,
}

// setting data for menu //
export function construct_menu() {
    menu =  {
        is_showing: false,
        is_tut_enabled: true,
        open_button: new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined),
        open_sprite: {...DEFAULT_DRAWABLE_IMG},
        header: {...DEFAULT_DRAWABLE_TEXT, text: "Menu", color: "#220000", font: "30px times"},
        container_sprite: {...DEFAULT_DRAWABLE_IMG},
        x_sprite: {...DEFAULT_DRAWABLE_IMG},
        x_button: new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined),
        end_game_sprite: {...DEFAULT_DRAWABLE_IMG, },
        end_game_button: new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined),
        toggle_walkthrough_sprite: {...DEFAULT_DRAWABLE_IMG, },
        toggle_walkthrough_button: new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined),
        tut_enabled_sprite: {...DEFAULT_DRAWABLE_IMG, },
        tut_disabled_sprite: {...DEFAULT_DRAWABLE_IMG, },
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
    //
    menu.end_game_sprite.image = get_asset('buttons');
    menu.end_game_sprite.src = {x: 64*5, y: 0, w: 64, h: 32};
    menu.end_game_button._touchEndCallback = end_game_clicked;
    //
    menu.toggle_walkthrough_sprite.image = get_asset('tut_enable');
    menu.toggle_walkthrough_sprite.src = {x: 160*0, y: 0, w: 160, h: 32};
    menu.toggle_walkthrough_button._touchEndCallback = toggle_walkthrough_clicked;
    menu.tut_enabled_sprite.image = get_asset('tut_enable');
    menu.tut_enabled_sprite.src = {x: 160*2, y: 0, w: 160, h: 32};
    menu.tut_disabled_sprite.image = get_asset('tut_enable');
    menu.tut_disabled_sprite.src = {x: 160*1, y: 0, w: 160, h: 32};
    //
    resize_menu();
}

export function resize_menu() {
    // graphics destination //
    const ctx = get_context();
    const ctxw = ctx.dimensions.x;
    const ctxh = ctx.dimensions.y;;
    const open_box: Rectangle = {
        x: ctxw * 0.008,  y: ctxh * 0.015,
        w: ctxw * 0.112,   h: ctxw * 0.05
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
    const end_game_box: Rectangle = { // 64x32
        x: container_box.x + container_box.w * ((100 - 16) / 200),
        y: container_box.y + container_box.h * (80 / 100),
        w: container_box.w * (32 / 200),  h: container_box.h * (16 / 100)
    };
    const tts = .7;
    const tw_box: Rectangle = { // 160x32
        x: container_box.x + container_box.w * ((100 - (80*tts)) / 200),
        y: container_box.y + container_box.h * (25 / 100),
        w: container_box.w * ((160*tts) / 200),  h: container_box.h * ((32*tts) / 100)
    };
    const enabled_box: Rectangle = { // +102x4
        x: tw_box.x,  y: tw_box.y,
        w: tw_box.w,  h: tw_box.h,
    };
    menu.open_sprite.dst          = open_box;
    menu.open_button._boundingBox = open_box;
    menu.container_sprite.dst = container_box;
    menu.x_sprite.dst          = x_box;
    menu.x_button._boundingBox = x_box;
    menu.header.boundingBox = header_box;
    menu.end_game_sprite.dst          = end_game_box;
    menu.end_game_button._boundingBox = end_game_box;
    menu.toggle_walkthrough_sprite.dst          = tw_box;
    menu.toggle_walkthrough_button._boundingBox = tw_box;
    menu.tut_enabled_sprite.dst  = enabled_box;
    menu.tut_disabled_sprite.dst = enabled_box;
}


// callbacks //

export const post_menu = (_self: Button) => {
    console.log("--- menu post");
    menu.is_showing = true;
}

export const exit_menu_clicked = (_self: Button) => {
    menu.is_showing = false;
}

export const end_game_clicked = (_self: Button) => {
    get_context().ws.send('kill');
}

export const toggle_walkthrough_clicked = (_self: Button) => {
    menu.is_tut_enabled = !menu.is_tut_enabled
}
