import { get_context } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_TEXT } from "../../controller_lib/types/drawables.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { get_asset } from "../../utils/assets.js";
let role_screen;
export const get_role_screen = () => role_screen;
const size_team = (team, box) => {
    const ctx = get_context();
    team.name.dst = { ...box };
    team.name.image = get_asset('banner');
    team.guesserSprite.image = get_asset('roles');
    team.giverSprite.image = get_asset('roles');
    team.guesserSprite.dst = {
        x: box.x + box.w * 0.1,
        y: box.y,
        w: box.h * 0.45,
        h: box.h * 0.45,
    };
    team.giverSprite.dst = {
        x: box.x + box.w * 0.1,
        y: box.y + box.h * 0.5,
        w: box.h * 0.45,
        h: box.h * 0.45,
    };
    team.guesserBtn._boundingBox = team.guesserSprite.dst;
    team.giverBtn._boundingBox = team.giverSprite.dst;
    team.guesserBtn.active = false;
    team.giverBtn.active = false;
};
export const size_role_screen = () => {
    const ctx = get_context();
    ctx.ctx.font = role_screen.text.font;
    role_screen.text.boundingBox.h = ctx.dimensions.y * 0.2;
    role_screen.text.boundingBox.w = ctx.dimensions.x;
    let box = {
        x: ctx.dimensions.x * 0.05,
        y: ctx.dimensions.y * 0.15,
        w: ctx.dimensions.x * 0.30,
        h: ctx.dimensions.y * 0.8,
    };
    size_team(role_screen.redTeam, box);
    box.x += box.w + ctx.dimensions.x * 0.33;
    size_team(role_screen.blueTeam, box);
    role_screen.exit.image = get_asset(`buttons`);
    role_screen.exit.dst = {
        x: ctx.dimensions.x * 0.005,
        y: ctx.dimensions.y * 0.005,
        w: ctx.dimensions.y * 0.2,
        h: ctx.dimensions.y * 0.1,
    };
    role_screen.exitBtn._boundingBox = role_screen.exit.dst;
};
export const init_role_screen = () => {
    role_screen = {
        role: 0,
        blueTeam: {
            cluegiver: false,
            name: { ...DEFAULT_DRAWABLE_IMG, src: { x: 100, y: 0, h: 154, w: 92 } },
            guesserBtn: new Button({ x: 0, y: 0, h: 0, w: 0 }, undefined, undefined, (self) => { get_context().ws.send('input:role,blueguesser'); }),
            giverBtn: new Button({ x: 0, y: 0, h: 0, w: 0 }, undefined, undefined, (self) => { get_context().ws.send('input:role,bluecluer'); }),
            guesserSprite: { ...DEFAULT_DRAWABLE_IMG, src: { x: 0, y: 0, h: 49, w: 54 } },
            giverSprite: { ...DEFAULT_DRAWABLE_IMG, src: { x: 54 * 2 + 0.5, y: 0, h: 49, w: 54 } }
        },
        redTeam: {
            cluegiver: false,
            name: { ...DEFAULT_DRAWABLE_IMG, src: { x: 0, y: 0, h: 154, w: 92 } },
            guesserBtn: new Button({ x: 0, y: 0, h: 0, w: 0 }, undefined, undefined, (self) => { get_context().ws.send('input:role,redguesser'); }),
            giverBtn: new Button({ x: 0, y: 0, h: 0, w: 0 }, undefined, undefined, (self) => { get_context().ws.send('input:role,redcluer'); }),
            guesserSprite: { ...DEFAULT_DRAWABLE_IMG, src: { x: 54 + 0.5, y: 0, h: 49, w: 54 } },
            giverSprite: { ...DEFAULT_DRAWABLE_IMG, src: { x: 54 * 3 + 0.5, y: 0, h: 49, w: 54 } }
        },
        text: { ...DEFAULT_DRAWABLE_TEXT, text: "Choose your team !", font: '40px arial' },
        exitBtn: new Button({ x: 0, y: 0, h: 0, w: 0 }, undefined, undefined, (self) => {
            get_context().ws.send('kill');
        }),
        exit: { ...DEFAULT_DRAWABLE_IMG, dst: { x: 0, y: 0, h: 0, w: 0 }, src: { x: 0, y: 0, h: 32, w: 64 } },
    };
    size_role_screen();
};
