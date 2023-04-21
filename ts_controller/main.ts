import { buttons_add } from "./controller_lib/button.js";
import { drawablesAdd, drawablesPrint, drawablesRenderAll } from "./controller_lib/draw.js";
import { get_context, init_context } from "./controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT, DrawableImage, DrawableRect, DrawableText } from "./controller_lib/types/drawables.js";
import { Rectangle } from "./controller_lib/types/shapes.js";
import { Button } from "./controller_lib/types/triggerable.js";
import { cp_update } from "./controller_lib/update.js";
import { center_text, scale_and_center } from "./controller_lib/utils.js";
import { init_menu, menu_loop } from "./menu.js";
// import {words_bad } from "../resources/words.js"

// const words_good = ["aaaa"];
// const words_good = words_bad as string[];
const words_good:string[] = ["Building","Tax","Paper","Space","Ground","Couple","Table","Court","American","Oil","Street","Image","Phone","Doctor","Wall","Worker","News","Movie","North","Computer","Film","Republican","Tree","Hair","Window","Brother","Period","Course","Summer","Letter","Choice","Daughter","South","Husband","Congress","Floor","Campaign","Material","Population","Hospital","Church","Bank","West","Sport","Board","Officer","Goal","Bed","Author","Blood","Page","Language","Article","East","Artist","Scene","Dog","Media","Thought","Pressure","Meeting","Disease","Cup","Staff","Box","TV","Bill","Message","Lawyer","Glass","Sister","Professor","Crime","Stage","Gun","Station","Truth","Song","Leg","Manager","Science","Card","Cell","Democrat","Radio","Ball","Chair","Camera","Evening","Writer","Shoulder","Sea","Bar","Magazine","Hotel","Soldier","Bag","Marriage","Skin","Gas","Cancer","Yard","Finger","Garden","Kitchen","Shot","Painting","Scientist","Capital","Mouth","Newspaper","Dinner","Citizen","Mission","Forest","Video","Troop","Freedom","Plane","Camp","Brain","Fan","Hole","Stone","Ice","Boat","Sun","Wood","Truck","Mountain","Winter","Village","Gold","Club","Farm","Band","Horse","Prison","Text","River","Path","Ear","Christmas","Baseball","Egg","Coffee","Quarter","Shoe","Bone","Wine","Bus","Internet","Medicine","Photo","Classroom","Pair","Knee","Flower","Tape","Closet","Pitcher","Snake","Pig","Beef","Elbow","Duck","Van","Sandwich","Trunk","Cloth","Lens","Nail","Rat","Cave","Crystal","Pen","Arena","Warrior","Bacteria","Mud","Temple","Wrist","Curtain","Pond","Cattle","Skirt","Horn","Guitar","Towel","Bat","Alarm","Astronomer","Thumb","Fork","Sodium","Needle","Doll","Oxygen","Magic","Jazz","Opera","Pit","Gym","Bath","Laser","Pizza","Candle","Lamp","Garbage","Chin","Silk","Alien","Angel","Pillow","Ranch","Diamond","Gasoline","Diabetes","Rocket","Carpet","Bubble","Barn","Sword","Drum","Queen","Fridge","Nest","Steam","Cage","Shrimp","Wolf","Bug","Vaccine","Wagon","Bush","Bull","Sheep","Skull","Bee","Mushroom","Jar","Pork","Sock","Helmet","Lion","Cliff","Casino","Tumor","Spoon","Soap","Pin","Purse","Bicycle","Rabbit","Coin","Stove","Dough","Hormone","Pencil","Oak","Notebook","Shark"
];

const BOARD_W: number = 5;
const BOARD_H: number = 5;

// const words:string[][] = [];
// 	drawab
// }

interface ChestGuesser {
    id: number;
    text:DrawableText;
    sprite:DrawableRect;
}

interface ChestGiver {
    id: number;
    contentText: DrawableText;
    contentImage: DrawableRect;
    contentContainer: DrawableRect;
    text:DrawableText;
    sprite:DrawableRect;
}

interface Overlay {
    shadow: DrawableRect;
    box:DrawableRect;
    text:DrawableRect;
    item:DrawableRect;
}

interface TopBar {
    text: DrawableText;
    subText: DrawableText;
    accept:DrawableRect;
    deny:DrawableRect;
}

interface Board {
    background: DrawableImage;
    chests:((ChestGuesser | ChestGiver)[])[];
    topbar:TopBar;
    buttons:(Button[])[]
}

let board:Board;

const chest_clicked_guessser = (self:Button) =>
{
    const id = (self.data as ChestGuesser).id;
    console.log("Chest clicked at ", id % BOARD_W, (id / BOARD_H)| 0);
}

const construct_chestGiver = (row:number, col: number) => {

}

const construct_chestGuesser = (x:number, y: number, box:Rectangle) : ChestGuesser => {
    const rand = Math.floor((Math.random() * 100 ) % words_good.length);

    console.log("Picked ", words_good[0], rand, words_good[rand]);
    words_good.splice(rand, 1);
    const newChest: ChestGuesser = {
        id: x + (BOARD_W * y),
        text: {...DEFAULT_DRAWABLE_TEXT, text: words_good[rand], color:"#FFFFFF"},
        sprite: {...DEFAULT_DRAWABLE_RECT, boundingBox: {...box}}// {..box} or else it will assign as reference
    }
    const newTextBox = center_text(newChest.text.text, newChest.text.font, box);
    newChest.text.x = newTextBox.x;
    newChest.text.y = newTextBox.y;


    return newChest;
}

const construct_Board = () => {
    const ctx = get_context();

    let x: number;
    let y: number;

    const chests : (ChestGiver [] | ChestGuesser [])[] = [];
    const gapy = (ctx.dimensions.y - ctx.dimensions.y * 0.1) * 0.05;
    const gapx = (ctx.dimensions.x / 16);
    const boundingBox:Rectangle = {
            x: gapx,
            y: (ctx.dimensions.y * 0.2),
            h: (ctx.dimensions.y - ctx.dimensions.y * 0.12) / 8,
            w: ctx.dimensions.x / 8
        };

    for (y = 0; y < BOARD_H; y += 1)
    {
        const chest_Arr: (ChestGuesser | ChestGiver)[] = [];
        const button_Arr: Button[] = [];
        boundingBox.x = gapx;
        for (x = 0; x < BOARD_W; x += 1)
        {
            let newChest:ChestGuesser = construct_chestGuesser(x, y, boundingBox);
            let newButton:Button = new Button({...boundingBox}, undefined, undefined, chest_clicked_guessser);

            newButton.data = newChest;
            chest_Arr.push(newChest);
            button_Arr.push(newButton);
            buttons_add(newButton);
            boundingBox.x += gapx + boundingBox.w;
        }
        boundingBox.y += gapy + boundingBox.h;
        chests.push(chest_Arr)
        // arr.length = 10;
    }
    return chests;
}

const construct_topbar = ():TopBar =>
{
    const TopBar:TopBar = {
        text: DEFAULT_DRAWABLE_TEXT,
        subText: DEFAULT_DRAWABLE_TEXT,
        accept: DEFAULT_DRAWABLE_RECT,
        deny: DEFAULT_DRAWABLE_RECT,
    };


    return TopBar
}

const init_app = () => {
    init_context();

    const bg:DrawableImage = {...DEFAULT_DRAWABLE_IMG, image: new Image()};

    (bg.image as HTMLImageElement).onload = function (e) {
        console.log("loaded");
    }
    board = {
        background: bg,
        chests: construct_Board(),
        topbar: construct_topbar(),
        buttons: []
    };
    (bg.image as HTMLImageElement).src = '../resources/keywords_background.png';
    // init_menu();
    // board.background.dst = <Rectangle>{x:0, y:0 ,w:context.dimensions.x, h:context.dimensions.y};
}

const main_loop = () => {

    for (let i = 0; i < BOARD_W; i += 1)
        for (let j = 0; j < BOARD_W; j += 1)
        {
            drawablesAdd(board.chests[i][j].sprite);
            drawablesAdd(board.chests[i][j].text)
        }
}

const app = () => {

    const context = get_context();
	// cp_update();

    drawablesAdd(board.background);
    // drawablesPrint();
    // menu_loop();
    main_loop();
    drawablesRenderAll();
	// console.log("Hello");
	window.requestAnimationFrame(app);
}

window.onload = () => {
    console.log("init");
    init_app();

    window.requestAnimationFrame(app);
}


//TODO: add layer to drawable & sort it before rendering + render functions
