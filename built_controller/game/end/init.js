import { get_context } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG } from "../../controller_lib/types/drawables.js";
import { Button } from "../../controller_lib/types/triggerable.js";
import { get_asset } from "../../utils/assets.js";
const end = {
    restartSprite: { ...DEFAULT_DRAWABLE_IMG, src: { x: 64 * 3, y: 0, w: 64, h: 32 } },
    endSprite: { ...DEFAULT_DRAWABLE_IMG, src: { x: 0, y: 0, w: 64, h: 32 } },
    bg: { ...DEFAULT_DRAWABLE_IMG },
    endButton: new Button({ x: 0, y: 0, w: 0, h: 0 }, undefined, undefined, () => get_context().ws.send('kill')),
    restartButton: new Button({ x: 0, y: 0, w: 0, h: 0 }, undefined, undefined, () => get_context().ws.send('input:restart')),
};
export const get_end = () => end;
export const fill_end = () => {
    end.endSprite.image = get_asset('buttons');
    end.restartSprite.image = get_asset('buttons');
    end.bg.image = get_asset('keywords_background');
    size_end();
};
export const size_end = () => {
    const ctx = get_context();
    const box = { x: ctx.dimensions.x * 0.5 - (ctx.dimensions.x * 0.15), y: ctx.dimensions.y * 0.45, w: ctx.dimensions.x * 0.3, h: ctx.dimensions.y * 0.2 };
    end.endSprite.dst = { ...box, y: box.y - (box.h) };
    end.restartSprite.dst = { ...box, y: box.y + box.h };
    end.restartButton._boundingBox = end.restartSprite.dst;
    end.endButton._boundingBox = end.endSprite.dst;
};
export const init_end = () => {
    size_end();
    return end;
};
