import { drawablesAdd, drawablesRenderAll } from "./controller_lib/draw.js";
import { get_context, init_context } from "./controller_lib/init.js";
import { DEFAULT_DRAWABLE_IMG, DrawableImage } from "./controller_lib/types/drawables.js";
import { get_board, init_main_screen } from "./guesser/init.js";
import { main_loop } from "./guesser/render.js";
import { init_menu, menu_loop } from "./menu.js";

const words_good:string[] = ["Building","Tax","Paper","Space","Ground","Couple","Table","Court","American","Oil","Street","Image","Phone","Doctor","Wall","Worker","News","Movie","North","Computer","Film","Republican","Tree","Hair","Window","Brother","Period","Course","Summer","Letter","Choice","Daughter","South","Husband","Congress","Floor","Campaign","Material","Population","Hospital","Church","Bank","West","Sport","Board","Officer","Goal","Bed","Author","Blood","Page","Language","Article","East","Artist","Scene","Dog","Media","Thought","Pressure","Meeting","Disease","Cup","Staff","Box","TV","Bill","Message","Lawyer","Glass","Sister","Professor","Crime","Stage","Gun","Station","Truth","Song","Leg","Manager","Science","Card","Cell","Democrat","Radio","Ball","Chair","Camera","Evening","Writer","Shoulder","Sea","Bar","Magazine","Hotel","Soldier","Bag","Marriage","Skin","Gas","Cancer","Yard","Finger","Garden","Kitchen","Shot","Painting","Scientist","Capital","Mouth","Newspaper","Dinner","Citizen","Mission","Forest","Video","Troop","Freedom","Plane","Camp","Brain","Fan","Hole","Stone","Ice","Boat","Sun","Wood","Truck","Mountain","Winter","Village","Gold","Club","Farm","Band","Horse","Prison","Text","River","Path","Ear","Christmas","Baseball","Egg","Coffee","Quarter","Shoe","Bone","Wine","Bus","Internet","Medicine","Photo","Classroom","Pair","Knee","Flower","Tape","Closet","Pitcher","Snake","Pig","Beef","Elbow","Duck","Van","Sandwich","Trunk","Cloth","Lens","Nail","Rat","Cave","Crystal","Pen","Arena","Warrior","Bacteria","Mud","Temple","Wrist","Curtain","Pond","Cattle","Skirt","Horn","Guitar","Towel","Bat","Alarm","Astronomer","Thumb","Fork","Sodium","Needle","Doll","Oxygen","Magic","Jazz","Opera","Pit","Gym","Bath","Laser","Pizza","Candle","Lamp","Garbage","Chin","Silk","Alien","Angel","Pillow","Ranch","Diamond","Gasoline","Diabetes","Rocket","Carpet","Bubble","Barn","Sword","Drum","Queen","Fridge","Nest","Steam","Cage","Shrimp","Wolf","Bug","Vaccine","Wagon","Bush","Bull","Sheep","Skull","Bee","Mushroom","Jar","Pork","Sock","Helmet","Lion","Cliff","Casino","Tumor","Spoon","Soap","Pin","Purse","Bicycle","Rabbit","Coin","Stove","Dough","Hormone","Pencil","Oak","Notebook","Shark"
];


let state = 0;
let bg;

export const  set_state = (new_state:number) => {
    if (new_state == 1 && !get_board())
        init_main_screen(bg);
        state = new_state
    }

const init_app = () => {
    init_context();

    bg = {...DEFAULT_DRAWABLE_IMG, image: new Image()};

    (bg.image as HTMLImageElement).onload = function (e) {
        console.log("loaded");
    }
    init_menu();
    // init_main_screen(bg);
    (bg.image as HTMLImageElement).src = '../resources/keywords_background.png';
    // board.background.dst = <Rectangle>{x:0, y:0 ,w:context.dimensions.x, h:context.dimensions.y};
}



const app = () => {

    // drawablesPrint();
    if (state == 0)
        menu_loop();
    if (state == 1)
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
