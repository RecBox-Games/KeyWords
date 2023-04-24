import { DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT } from "../../controller_lib/types/drawables.js";
// data :
// {[..., {state, contentId, asset}, ...]
export const construct_chest = (id, box, data) => {
    //fetch content from assets.ts
    const newChest = {
        open: false,
        id: id,
        contents: 1,
        text: { ...DEFAULT_DRAWABLE_TEXT, color: "#FFFFFF", boundingBox: { ...box } },
        sprite: { ...DEFAULT_DRAWABLE_RECT, boundingBox: { ...box } } // {..box} or else it will assign as reference
    };
    return newChest;
};
