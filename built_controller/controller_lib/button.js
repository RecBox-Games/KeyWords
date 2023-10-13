let _buttons = [];
// export const DEFAULTT_BUTTON_RECT:Button = new Button(<Rectangle>{x: 0, y:0, w:10, h:10,}, undefined, undefined, undefined)
export const buttons_len = () => _buttons.length;
export const buttons_log = () => console.log('log buttons', _buttons);
export const buttons_flush = () => {
    _buttons = [];
};
export const buttons_add = (button) => {
    _buttons.push(button);
};
export const buttons_try_trigger = (touch, touchType) => {
    for (let button of _buttons) {
        if (button._active) {
            if (button.tryTrigger(touch, touchType)) {
                return;
            }
        }
    }
};
