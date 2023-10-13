import { get_context } from "../controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_TEXT, DrawableImage,
         DrawableText } from "../controller_lib/types/drawables.js";
import { Rectangle } from "../controller_lib/types/shapes.js";
import { Button } from "../controller_lib/types/triggerable.js";
import { get_board } from "../game/main/init.js";
import { get_asset } from "./assets.js";
import { confirm_clue } from "./input.js";

let input_button : InputButton;

export const get_input_button = () => { return input_button };

export function show_input_button(){
    input_button.is_showing = true;
}

export function hide_input_button() {
    input_button.is_showing = false;
}

export interface InputButton {
    is_showing: boolean;
    sprite: DrawableImage,
    button: Button
}

export function init_input_button() {
    var button = new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined);
    input_button =  {
        is_showing : false,
        sprite: {...DEFAULT_DRAWABLE_IMG},
        button: button,
    }
}

export function define_input_button_properties() {
    input_button.sprite.image = get_asset("buttons");
    input_button.sprite.src = {x: 64*2, y: 0, w: 64, h: 32};
    const ctx = get_context();
    console.log("context dimensions x: " + ctx.dimensions.x);

    const base_box: Rectangle = {
        x: ctx.dimensions.x * 0.008,
        y: ctx.dimensions.y * 0.88,
        w: ctx.dimensions.x * 0.112,
        h: ctx.dimensions.y * 0.1,
    };
    
    const button_box: Rectangle = {
        x: base_box.x + base_box.w * (1/200),
        y: base_box.y + base_box.h * (1/100),
        w: base_box.w * (1/200),
        h: base_box.h * (1/100),
    }
    input_button.sprite.dst = base_box;
    input_button.button._boundingBox = base_box;
}

export function submit() {
    confirm_clue(get_board().topbar.selectedKey);
}







