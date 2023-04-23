import { isCircle, isRect, PointInCircle, PointInRect } from "./shapes.js";
import { NONE, TRIGGER_END, TRIGGER_HELD, TRIGGER_START } from "../macros.js";
import { TOUCH_END } from "../utils.js";
class Triggerable {
    _active = true;
    _state = NONE;
    _isTriggered;
    _handleTrigger;
    constructor(isTriggered, handleTrigger) {
        this._isTriggered = isTriggered;
        this._handleTrigger = handleTrigger;
        this._state = NONE;
    }
    get state() { return this._state; }
    ;
    get active() { return this._active; }
    ;
    set active(val) { this._active = val; }
    ;
    tryTrigger = (...args) => {
        const current = this._isTriggered(this, args);
        //TODO Can do this with bit manipulation but idk how that goes in TS
        // and anyways this may be more readable ?
        if (this._state == NONE && current == true)
            this._state = TRIGGER_START;
        else if (this._state == TRIGGER_START && current == false)
            this._state = TRIGGER_END;
        else if (this._state == TRIGGER_START && current == true)
            this._state = TRIGGER_HELD;
        else if (this._state == TRIGGER_END && current == false)
            this._state = NONE;
        else if (this._state == TRIGGER_END && current == true)
            this._state = TRIGGER_START;
        else if (this._state == TRIGGER_HELD && current == true)
            this._state = TRIGGER_HELD;
        else if (this._state == TRIGGER_HELD && current == false)
            this._state = TRIGGER_END;
        else
            this._state = NONE;
        if (this._state != NONE)
            this._handleTrigger(this, args);
    };
}
class Button extends Triggerable {
    _boundingBox;
    _hoverCallback;
    _touchStartCallback;
    _touchEndCallback;
    constructor(boundingBox, hoverCallback, touchStartCallback, touchEndCallback) {
        if (isRect(boundingBox))
            super(checkRectTriggered, handleButtonTriggered);
        else if (isCircle(boundingBox))
            super(checkCircleTriggered, handleButtonTriggered);
        else
            throw "Making a button from unknown type (not rectangle or Circle)";
        this._boundingBox = boundingBox;
        this._hoverCallback = hoverCallback;
        this._touchStartCallback = touchStartCallback;
        this._touchEndCallback = touchEndCallback;
    }
    tryTrigger = (touch, touchType) => {
        const current = this._isTriggered(this, touch);
        //TODO Can do this with bit manipulation but idk how that goes in TS
        // and anyways this may be more readable ?
        if (current)
            this._state = touchType;
        if (this._state != NONE)
            this._handleTrigger(this);
        // console.log("troggered", current, "event", touchType);
        if (touchType == TOUCH_END)
            this._state = NONE;
    };
}
export const handleButtonTriggered = (self) => {
    if (self.state == TRIGGER_HELD && self._hoverCallback)
        self._hoverCallback(self);
    else if (self.state == TRIGGER_END && self._touchEndCallback)
        self._touchEndCallback(self);
    else if (self.state == TRIGGER_START && self._touchStartCallback)
        self._touchStartCallback(self);
};
export const checkCircleTriggered = (button, mouse) => {
    return PointInCircle(mouse, button._boundingBox);
};
export const checkRectTriggered = (button, mouse) => {
    return PointInRect(mouse, button._boundingBox);
};
export { Triggerable, Button };
