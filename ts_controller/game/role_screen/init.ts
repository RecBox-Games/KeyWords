import { get_context } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_TEXT, DrawableImage, DrawableText } from "../../controller_lib/types/drawables.js";
import { Rectangle } from "../../controller_lib/types/shapes.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { get_asset } from "../../utils/assets.js";
import { TurnRole } from "../../utils/state_handler.js";

export interface Team {
    cluegiver: boolean,
    name: DrawableImage,
    guesserBtn: Button,
    giverBtn: Button,
    guesserSprite: DrawableImage,
    giverSprite: DrawableImage,
}

export interface RoleScreen {
    bg?: DrawableImage,
    role: TurnRole,
    text: DrawableText,
    blueTeam: Team,
    redTeam: Team,
}

let role_screen:RoleScreen;

export const get_role_screen = () => role_screen;


const size_team = (team: Team , box:Rectangle) => {
    const ctx = get_context();

   team.name.dst = {...box}
   team.name.image = get_asset('banner');

   team.guesserSprite.image = get_asset('roles')
   team.giverSprite.image = get_asset('roles')
   team.guesserSprite.dst = {
        x: box.x + box.w * 0.1,
        y: box.y ,
        w: box.h * 0.45,
        h: box.h * 0.45,
    }
   team.giverSprite.dst = {
        x: box.x + box.w * 0.1,
        y: box.y + box.h * 0.5,
        w: box.h * 0.45,
        h: box.h * 0.45,
    }

    team.guesserBtn._boundingBox = team.guesserSprite.dst;
    team.giverBtn._boundingBox = team.giverSprite.dst;
}

export const size_role_screen = () => {

    const ctx = get_context();

    ctx.ctx.font = role_screen.text.font;
    role_screen.text.boundingBox.h =  ctx.dimensions.y * 0.2;
    role_screen.text.boundingBox.w =  ctx.dimensions.x;

    let box: Rectangle = {
        x: ctx.dimensions.x * 0.05,
        y: ctx.dimensions.y * 0.15,
        w: ctx.dimensions.x * 0.30,
        h: ctx.dimensions.y * 0.8,
        }

    size_team(role_screen.redTeam, box)
    box.x += box.w + ctx.dimensions.x * 0.33
    size_team(role_screen.blueTeam, box)

}


export const init_role_screen = () => {
    role_screen = {
        role :0,
        blueTeam: {
            cluegiver:false,
            name: {...DEFAULT_DRAWABLE_IMG, src: {x:100, y:0, h:154, w:92}},
            guesserBtn: new Button(<Rectangle>   {x:0,   y:0, h:0,   w:0},  undefined,  undefined,  (self:Button) => {get_context().ws.send('input:role,blueguesser')}),
            giverBtn: new Button(<Rectangle>     {x:0,   y:0, h:0,   w:0},  undefined, undefined, (self:Button) => {get_context().ws.send('input:role,bluecluer')}),
            guesserSprite: {...DEFAULT_DRAWABLE_IMG, src: {x:0, y:0, h:49, w:54}},
            giverSprite: {...DEFAULT_DRAWABLE_IMG, src:   {x:54 * 2 + 0.5,y:0,h:49,w:54}}
        },
        redTeam: {
            cluegiver: false,
            name: {...DEFAULT_DRAWABLE_IMG, src: {x:0,y:0,h:154,w:92}},
            guesserBtn: new Button(<Rectangle> {x:0,y:0,h:0,w:0}, undefined, undefined, (self:Button) => {get_context().ws.send('input:role,redguesser')}),
            giverBtn: new Button(<Rectangle> {x:0,y:0,h:0,w:0}, undefined, undefined, (self:Button) => {get_context().ws.send('input:role,redcluer')}),
            guesserSprite: {...DEFAULT_DRAWABLE_IMG, src: {x:54 + 0.5,  y:0, h:49, w:54}},
            giverSprite: {...DEFAULT_DRAWABLE_IMG, src: {x:54 * 3 + 0.5,y:0, h:49, w:54}}
        },
        text: {...DEFAULT_DRAWABLE_TEXT, text:"Choose your team !", font: '40px arial'},
    }

    size_role_screen();
}
