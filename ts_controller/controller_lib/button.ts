import { Point } from "./types/shapes.js";
import { Button } from "./types/triggerable.js";

const _buttons:Button[] = [];

// export const DEFAULTT_BUTTON_RECT:Button = new Button(<Rectangle>{x: 0, y:0, w:10, h:10,}, undefined, undefined, undefined)
export const buttons_len = () => _buttons.length;

export const buttons_log = () => console.log('log buttons', _buttons)

export const buttons_flush = () => {
	_buttons.length = 0;
}
export const buttons_add = (button:Button) => {
	_buttons.push(button);
}

export const buttons_update = (touch:Point, touchType:number) =>{
	for (let button of _buttons){
        if (button._active) {
            if (button.tryTrigger(touch, touchType)) {
                return ;
            }
        }
	}
}

