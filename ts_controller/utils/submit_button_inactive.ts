import { get_context } from "../controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG, DrawableImage} from "../controller_lib/types/drawables.js";
import { Rectangle } from "../controller_lib/types/shapes.js";
import { Button } from "../controller_lib/types/triggerable.js";
import { get_board } from "../game/main/init.js";
import { get_asset } from "./assets.js";
import { confirm_clue, get_input } from "./input.js";

let submit_button : SubmiButton;

export const get_submit_button = () => { return submit_button };

export function show_submit_button(){
    submit_button.is_showing = true;
}

export function hide_submit_button() {
    submit_button.is_showing = false;
}

export interface SubmiButton {
    is_showing: boolean;
    is_active: boolean;
    sprite: DrawableImage,
    button: Button
}

export function init_submit_button() {
    var button = new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined);
    submit_button =  {
        is_showing : false,
        sprite: {...DEFAULT_DRAWABLE_IMG},
        button: button,
        is_active: false
    }
}

export function define_submit_button_properties() {    
    submit_button.sprite.image = get_asset("buttons");
    submit_button.sprite.src = {x: 64*4, y: 0, w: 64, h: 32};
    const ctx = get_context();
    console.log("context dimensions x: " + ctx.dimensions.x);

    const base_box: Rectangle = {
        x: ctx.dimensions.x * 0.008,
        y: ctx.dimensions.y * 0.88,
        w: ctx.dimensions.x * 0.112,
        h: ctx.dimensions.y * 0.1,
    };    
    submit_button.sprite.dst = base_box;
    submit_button.button._boundingBox = base_box;
    submit_button.button._touchEndCallback = try_submit;
} 

export function try_submit() {
    if(get_input().clue.trim() != "")
        confirm_clue(get_board().topbar.selectedKey + 1);
}

export function activate_button() {
    submit_button.is_active = true;
    submit_button.sprite.src = {x: 64*2, y: 0, w: 64, h: 32};    
}







