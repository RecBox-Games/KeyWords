import { add_animation } from "./animation.js";
import { buttons_add } from "./controller_lib/button.js";
import { drawablesAdd, drawablesPrint, drawablesRenderAll } from "./controller_lib/draw.js";
import { get_context, init_context } from "./controller_lib/init.js";
import { Context } from "./controller_lib/types/context.js";
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
    open:boolean;
    id: number;
    text:DrawableText;
    sprite:DrawableRect;
}

interface ChestGiver {
    open:boolean;
    id: number;
    contentText: DrawableText;
    contentImage: DrawableRect;
    contentContainer: DrawableRect;
    text:DrawableText;
    sprite:DrawableRect;
}

interface Overlay {
    shadow: DrawableRect;
    exit: Button;
    exitSprite: DrawableRect;
    box:DrawableRect;
    text:DrawableText;
    subtext:DrawableText;
    item:DrawableRect;
}

interface TopBar {
    text: DrawableText;
    subText: DrawableText;
    accept:DrawableRect;
    deny:DrawableRect;
    acceptButton:Button;
    denyButton:Button;
}

interface Board {
    background: DrawableImage;
    chests:((ChestGuesser | ChestGiver)[])[];
    topbar:TopBar;
    buttons:(Button[])[];
    guessedWord: string | undefined;
    totalGuesses: number;
    currentGuesses: number;
    overlay:Overlay;
    showOverlay:boolean;
}

let board:Board;

const set_chests_status = (status:boolean) =>
{
    for (let i = 0; i < BOARD_W; i += 1)
        for (let j = 0; j < BOARD_W; j += 1)
        {
            if (!board.chests[i][j].open)
                board.buttons[i][j]._active = status;
        }
}

const chest_clicked_guessser = (self:Button) =>
{
    if (board.guessedWord)
        console.log("Someone already guessed a word, accept or deny ", board.guessedWord);
    else
    {
        console.log("Guessing ", (self.data as ChestGuesser).text.text);
        board.topbar.acceptButton._active = true;
        board.topbar.denyButton._active = true;
        board.topbar.text.text = "Team's guess : \"" + (self.data as ChestGuesser).text.text + "\"";
        board.guessedWord = (self.data as ChestGuesser).text.text;
    }
}

const start_turn = () =>
{
    board.topbar.text.text = "Your clue is {{insert_clue}}";
    board.currentGuesses = 0;
    board.totalGuesses = 5;
    board.topbar.subText.text = "";
    set_chests_status(true);
}



const end_turn = () =>
{
    board.topbar.text.text = "Other team's turn";
    board.currentGuesses = 0;
    board.totalGuesses = 5;
    set_chests_status(false);
}

const open_chest = (id:number) => {
    const x = id % BOARD_W;
    const y = (id / BOARD_W) | 0; // | 0 to take the integer part, more efficient than floor or ceil

    // add_animation({object: board.chests[y][x].sprite, animate_fn: (object:Animation) => {object = }})
    board.chests[y][x].open = true;
}

const close_overlay = () =>{
    board.showOverlay = false;
    board.overlay.exit._active = false;
    set_chests_status(true);
    board.guessedWord = undefined;
}

const confirm_guess = () => {
    board.topbar.text.text = "Your clue is {{insert_clue}}";
    board.currentGuesses += 1;
    board.topbar.subText.text = "Guess " + board.currentGuesses.toString() + " of " + board.totalGuesses.toString();
    board.topbar.acceptButton._active = false;
    board.topbar.denyButton._active = false;
    board.guessedWord = undefined;
    board.showOverlay = true;
    set_chests_status(false);
    board.overlay.exit._active = true;
    console.log("confirm")
}

const deny_guess = () => {
    board.topbar.text.text = "Your clue is {{insert_clue}}";
    board.topbar.subText.text = "Guess " + board.currentGuesses.toString() + " of " + board.totalGuesses.toString();
    board.topbar.acceptButton._active = false;
    board.topbar.denyButton._active = false;
    board.guessedWord = undefined;
    console.log("deny")
}

const construct_chestGiver = (row:number, col: number) => {

}

const construct_chestGuesser = (x:number, y: number, box:Rectangle) : ChestGuesser => {
    const rand = Math.floor((Math.random() * 100 ) % words_good.length);

    console.log("Picked ", words_good[0], rand, words_good[rand]);
    words_good.splice(rand, 1);
    const newChest: ChestGuesser = {
        open: false,
        id: x + (BOARD_W * y),
        text: {...DEFAULT_DRAWABLE_TEXT, text: words_good[rand], color:"#FFFFFF", boundingBox:{...box}},
        sprite: {...DEFAULT_DRAWABLE_RECT, boundingBox: {...box}}// {..box} or else it will assign as reference
    }

    return newChest;
}

const construct_Board = () => {
    const ctx = get_context();

    let x: number;
    let y: number;

    const chests : (ChestGiver [] | ChestGuesser [])[] = [];
    const buttons: (Button[])[] = [];
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
        buttons.push(button_Arr);
        // arr.length = 10;
    };
    board.buttons = buttons;
    board.chests = chests;
}

const construct_topbar = ():TopBar =>
{
    const topBar:TopBar = {
        text: {...DEFAULT_DRAWABLE_TEXT},
        subText:{...DEFAULT_DRAWABLE_TEXT},
        accept: {...DEFAULT_DRAWABLE_RECT, color:"#00FF00"},
        deny: {...DEFAULT_DRAWABLE_RECT, color:"#FF0000"},
        acceptButton: new Button({x:0, y:0, w:0, h: 0}, undefined, undefined, confirm_guess),
        denyButton: new Button({x:0, y:0, w:0, h: 0}, undefined, undefined, deny_guess),
    };
    const ctx = get_context();
    const boundingBox:Rectangle = {x:0, y:0, w: ctx.dimensions.x, h: ctx.dimensions.y * 0.1};

    topBar.text.boundingBox = {...boundingBox};
    topBar.text.text = "Your clue is {{insert_clue}}";

    boundingBox.y += boundingBox.h;
    boundingBox.h = ctx.dimensions.y * 0.05;

    topBar.subText.text = "Guess X out of Y";
    topBar.subText.boundingBox = {...boundingBox};

    boundingBox.w = boundingBox.w * 0.1;
    boundingBox.x = ctx.dimensions.x * 0.5 - (boundingBox.w + boundingBox.w * 0.5);
    topBar.accept.boundingBox = {...boundingBox}
    topBar.deny.boundingBox = {...boundingBox, x : ctx.dimensions.x * 0.5 + (boundingBox.w * 0.5)}

    topBar.acceptButton._active = false;
    topBar.denyButton._active = false;

    topBar.acceptButton._boundingBox = topBar.accept.boundingBox;
    topBar.denyButton._boundingBox = topBar.deny.boundingBox;

    buttons_add(topBar.acceptButton);
    buttons_add(topBar.denyButton);

    return topBar
}


const construct_overlay = () :Overlay => {
    const ctx:Context = get_context();
    const new_Overlay:Overlay = {
        shadow:{boundingBox:{x: 0, y: 0, w : ctx.dimensions.x, h : ctx.dimensions.y}, color : "rgba(50, 50, 50, 0.3)", stroke : 0},
        box: {boundingBox:{x: ctx.dimensions.x *0.25, y: ctx.dimensions.y *0.25, w : ctx.dimensions.x *0.5, h : ctx.dimensions.y*0.5}, color : '#FF0000', stroke : 0},
        exit: new Button({x:0, y:0, w:0, h: 0}, undefined, undefined, close_overlay),
        exitSprite:{...DEFAULT_DRAWABLE_RECT},
        item:{...DEFAULT_DRAWABLE_RECT},
        text: {...DEFAULT_DRAWABLE_TEXT, text:"The chest opens..."},
        subtext: {...DEFAULT_DRAWABLE_TEXT, font : '30px serif'},
    };
    new_Overlay.exit._active = false;
    new_Overlay.exit._boundingBox  = {x: new_Overlay.box.boundingBox.x + 10, y: new_Overlay.box.boundingBox.y + 10, w: 50, h : 50}
    new_Overlay.exitSprite.boundingBox = new_Overlay.exit._boundingBox;
    new_Overlay.text.boundingBox = {...new_Overlay.box.boundingBox, h: new_Overlay.box.boundingBox.h * 0.2};
    new_Overlay.subtext.boundingBox = {...new_Overlay.box.boundingBox, h: new_Overlay.box.boundingBox.h * 0.4, y: new_Overlay.box.boundingBox.y + new_Overlay.box.boundingBox.h * 0.2};
    new_Overlay.item.boundingBox = {
        w: new_Overlay.box.boundingBox.w * .30,
        h: new_Overlay.box.boundingBox.h *.4,
        x: new_Overlay.box.boundingBox.x + ( new_Overlay.box.boundingBox.w * .35),
        y: new_Overlay.box.boundingBox.y +new_Overlay.box.boundingBox.h - ( new_Overlay.box.boundingBox.h * .45)
        }

    buttons_add(new_Overlay.exit);
    return new_Overlay;
}

const init_app = () => {
    init_context();

    const bg:DrawableImage = {...DEFAULT_DRAWABLE_IMG, image: new Image()};

    (bg.image as HTMLImageElement).onload = function (e) {
        console.log("loaded");
    }
    board = {
        background: bg,
        buttons: [],
        chests: [],
        topbar: construct_topbar(),
        overlay: construct_overlay(),
        guessedWord:undefined,
        totalGuesses: 4,
        currentGuesses:2,
        showOverlay: false
    };
    construct_Board();
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
    drawablesAdd(board.topbar.text);
    if (board.guessedWord)
    {
        drawablesAdd(board.topbar.accept);
        drawablesAdd(board.topbar.deny);
    }
    else
        drawablesAdd(board.topbar.subText);
    if (board.showOverlay)
    {
        drawablesAdd(board.overlay.shadow);
        drawablesAdd(board.overlay.box);
        drawablesAdd(board.overlay.exitSprite);
        drawablesAdd(board.overlay.text);
        drawablesAdd(board.overlay.subtext);
        drawablesAdd(board.overlay.item);
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
