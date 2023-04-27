import { get_context } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT } from "../../controller_lib/types/drawables.js";
import { Button } from "../../controller_lib/types/triggerable.js";
let menu;
export const get_menu = () => menu;
const init_team = (box, team, ctx) => {
    team.name.boundingBox = { ...box, h: box.h * 0.2 };
    box.y += box.h * 0.2;
    team.giverSprite.boundingBox = { ...box, x: box.x + box.w * 0.25, w: box.w * 0.5, h: box.h * 0.3 };
    team.giverBtn._boundingBox = team.giverSprite.boundingBox;
    box.y += box.h * 0.35;
    team.guesserSprite.boundingBox = { ...box, x: box.x + box.w * 0.25, w: box.w * 0.5, h: box.h * 0.3 };
    team.guesserBtn._boundingBox = team.guesserSprite.boundingBox;
};
export const size_menu = () => {
    const ctx = get_context();
    ctx.ctx.font = menu.text.font;
    menu.container.boundingBox.w = ctx.dimensions.x * 0.8;
    menu.container.boundingBox.h = ctx.dimensions.y * 0.8;
    menu.container.boundingBox.x = ctx.dimensions.x * 0.1;
    menu.container.boundingBox.y = ctx.dimensions.y * 0.1;
    menu.text.boundingBox = { ...menu.container.boundingBox, h: menu.container.boundingBox.h * 0.2 };
    let box = {
        x: menu.container.boundingBox.x,
        y: menu.container.boundingBox.y + menu.container.boundingBox.h * 0.2,
        w: menu.container.boundingBox.w * 0.45,
        h: menu.container.boundingBox.h * 0.7,
    };
    init_team({ ...box }, menu.blueTeam, ctx);
    box.x += menu.container.boundingBox.w * 0.55;
    init_team({ ...box }, menu.redTeam, ctx);
};
export const init_menu = () => {
    menu = {
        team: 0,
        role: 0,
        container: { ...DEFAULT_DRAWABLE_RECT, color: "#8F8F8F" },
        blueTeam: {
            name: { ...DEFAULT_DRAWABLE_TEXT, text: "Blue team", color: "#163EE9" },
            guesserBtn: new Button({ x: 0, y: 0, h: 0, w: 0 }, undefined, undefined, (self) => { get_context().ws.send('input:role,blueguesser'); }),
            giverBtn: new Button({ x: 0, y: 0, h: 0, w: 0 }, undefined, undefined, (self) => { get_context().ws.send('input:role,bluecluer'); }),
            giverRect: DEFAULT_DRAWABLE_RECT,
            // guesserSprite: {...DEFAULT_DRAWABLE_RECT, color:'#0000FF'},
            // giverSprite: {...DEFAULT_DRAWABLE_RECT, color:'#0000FF'}
            guesserSprite: { ...DEFAULT_DRAWABLE_TEXT, text: "Guesser" },
            giverSprite: { ...DEFAULT_DRAWABLE_TEXT, text: "Clue giver" }
        },
        redTeam: {
            name: { ...DEFAULT_DRAWABLE_TEXT, text: "Red team", color: "#C81718" },
            guesserBtn: new Button({ x: 0, y: 0, h: 0, w: 0 }, undefined, undefined, (self) => { get_context().ws.send('input:role,redguesser'); }),
            giverBtn: new Button({ x: 0, y: 0, h: 0, w: 0 }, undefined, undefined, (self) => { get_context().ws.send('input:role,redcluer'); }),
            guesserSprite: { ...DEFAULT_DRAWABLE_TEXT, text: "Guesser" },
            giverSprite: { ...DEFAULT_DRAWABLE_TEXT, text: "Clue giver" },
            // guesserSprite: {...DEFAULT_DRAWABLE_RECT, color:'#FF00FF'},
            // giverSprite: {...DEFAULT_DRAWABLE_RECT, color:'#FF00FF'},
            giverRect: DEFAULT_DRAWABLE_RECT,
        },
        text: { ...DEFAULT_DRAWABLE_TEXT, text: "Choose your team !", font: '40px serif' }
    };
    size_menu();
};
