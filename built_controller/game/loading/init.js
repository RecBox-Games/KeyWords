import { get_context } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG } from "../../controller_lib/types/drawables.js";
import { assetCount, load_assets } from "../../utils/assets.js";
import { prepare_grass } from "../../utils/render_utils.js";
const SRC_W = 80;
const loading = {
    barBG: { ...DEFAULT_DRAWABLE_IMG, src: { x: 0, y: 0, w: 80, h: 9 } },
    bar: { ...DEFAULT_DRAWABLE_IMG, src: { x: 0, y: 9, w: 0, h: 9 } },
    sent: false,
    title: { ...DEFAULT_DRAWABLE_IMG },
    progress: 0.0,
    barProgress: 0.0,
    done: false
};
export const get_loading = () => loading;
export const size_loading = () => {
    const ctx = get_context();
    const box = {
        x: ctx.dimensions.x * 0.15,
        y: ctx.dimensions.y * 0.65,
        w: ctx.dimensions.x * 0.70,
        h: ctx.dimensions.y * 0.1
    };
    loading.title.dst = {
        x: ctx.dimensions.x * 0.25,
        y: ctx.dimensions.y * 0.25,
        w: ctx.dimensions.x * 0.5,
        h: ctx.dimensions.y * 0.3
    };
    loading.barBG.dst = { ...box };
    loading.bar.dst = { ...box };
};
export const init_loading = async () => {
    size_loading();
    const barImg = new Image();
    const title = new Image();
    barImg.addEventListener('load', () => {
        loading.bar.image = barImg;
        loading.barBG.image = barImg;
    });
    title.addEventListener('load', () => {
        loading.title.image = title;
    });
    barImg.src = `resources/loading.png`;
    title.src = `resources/title.png`;
    Promise.allSettled(load_assets(loading, () => { loading.progress += (1 / assetCount()); console.log("progress", loading.progress); }, (err) => console.log("Error", err)))
        .then(() => {
        console.log("loaded");
        prepare_grass();
        loading.done = true;
    });
    // console.log("socket", ctx.ws, ctx.wsState)
};
