import {  DrawableImage, DrawableRect, DrawableText } from "../controller_lib/types/drawables.js";
import { Button } from "../controller_lib/types/triggerable.js";

export const BOARD_W: number = 5;
export const BOARD_H: number = 5;

export interface ChestContents {
    sprite?: DrawableImage;
    name: string;
    effect:string;
}

export interface Chest {
    open:boolean;
    id: number;
    content: number;
    text:DrawableText;
    sprite:DrawableRect;
}

export interface Overlay {
    shadow?: DrawableRect;
    exit?: Button;
    exitSprite?: DrawableRect;
    box:DrawableRect;
    text:DrawableText;
    subtext:DrawableText;
    item:DrawableRect;
}

export interface TopBar {
    text: DrawableText;
    subText: DrawableText;
    accept:DrawableRect;
    deny:DrawableRect;
    acceptButton:Button;
    denyButton:Button;
}

export interface Board {
    chests:((Chest)[])[];
    topbar:TopBar;
    buttons:(Button[])[];
    guessedWord: string | undefined;
    totalGuesses: number;
    currentGuesses: number;
    overlay:Overlay;
    showOverlay:boolean;
    clue:string | undefined;
}

export const GUESSER:number = 0;
export const GIVER:number = 1;
