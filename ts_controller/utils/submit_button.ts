import { get_context } from "../controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG, DrawableImage} from "../controller_lib/types/drawables.js";
import { Rectangle } from "../controller_lib/types/shapes.js";
import { Button } from "../controller_lib/types/triggerable.js";
import { get_board } from "../game/main/init.js";
import { get_asset } from "./assets.js";
import { post_confirmation } from "./confirmation.js";
import { confirm_clue, get_input } from "./input.js";


let submit_button : SubmitButton;

export const get_submit_button = () => { return submit_button };

export interface SubmitButton {
    is_active: boolean;
    sprite: DrawableImage,
    button: Button
}

export function construct_submit() {
    var button = new Button( {x:0,y:0,w:0,h:0}, undefined, undefined, undefined);
    submit_button =  {
        sprite: {...DEFAULT_DRAWABLE_IMG},
        button: button,
        is_active: false
    }
}

export function initialize_submit() {    
    submit_button.sprite.image = get_asset("submit");
    submit_button.sprite.src = {x: 0, y: 0, w: 48, h: 32};
    resize_submit();
}

export function resize_submit() {
    const ctx = get_context();
    const base_box: Rectangle = {
        x: ctx.dimensions.x * 0.011,
        y: ctx.dimensions.y * 0.825,
        w: ctx.dimensions.x * 0.112,
        h: ctx.dimensions.y * 0.155,
    };    
    submit_button.sprite.dst = base_box;
    submit_button.button._boundingBox = base_box;
    submit_button.button._touchEndCallback = try_submit;
}

export function try_submit() {
    if(get_input().clue.trim() != "" && submit_button.is_active) {
        submit();
    }
    else {
        post_confirmation("Submit without clue?", submit);
    }
}

export function activate_button() {
    submit_button.is_active = true;
    submit_button.sprite.src = {x: 48, y: 0, w: 48, h: 32};
}

function submit() {
    confirm_clue(get_board().topbar.selectedKey + 1);    
    get_input().clue = "";
    get_board().topbar.isAKeySelected = false;
    submit_button.is_active = false;
}








