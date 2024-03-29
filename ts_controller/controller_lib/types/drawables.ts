import { Rectangle, Point } from "./shapes.js";
//  text : x, y, font, text,, center, color
//  imag : x, y, img, scale, center, rotation
//  rect : x,y, w, h, color, outline

interface DrawableRect{
    boundingBox:Rectangle,
    color: string;
    stroke: number;
}

interface DrawableText {
    coords:Point;
    boundingBox:Rectangle;
    center:boolean;
    wrap:boolean;
    font: string;
    color: string;
    text:string;
}

interface DrawableImage {
    dst:Rectangle | null,
    src:Rectangle | null,
    image: HTMLImageElement | null;
    scale: number;
    rotation: number;
}

export const DEFAULT_DRAWABLE_RECT:DrawableRect = {boundingBox:{x: 0, y: 0, w : 0, h : 0}, color : '#000000', stroke : 0};
export const DEFAULT_DRAWABLE_TEXT:DrawableText = {coords:{x: 0, y: 0}, boundingBox:{x: 0, y: 0, w : 0, h : 0}, center:true, wrap: false, font: '28px arial', color : '#000000', text: "no_text"};
export const DEFAULT_DRAWABLE_IMG:DrawableImage = {src:null, dst:null, scale : 1, rotation: 0, image: null};

export { DrawableImage, DrawableRect, DrawableText}
