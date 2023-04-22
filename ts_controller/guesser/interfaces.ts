import {  DrawableImage, DrawableRect, DrawableText } from "../controller_lib/types/drawables.js";
import { Button } from "../controller_lib/types/triggerable.js";

export const BOARD_W: number = 5;
export const BOARD_H: number = 5;


export interface ChestGuesser {
    open:boolean;
    id: number;
    text:DrawableText;
    sprite:DrawableRect;
}

export interface ChestGiver {
    open:boolean;
    id: number;
    contentText: DrawableText;
    contentImage: DrawableRect;
    contentContainer: DrawableRect;
    text:DrawableText;
    sprite:DrawableRect;
}

export interface Overlay {
    shadow: DrawableRect;
    exit: Button;
    exitSprite: DrawableRect;
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
    background: DrawableImage;
    chests:((ChestGuesser | ChestGiver)[])[];
    topbar:TopBar;
    buttons:(Button[])[];
    guessedWord: string | undefined;
    totalGuesses: number;
    currentGuesses: number;
    overlay:Overlay;
    showOverlay:boolean;
}
