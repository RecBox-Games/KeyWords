const assetsSrc = ['keywords_background.png', 'chest.png', 'bomb.png', 'sword.png', 'heal.png', `silhouette.png`, 'grass.png'];
const assets = {};
export const assetsDic = {
    'bomb': ' damage to your team',
    'sword': ' damage to the enemy team',
    'empty': 'There is nothing here :)',
    'heal': ' hearts for your team'
};
export const assetCount = () => assetsSrc.length;
export const get_asset = (name) => assets[name];
const loadAsset = (loading, src, res, rej) => {
    const promise = new Promise((res, rej) => {
        const img = new Image();
        img.addEventListener('load', () => {
            loading.progress += 1 / assetCount();
            assets[src.slice(0, -4)] = img;
            console.log("loaded asset", src, loading.progress);
            res(img);
        });
        img.addEventListener('error', (err) => { console.log("failed", src); rej(err); });
        img.src = 'resources/' + src;
    });
    return promise;
};
export const load_assets = (loading, res, rej) => {
    const arr = [];
    for (let asset of assetsSrc) {
        arr.push(loadAsset(loading, asset, res, rej));
    }
    return arr;
};
