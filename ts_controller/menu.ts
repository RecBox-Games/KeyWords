import { buttons_add } from "./controller_lib/button.js";
import { drawablesAdd } from "./controller_lib/draw.js";
import { get_context } from "./controller_lib/init.js";
import { Context } from "./controller_lib/types/context.js";
import { DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT, DrawableRect, DrawableText } from "./controller_lib/types/drawables.js";
import { Rectangle } from "./controller_lib/types/shapes.js";
import { Button } from "./controller_lib/types/triggerable.js";
import { scale_and_center } from "./controller_lib/utils.js";

interface Team {
    name:DrawableText,
    guesserBtn: Button,
    giverBtn:Button,
    guesserSprite: DrawableText,
    giverSprite: DrawableText,
    giverRect:DrawableRect
}

interface Menu {
    team:number,
    role:number,
    container:DrawableRect,
    text:DrawableText,
    blueTeam: Team,
    redTeam: Team
}

let menu:Menu;

const BLUE_TEAM = 1;
const RED_TEAM = 2;
const GUESS = 1;
const CLUE = 2;

export const init_menu = () => {
    menu = {
        team: 0,
        role :0,
        container: {...DEFAULT_DRAWABLE_RECT, color:"#8F8F8F"},
        blueTeam: {
            name: {...DEFAULT_DRAWABLE_TEXT, text: "Blue team", color: "#163EE9"},
            guesserBtn: new Button(<Rectangle> {x:0,y:0,h:0,w:0}, undefined, undefined, () => {menu.team = BLUE_TEAM; menu.role = GUESS;  console.log("blue guess")}),
            giverBtn: new Button(<Rectangle> {x:0,y:0,h:0,w:0}, undefined, undefined, () => {menu.team = BLUE_TEAM; menu.role = CLUE;  console.log("blue clue")}),
            giverRect: DEFAULT_DRAWABLE_RECT,
            guesserSprite: {...DEFAULT_DRAWABLE_TEXT, text:"Guesser"},
            giverSprite: {...DEFAULT_DRAWABLE_TEXT, text:"Clue giver"}
        },
        redTeam: {
            name: {...DEFAULT_DRAWABLE_TEXT, text: "Red team", color: "#C81718"},
            guesserBtn: new Button(<Rectangle> {x:0,y:0,h:0,w:0}, undefined, undefined, () => {menu.team = RED_TEAM; menu.role = GUESS; console.log("red guess")}),
            giverBtn: new Button(<Rectangle> {x:0,y:0,h:0,w:0}, undefined, undefined, () => {menu.team = RED_TEAM; menu.role = CLUE;  console.log("red clues")}),
            guesserSprite: {...DEFAULT_DRAWABLE_TEXT, text:"Guesser"},
            giverSprite: {...DEFAULT_DRAWABLE_TEXT, text:"Clue giver"},
             giverRect: DEFAULT_DRAWABLE_RECT,
        },
        text: {...DEFAULT_DRAWABLE_TEXT, text:"Choose your team !", font: '40px serif'}
    }
    resize_assets();
    buttons_add(menu.blueTeam.giverBtn);
    buttons_add(menu.blueTeam.guesserBtn);
    buttons_add(menu.redTeam.giverBtn);
    buttons_add(menu.redTeam.guesserBtn);
    window.onresize = resize_assets;
    window.onorientationchange = resize_assets;
}



export const menu_loop = () => {
    drawablesAdd(menu.container);
    drawablesAdd(menu.text);
    drawablesAdd(menu.blueTeam.name);
    drawablesAdd(menu.blueTeam.giverSprite);
    drawablesAdd(menu.blueTeam.guesserSprite);
    drawablesAdd(menu.redTeam.name);
    drawablesAdd(menu.redTeam.giverSprite);
    drawablesAdd(menu.redTeam.guesserSprite);
}

const resize_team = (box:Rectangle, team:Team, ctx:Context) => {
    ctx.ctx.font = team.name.font;
    let textDim = ctx.ctx.measureText(team.name.text);
    let newTextBox = scale_and_center(
        <Rectangle>{x:0, y:0, w:textDim.width, h: textDim.actualBoundingBoxAscent + textDim.actualBoundingBoxDescent},
        box, 1);
    team.name.x = newTextBox.x;
    team.name.y = box.y + newTextBox.h * 2;

    box.y =  team.name.y + newTextBox.h * 2;
    box.h -= newTextBox.h;
    ctx.ctx.font = team.giverSprite.font;
    ctx.ctx.measureText(team.giverSprite.text);
    newTextBox = scale_and_center(
        <Rectangle>{x:0, y:0, w:textDim.width, h: textDim.actualBoundingBoxAscent + textDim.actualBoundingBoxDescent},
        box, 1);
    team.giverSprite.x = newTextBox.x;
    team.giverSprite.y = box.y + newTextBox.h * 2;
    team.giverBtn._boundingBox = {...newTextBox, y: team.giverSprite.y - newTextBox.h};
    team.giverRect.boundingBox = team.giverBtn._boundingBox;
    // console.log(newTextBox, team.giverSprite,team.giverBtn._boundingBox)

    box.y =  team.giverSprite.y + newTextBox.h * 2;
    box.h -= newTextBox.h;
     newTextBox = scale_and_center(
        <Rectangle>{x:0, y:0, w:textDim.width, h: textDim.actualBoundingBoxAscent + textDim.actualBoundingBoxDescent},
        box, 1);
    team.guesserSprite.x = newTextBox.x;
    team.guesserSprite.y = box.y + newTextBox.h * 2;
    team.guesserBtn._boundingBox = {...box, y:team.guesserSprite.y - newTextBox.h};
}

const resize_assets = () => {
    // console.log("ME");
    const ctx:Context = get_context();
     ctx.canvas.width = window.innerWidth-1;
    ctx.canvas.height = window.innerHeight-1;
    ctx.dimensions.x = window.innerWidth;
    ctx.dimensions.y = document.body.clientHeight;
    menu.container.boundingBox.h = window.innerHeight - 100;
    menu.container.boundingBox.w = window.innerWidth - 100;
    menu.container.boundingBox.x = 50;
    menu.container.boundingBox.y = 50;

    ctx.ctx.font = menu.text.font;
    let textDim = ctx.ctx.measureText(menu.text.text);
    let newTextBox = scale_and_center(
        <Rectangle>{x:0, y:0, w:textDim.width, h: textDim.actualBoundingBoxAscent + textDim.actualBoundingBoxDescent},
        menu.container.boundingBox, 1);
    menu.text.x = newTextBox.x;
    menu.text.y = menu.container.boundingBox.y + newTextBox.h * 2;

    let box: Rectangle = {
        x: menu.container.boundingBox.x,
        y: menu.text.y + (newTextBox.h * 2),
        w: menu.container.boundingBox.w * 0.45,
        h: menu.container.boundingBox.h - (newTextBox.h * 2),
        }
    resize_team(box, menu.blueTeam, ctx);
    box.y = menu.text.y + (newTextBox.h * 2);
    box.x = (menu.container.boundingBox.x + menu.container.boundingBox.w) - box.w;
    resize_team(box, menu.redTeam, ctx);
    console.log(menu.blueTeam.giverBtn);
}

const render_choice = () => {

}

const render_chosen = () => {

}
