import { get_context } from "../../controller_lib/init.js";
import { DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT, DrawableRect, DrawableText } from "../../controller_lib/types/drawables.js";
import { assetCount, load_assets } from "../../utils/assets.js";

export interface Loading {
    bar:DrawableRect;
    barBG:DrawableRect;
    text:DrawableText;
    sent:boolean;
    BG:DrawableRect;
    progress:number;
    barProgress:number;
    done:boolean;
}

const loading:Loading = {
    text:{...DEFAULT_DRAWABLE_TEXT},
    barBG:{...DEFAULT_DRAWABLE_RECT},
    bar:{...DEFAULT_DRAWABLE_RECT},
    sent:false,
    BG: {...DEFAULT_DRAWABLE_RECT},
    progress: 0.0,
    barProgress: 0.0,
    done: false
}

export const get_loading = () => loading;

export const size_loading = () => {
    const ctx = get_context();

    const box = {
        x: ctx.dimensions.x * 0.15,
        y: ctx.dimensions.y * 0.65,
        w: ctx.dimensions.x * 0.70,
        h: ctx.dimensions.y * 0.1
    }
    loading.BG.boundingBox.w = ctx.dimensions.x;
    loading.BG.boundingBox.h = ctx.dimensions.y;
    loading.text.boundingBox = {...box, y: box.y - (box.h * 2)};
    loading.barBG.boundingBox = box;
    loading.bar.boundingBox = {...box, w:0};
}

export const init_loading = async() => {
    size_loading();

    loading.bar.color = '#FFFFFF'
    loading.text.text = 'Loading';
    loading.text.font = '80px serif'
    loading.text.color = '#FF0000';
    loading.BG.color = '#AAAAAA'

    Promise.allSettled(
        load_assets(
            loading,
            () => {loading.progress += (1 / assetCount()); console.log("progress",loading.progress)},
            (err) => console.log("Error",err)
        )
    )
    .then(() => {console.log("loaded"); loading.done = true})
    // console.log("socket", ctx.ws, ctx.wsState)
}
