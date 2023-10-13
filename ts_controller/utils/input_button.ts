import { get_context } from "../controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_TEXT, DrawableImage,
         DrawableText } from "../controller_lib/types/drawables.js";
import { Rectangle } from "../controller_lib/types/shapes.js";
import { Button } from "../controller_lib/types/triggerable.js";
import { get_asset } from "./assets.js";

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
    input_button.sprite.src = {x: 64*4, y: 0, w: 64, h: 32};
    const ctx = get_context();
    console.log("context dimensions x: " + ctx.dimensions.x);

    const base_box: Rectangle = {
        x: 0,
        y: 0,
        w: ctx.dimensions.x,
        h: ctx.dimensions.y,
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







