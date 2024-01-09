import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_TEXT, DrawableImage,
         DrawableText } from "../controller_lib/types/drawables.js";
import { get_context } from "../controller_lib/init.js";
import { Rectangle } from "../controller_lib/types/shapes.js";
import { Button } from "../controller_lib/types/triggerable.js";
import { get_asset } from "./assets.js";
import { get_menu } from "./menu.js";
import { BUTTON_LABELS } from "./popup_messages.js";
import {INSTRUCTIONS_STARTING} from "./popup_messages.js";

let popup:Popup;
export const get_popup = ():Popup => {return popup};

// Popup //
export interface Popup {
    is_showing: boolean,
    is_talking: boolean,
    header: DrawableText,
    message: DrawableText,
    base_sprite: DrawableImage,
    exit_button: Button,
    gotit_sprite: DrawableImage,
    gotit_button: Button,
    gotit_text: DrawableText,
    talk_index: number,
}

// opening and closing popup //
export function try_post_popup(header: string, message: string) {
    if (get_menu().is_tut_enabled) {
        post_popup(header, message);
    }
}

export function post_popup(header: string, message: string) {
    var scr_height = get_context().dimensions.y;
    fill_popup();
    size_popup();
    var text_size = Math.floor(12 + scr_height*0.04);
    popup.header.font = `${text_size}px times`;
    popup.header.text = header;
    text_size = Math.floor(5 + scr_height*0.03);
    popup.message.font = `${text_size}px times`;
    popup.message.text = message;
    text_size *= 1.3;
    popup.gotit_text.font = `${text_size}px times`;
    popup.gotit_text.text = BUTTON_LABELS[0];
    popup.is_showing = true;
}

export const exit_popup_clicked = (_self:Button) => {
    popup.is_showing = false;
    get_popup().is_talking = false;
}

export const read_ins_clicked = (self:Button) => {
    if (popup.message.text != INSTRUCTIONS_STARTING){
       get_popup().gotit_sprite.image = get_asset('read_ins2');
       get_popup().gotit_button._touchEndCallback = read_ins_clicked_2;
    }
}
export const read_ins_clicked_2 = (self:Button) => {
    get_popup().gotit_sprite.image = get_asset('read_ins3');
    get_popup().gotit_button._touchEndCallback = read_ins_clicked_3;
    get_popup().is_talking = true;
}
export const read_ins_clicked_3 = (self:Button) => {
    if (get_popup().talk_index < BUTTON_LABELS.length - 1) {
        get_popup().talk_index += 1;
    }
    get_popup().gotit_text.text = BUTTON_LABELS[get_popup().talk_index];
}

// setting data for popup //
export function init_popup() {
    var button1 = new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined);
    var button2 = new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined);
    popup =  {
        is_showing: false,
        is_talking: false,
        header: {...DEFAULT_DRAWABLE_TEXT, color: "#220000", font: "30px times"},
        message: {...DEFAULT_DRAWABLE_TEXT, color: "#220000", font: "24px times", center: false, wrap: true},
        base_sprite: {...DEFAULT_DRAWABLE_IMG},
        exit_button: button2,
        gotit_sprite: {...DEFAULT_DRAWABLE_IMG},
        gotit_button: button1,
        gotit_text: {...DEFAULT_DRAWABLE_TEXT, color: "#220000", font: "30px times"},
        talk_index: 0,
    }
}

export function size_popup() {
    const ctx = get_context();
    // base
    const base_box: Rectangle = {
        x: ctx.dimensions.x * 0.16,
        y: ctx.dimensions.y * 0.16,
        w: ctx.dimensions.x * 0.68,
        h: ctx.dimensions.y * 0.80,
    };
    popup.base_sprite.dst = base_box;
    // gotit
    const gotit_box: Rectangle = {
        x: base_box.x + base_box.w * (50/200),
        y: base_box.y + base_box.h * (85/100),
        w: base_box.w * (100/200),
        h: base_box.h * (14/100),
    }
    popup.gotit_sprite.dst = gotit_box;
    popup.gotit_button._boundingBox = gotit_box;
    var talk_box = {...gotit_box};
    talk_box.h *= .75;
    popup.gotit_text.boundingBox = talk_box;
    // text
    const header_box: Rectangle = {
        x: base_box.x,
        y: base_box.y,
        w: base_box.w,
        h: base_box.h * (12/100),
    }
    const message_box: Rectangle = {
        x: base_box.x + base_box.w * (10/200),
        y: base_box.y + base_box.h * (23/100),
        w: base_box.w * (185/200),
        h: base_box.h * (70/100),
    }
    popup.header.boundingBox = header_box;
    popup.message.boundingBox = message_box;
    // exit (invisible)
    const exit_box: Rectangle = {
        x: base_box.x + base_box.w * (0/200),
        y: base_box.y + base_box.h * (80/100),
        w: base_box.w * (13/200),
        h: base_box.h * (13/100),
    }
    popup.exit_button._boundingBox = exit_box;
}

export function fill_popup() {
    popup.base_sprite.image = get_asset('popup');
    popup.base_sprite.src = {x:0, y:0, w:200, h:100};
    popup.gotit_sprite.image = get_asset('read_ins');
    popup.gotit_sprite.src = {x:0, y:0, w:100, h:16};
    popup.gotit_button._touchEndCallback = read_ins_clicked;
    popup.exit_button._touchEndCallback = exit_popup_clicked;
}
