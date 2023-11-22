import { get_context } from "../controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG, DrawableImage} from "../controller_lib/types/drawables.js";
import { get_asset } from "./assets.js";

let team_indicator : TeamIndicator;

export const get_team_indicator = () => team_indicator;

export interface TeamIndicator {
    red: DrawableImage,
    blue: DrawableImage
}

export function construct_team_indicator() {
    team_indicator =  {
        red: {...DEFAULT_DRAWABLE_IMG},
        blue: {...DEFAULT_DRAWABLE_IMG}
    }    
}

export function initialize_team_indicator() {
    team_indicator.red.image = get_asset("red_team_indicator");
    team_indicator.blue.image = get_asset("blue_team_indicator");
    team_indicator.red.src = {x: 0, y: 0, w: 65, h: 50};
    team_indicator.blue.src = {x: 0, y: 0, w: 65, h: 50};
    resize_team_indicators();
}

export function resize_team_indicators() {
    let ctx = get_context();    
    team_indicator.blue.dst = {
        x: ctx.dimensions.x * 0.88,
        y: ctx.dimensions.y * 0.84,
        w: ctx.dimensions.x * 0.112,
        h: ctx.dimensions.y * 0.1,
    };
    team_indicator.red.dst = {
        x: ctx.dimensions.x * 0.88,
        y: ctx.dimensions.y * 0.84,
        w: ctx.dimensions.x * 0.112,
        h: ctx.dimensions.y * 0.1,
    };

}

