import { buttons_add, buttons_flush } from "./controller_lib/button.js";
import { drawablesAdd } from "./controller_lib/draw.js";
import { get_context } from "./controller_lib/init.js";
import { Context } from "./controller_lib/types/context.js";
import { DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT, DrawableRect, DrawableText } from "./controller_lib/types/drawables.js";
import { Rectangle } from "./controller_lib/types/shapes.js";
import { Button } from "./controller_lib/types/triggerable.js";
import { scale_and_center } from "./controller_lib/utils.js";
import { switch_to_game } from "./main.js";

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
    redTeam: Team,
}

let menu:Menu;

const BLUE_TEAM = 1;
const RED_TEAM = 2;
const GUESS = 0;
const CLUE = 1;

export const init_menu = () => {
    menu = {
        team: 0,
        role :0,
        container: {...DEFAULT_DRAWABLE_RECT, color:"#8F8F8F"},
        blueTeam: {
            name: {...DEFAULT_DRAWABLE_TEXT, text: "Blue team", color: "#163EE9"},
            guesserBtn: new Button(<Rectangle> {x:0,y:0,h:0,w:0}, undefined, undefined, (self:Button) => {menu.team = BLUE_TEAM; menu.role = GUESS; set_chosen_text(); self._active = false}),
            giverBtn: new Button(<Rectangle> {x:0,y:0,h:0,w:0}, undefined, undefined, (self:Button) => {menu.team = BLUE_TEAM; menu.role = CLUE; set_chosen_text(); self._active = false}),
            giverRect: DEFAULT_DRAWABLE_RECT,
            guesserSprite: {...DEFAULT_DRAWABLE_TEXT, text:"Guesser"},
            giverSprite: {...DEFAULT_DRAWABLE_TEXT, text:"Clue giver"}
        },
        redTeam: {
            name: {...DEFAULT_DRAWABLE_TEXT, text: "Red team", color: "#C81718"},
            guesserBtn: new Button(<Rectangle> {x:0,y:0,h:0,w:0}, undefined, undefined, (self:Button) => {menu.team = RED_TEAM; menu.role = GUESS; set_chosen_text(); self._active = false}),
            giverBtn: new Button(<Rectangle> {x:0,y:0,h:0,w:0}, undefined, undefined, (self:Button) => {menu.team = RED_TEAM; menu.role = CLUE; set_chosen_text(); self._active = false}),
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

// TODO set button bounding box to be a bit bigge than text
const set_wait_text = (ctx:Context) => {
    menu.text.text = "Waiting for game to start...";
    buttons_flush();
    switch_to_game(menu.role);
}

const set_chosen_text = () => {
    let ctx:Context = get_context();

    menu.blueTeam.name.font = '50px serif';
    menu.redTeam.name.font = '50px serif';

    menu.blueTeam.name.boundingBox = menu.container.boundingBox;
    menu.redTeam.name.boundingBox = menu.container.boundingBox;

    ctx.ctx.font = menu.blueTeam.name.text = "Blue team " + (menu.role == GUESS ? "guesser" : "clue giver");
    ctx.ctx.font = menu.redTeam.name.text = "Red team " + (menu.role == GUESS ? "guesser" : "clue giver");
    set_wait_text(ctx);
}

export const menu_loop = () => {
    drawablesAdd(menu.container);
    drawablesAdd(menu.text);
    if (menu.team != RED_TEAM)
        drawablesAdd(menu.blueTeam.name);
    if (menu.team != BLUE_TEAM)
        drawablesAdd(menu.redTeam.name);
    if (!menu.team)
    {
        drawablesAdd(menu.blueTeam.giverSprite);
        drawablesAdd(menu.blueTeam.guesserSprite);
        drawablesAdd(menu.redTeam.giverSprite);
        drawablesAdd(menu.redTeam.guesserSprite);
    }
}

const init_team = (box:Rectangle, team:Team, ctx:Context) => {

    team.name.boundingBox = {...box, h: box.h *0.2};

    box.y += box.h * 0.2;
    team.giverSprite.boundingBox = {...box, x: box.x + box.w * 0.25, w: box.w * 0.5, h:  box.h * 0.3}
    team.giverBtn._boundingBox =  team.giverSprite.boundingBox;

    box.y += box.h * 0.35;

    team.guesserSprite.boundingBox = {...box,x: box.x + box.w * 0.25, w: box.w * 0.5, h:  box.h * 0.3}
    team.guesserBtn._boundingBox =  team.guesserSprite.boundingBox;
}

const resize_assets = () => {

    const ctx = get_context();

    ctx.ctx.font = menu.text.font;

    menu.container.boundingBox.w = ctx.dimensions.x * 0.8;
    menu.container.boundingBox.h = ctx.dimensions.y * 0.8;
    menu.container.boundingBox.x = ctx.dimensions.x * 0.1;
    menu.container.boundingBox.y = ctx.dimensions.y * 0.1;

    menu.text.boundingBox = {...menu.container.boundingBox, h: menu.container.boundingBox.h * 0.2}
    let box: Rectangle = {
        x: menu.container.boundingBox.x,
        y: menu.container.boundingBox.y + menu.container.boundingBox.h * 0.2,
        w: menu.container.boundingBox.w * 0.45,
        h: menu.container.boundingBox.h * 0.7,
        }
    init_team({...box}, menu.blueTeam, ctx)
    box.x +=  menu.container.boundingBox.w * 0.55;
    init_team({...box}, menu.redTeam, ctx);
}
