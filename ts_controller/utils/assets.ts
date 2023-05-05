import { DrawableRect, DrawableText } from "../controller_lib/types/drawables.js";
import { Loading } from "../game/loading/init.js";

const assetsSrc = ['keywords_background.png',
 `banner.png`,
 `buttons.png`,
 `bomb.png`,
 `chests.png`,
 `chest_contents.png`,
 `heal.png`,
 `keys.png`,
 `keywords_background.png`,
 `loading.png`,
 `roles.png`,
 `sword.png`,
 `title.png`,
 `tutorial.png`,
];
const assets:any = {};

export const assetsDic = {
    'bomb': ' damage to your team',
    'sword': ' damage to the enemy team',
    'empty': 'There is nothing here :)',
    'heal': ' hearts for your team'
}

export const assetCount = () => assetsSrc.length;

export const get_asset = (name) => assets[name];

const loadAsset = (loading:Loading, src:string, res, rej) => {
    const promise =  new Promise((res, rej) =>
    {
        const img = new Image();
        img.addEventListener('load', () => {
            loading.progress += 1 / assetCount();
            assets[src.slice(0, -4)] = img;
            res(img);
        });
        img.addEventListener('error', (err) => {console.log("failed", src);rej(err)});
        img.src = 'resources/' + src;
    })
    return promise;
};

export const load_assets = (loading:Loading, res, rej) => {
    const arr:any = [];

    for (let asset of assetsSrc)
    {
        arr.push(loadAsset(loading, asset, res, rej))
    }
    return arr;
}
