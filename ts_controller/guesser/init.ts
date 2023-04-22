import { buttons_add } from "../controller_lib/button.js";
import { get_context, } from "../controller_lib/init.js";
import { Context } from "../controller_lib/types/context.js";
import { DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT, DrawableImage } from "../controller_lib/types/drawables.js";
import { Rectangle } from "../controller_lib/types/shapes.js";
import { Button } from "../controller_lib/types/triggerable.js";
import { BOARD_W, Board, ChestGuesser, Overlay } from "./interfaces.js";
import { BOARD_H, ChestGiver, TopBar } from "./interfaces.js";
import { chest_clicked_guessser, close_overlay, confirm_guess, deny_guess } from "./utils.js";

const words_good:string[] = ["Building","Tax","Paper","Space","Ground","Couple","Table","Court","American","Oil","Street","Image","Phone","Doctor","Wall","Worker","News","Movie","North","Computer","Film","Republican","Tree","Hair","Window","Brother","Period","Course","Summer","Letter","Choice","Daughter","South","Husband","Congress","Floor","Campaign","Material","Population","Hospital","Church","Bank","West","Sport","Board","Officer","Goal","Bed","Author","Blood","Page","Language","Article","East","Artist","Scene","Dog","Media","Thought","Pressure","Meeting","Disease","Cup","Staff","Box","TV","Bill","Message","Lawyer","Glass","Sister","Professor","Crime","Stage","Gun","Station","Truth","Song","Leg","Manager","Science","Card","Cell","Democrat","Radio","Ball","Chair","Camera","Evening","Writer","Shoulder","Sea","Bar","Magazine","Hotel","Soldier","Bag","Marriage","Skin","Gas","Cancer","Yard","Finger","Garden","Kitchen","Shot","Painting","Scientist","Capital","Mouth","Newspaper","Dinner","Citizen","Mission","Forest","Video","Troop","Freedom","Plane","Camp","Brain","Fan","Hole","Stone","Ice","Boat","Sun","Wood","Truck","Mountain","Winter","Village","Gold","Club","Farm","Band","Horse","Prison","Text","River","Path","Ear","Christmas","Baseball","Egg","Coffee","Quarter","Shoe","Bone","Wine","Bus","Internet","Medicine","Photo","Classroom","Pair","Knee","Flower","Tape","Closet","Pitcher","Snake","Pig","Beef","Elbow","Duck","Van","Sandwich","Trunk","Cloth","Lens","Nail","Rat","Cave","Crystal","Pen","Arena","Warrior","Bacteria","Mud","Temple","Wrist","Curtain","Pond","Cattle","Skirt","Horn","Guitar","Towel","Bat","Alarm","Astronomer","Thumb","Fork","Sodium","Needle","Doll","Oxygen","Magic","Jazz","Opera","Pit","Gym","Bath","Laser","Pizza","Candle","Lamp","Garbage","Chin","Silk","Alien","Angel","Pillow","Ranch","Diamond","Gasoline","Diabetes","Rocket","Carpet","Bubble","Barn","Sword","Drum","Queen","Fridge","Nest","Steam","Cage","Shrimp","Wolf","Bug","Vaccine","Wagon","Bush","Bull","Sheep","Skull","Bee","Mushroom","Jar","Pork","Sock","Helmet","Lion","Cliff","Casino","Tumor","Spoon","Soap","Pin","Purse","Bicycle","Rabbit","Coin","Stove","Dough","Hormone","Pencil","Oak","Notebook","Shark"
];

let board:Board;

export const  get_board = () => {return board};

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


export const init_main_screen = (bg:DrawableImage) =>
{
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
}
