use ggez::{Context, ContextBuilder, GameResult, conf};
use ggez::event::{self, EventHandler};
use ggez::graphics;
use ggez::graphics::{Color, Rect};
use ggez::mint::Point2;
//use ggez::input::mouse::MouseButton;

use targetlib::{CPClient, CPSpec, Panel, Button, ControlDatum};//, Joystick};

use std::fs;
use rand::{seq::IteratorRandom, thread_rng};

use std::error::Error;
pub type Result<T> = std::result::Result<T, Box<dyn Error>>;


mod elem;
use crate::elem::*;


const START_WIDTH:  f32 = 1920.0;
const START_HEIGHT: f32 = 1080.0;


fn main() {

    // open a window
    let my_window_settings = conf::WindowSetup {
	title: "CodeWords".to_owned(),
	samples: conf::NumSamples::One,
	vsync: true,
	icon: "".to_owned(),
	srgb: true,
    };
    let mut my_window_mode = conf::WindowMode::default();
    my_window_mode.resizable  = true;
    my_window_mode.min_width  = 400.0;
    my_window_mode.min_height = 300.0;
    my_window_mode.width      = START_WIDTH;
    my_window_mode.height     = START_HEIGHT;
    //my_window_mode.fullscreen_type = conf::FullscreenType::True;

    // Make a Context and an EventLoop.
    let (mut ctx, event_loop) =
       ContextBuilder::new("KeyWords", "weston")
	.window_setup(my_window_settings)
	.window_mode(my_window_mode)
        .build()
        .unwrap();

    graphics::set_default_filter(&mut ctx, graphics::FilterMode::Nearest);

    
    // Create an instance of your event handler.
    // Usually, you should provide it with the Context object
    // so it can load resources like images during setup.
    let my_runner = match MyRunner::new(&mut ctx) {
        Ok(r) => r,
        Err(e) => panic!("failed to create MyRunner: {}", e)
    };

    // Run!
    event::run(ctx, event_loop, my_runner);

    
}

#[derive(Debug, PartialEq, Eq, Clone, Copy)]
enum Team {
    A,
    B,
}

fn not_team(p: Team) -> Team{
    match p {
	Team::A => Team::B,
	Team::B => Team::A,
    }
}

fn team_color(p: Team) -> Color {
    match p {
        Team::B => Color::new(0.65, 0.4, 0.8, 1.0),
        Team::A =>  Color::new(0.85, 0.65, 0.4, 1.0),
    }
}

fn team_name(p: Team) -> &'static str {
    match p {
        Team::B => "Purple",
        Team::A =>  "Orange",
    }
}


#[derive(Debug, PartialEq, Eq, Clone, Copy)]
enum ChestType {
    Gold,
    Yellow,
    Gray,
    Red,
    Crimson,
    Death,
    Heal,
}

fn opposite_color(cc: &ChestType) -> ChestType {
    match cc {
        ChestType::Crimson  => ChestType::Gold,
        ChestType::Red => ChestType::Yellow,
        _ => panic!("No opposite of {:?}", cc),
    }
}

// TODO: chestcolor -> chest_type
fn chestcolor_to_vec(cc: &ChestType) -> [u8; 4] {
    match cc {
	ChestType::Gold    => [40, 200, 30,  255],
        ChestType::Yellow  => [170, 210, 170, 255],
        ChestType::Gray    => [210, 210, 220, 255],
        ChestType::Red     => [210, 170, 170, 255],
        ChestType::Crimson => [230, 40,  40, 255],
        ChestType::Death   => [80,  80,  80,  255],
        ChestType::Heal    => [30,  120, 220, 255],
    }
}

fn chestcolor_to_color(cc: &ChestType) -> Color {
    let v = chestcolor_to_vec(cc);
    let r = v[0] as f32 / 255.0;
    let g = v[1] as f32 / 255.0;
    let b = v[2] as f32 / 255.0;
    let a = v[3] as f32 / 255.0;
    Color::new(r, g, b, a)
}

fn color_to_vec(c: Color) -> [u8; 4] {
    let r = (c.r * 255.0) as u8;
    let g = (c.g * 255.0) as u8;
    let b = (c.b * 255.0) as u8;
    let a = (c.a * 255.0) as u8;
    [r,g,b,a]
}

fn x_offset_of_chest_type(ct: ChestType) -> f32 {
   match ct {
	ChestType::Gold    => 0.4,
        ChestType::Yellow  => 0.5,
        ChestType::Gray    => 0.3,
        ChestType::Red     => 0.6,
        ChestType::Crimson => 0.7,
        ChestType::Death   => 0.8,
        ChestType::Heal    => 0.9,
    }
}

fn health_mod_of_chest_type(ct: ChestType) -> i32 {
   match ct {
	ChestType::Gold    => 2,
        ChestType::Yellow  => 1,
        ChestType::Gray    => 0,
        ChestType::Red     => 1,
        ChestType::Crimson => 2,
        ChestType::Death   => 5,
        ChestType::Heal    => 3,
    }
}


struct WordChest {
    word: String,
    // TODO: text_graphic so we dont render each frame
    chest_type: ChestType,
    openned: Option<Team>,
    done: bool,
    sprite: SpriteElem,
    text: TextElem,
}

impl WordChest {
    fn new(ctx: &mut Context, x: f32, y: f32, chest_type: ChestType, word: String) -> Self {
	// TODO: use new().set_animation() pattern?
	let mut chest_sprite = SpriteElem::new(ctx, x, y, 2.0, 1.4, "/chest_sprites.png");
	chest_sprite.set_animation(
	    vec![Rect::new(0.0, 0.0, 0.1, 1.0)],
	    1,
	    false,
	);
	let mut word_text = TextElem::new(0.0, 0.0, word.clone(), 36.0, Color::new(0.9, 0.8, 0.7, 1.0));
	let tx = chest_sprite.width(ctx)*0.03 + (chest_sprite.width(ctx) - word_text.width(ctx))/2.0;
	let ty = chest_sprite.height(ctx) - 38.0;
	word_text.set_location(x+tx, y+ty);

	WordChest {
	    word: word,
	    chest_type: chest_type,
	    openned: None,
	    done: false,
	    sprite: chest_sprite,
	    text: word_text,
	}
    }

    fn open(&mut self, ctx: &mut Context, team: Team) {
	self.openned = Some(team);
	self.sprite.set_animation(
	    vec![Rect::new(0.1, 0.0, 0.1, 1.0),
		 Rect::new(0.2, 0.0, 0.1, 1.0),
		 Rect::new(x_offset_of_chest_type(self.chest_type), 0.0, 0.1, 1.0),
		 Rect::new(x_offset_of_chest_type(self.chest_type), 0.0, 0.1, 1.0),
		 Rect::new(x_offset_of_chest_type(self.chest_type), 0.0, 0.1, 1.0),
		 Rect::new(x_offset_of_chest_type(self.chest_type), 0.0, 0.1, 1.0),
		 Rect::new(x_offset_of_chest_type(self.chest_type), 0.0, 0.1, 1.0),
		 Rect::new(x_offset_of_chest_type(self.chest_type), 0.0, 0.1, 1.0),
		 Rect::new(0.3, 0.0, 0.1, 1.0)],
	    12,
	    false,
	);
	self.text = TextElem::new(0.0, 0.0, self.word.clone(), 34.0, Color::new(0.15, 0.12, 0.09, 1.0));
	let tx = self.sprite.width(ctx)*0.03 + (self.sprite.width(ctx) - self.text.width(ctx))/2.0;
	let ty = self.sprite.height(ctx) - 40.0;
	self.text.set_location(self.sprite.x()+tx, self.sprite.y()+ty);
    }
    
    fn draw(&self, ctx: &mut Context) -> GameResult<()> {
	let p = Point{x:0.0,y:0.0};
	self.sprite.draw(ctx, p)?;
	self.text.draw(ctx, p)?;
        Ok(())
    }

    // returns info needed to modify health once chest is done openning
    fn update(&mut self) -> Option<(Team, ChestType)> {
	self.sprite.update();
	if let Some(team) = self.openned {
	    if !self.done && self.sprite.done_animating() {
		self.done = true;
		return Some((team, self.chest_type));
	    }
	}
	None
    }
}


#[derive(PartialEq)]
enum HeartAnim {
    Steady,
    Shrinking,
    Growing,
}

struct HeartBar {
    target_health: i32,
    bar: SpriteElem,
    top_heart: SpriteElem,
    lower_hearts: Container,
    anim: HeartAnim,
}

impl HeartBar {
    fn new(ctx: &mut Context, health: i32, x: f32, y: f32, team: Team) -> Self {
	let mut lows = Container::new(x, y, vec![]);
	let (hc_img_name, offset) = match team {
	    Team::A => ("/heart_container_o.png", -240.0*3.0),
	    Team::B => ("/heart_container_p.png", -280.0*3.0),
	};
	let bar = SpriteElem::new(ctx, x - 6.0, y - 6.0 + offset, 3.0, 3.0, hc_img_name);
	for i in 0..(health-1) {
	    let y_i = 0.0 - i as f32*20.0*3.0;
	    let mut sprite = SpriteElem::new(ctx, 0.0, y_i, 3.0, 3.0, "/heart_sprites.png");
	    sprite.set_animation(vec![Rect::new(0.0, 0.0, 0.25, 1.0)], 8, false);
	    lows.push(Box::new(sprite));
	}
	let mut top = SpriteElem::new(ctx, 0.0, 0.0, 3.0, 3.0, "/heart_sprites.png"); // position at end
	top.set_animation(vec![Rect::new(0.00, 0.0, 0.25, 1.0)], 8, false);
	let mut hb = HeartBar {
	    target_health: health,
	    bar: bar,
	    top_heart: top,
	    lower_hearts: lows,
	    anim: HeartAnim::Steady,
	};
	hb.position_top_heart();
	hb
    }

    fn position_top_heart(&mut self) {
	self.top_heart.set_location(
	    self.lower_hearts.x(),
	    self.lower_hearts.y() - self.lower_hearts.len() as f32*20.0*3.0
	);
	self.top_heart.restart_animation();
    }
    
    fn modify_health(&mut self, n: i32) {
	self.target_health += n;
	if self.target_health < 0 {
	    self.target_health = 0;
	}
    }

    fn empty(&self) -> bool {
	self.target_health == 0 && self.lower_hearts.len() == 0 && self.top_heart.done_animating()
    }

    fn add_heart(&mut self, ctx: &mut Context) {
	let mut sprite = SpriteElem::new(
	    ctx, 0.0,
	    0.0 - self.lower_hearts.len() as f32*20.0*3.0,
	    3.0, 3.0, "/heart_sprites.png"
	);
	sprite.set_animation(vec![Rect::new(0.0, 0.0, 0.25, 1.0)], 8, false);
	self.lower_hearts.push(Box::new(sprite));
	self.position_top_heart();
    }

    fn subtract_heart(&mut self) {
	self.lower_hearts.pop();
	self.position_top_heart();
    }
    
    fn update_animation(&mut self, anim: HeartAnim) {
	match anim {
	    HeartAnim::Steady => {
		self.top_heart.set_animation(vec![Rect::new(0.00, 0.0, 0.25, 1.0)], 8, false);
	    }
	    HeartAnim::Shrinking => {
		self.top_heart.set_animation(vec![Rect::new(0.00, 0.0, 0.25, 1.0),
						  Rect::new(0.25, 0.0, 0.25, 1.0),
						  Rect::new(0.50, 0.0, 0.25, 1.0),
						  Rect::new(0.75, 0.0, 0.25, 1.0)
		], 10, false);
	    }
	    HeartAnim::Growing => {
		self.top_heart.set_animation(vec![Rect::new(0.75, 0.0, 0.25, 1.0),
						  Rect::new(0.50, 0.0, 0.25, 1.0),
						  Rect::new(0.25, 0.0, 0.25, 1.0),
						  Rect::new(0.00, 0.0, 0.25, 1.0)
		], 10, false);
	    }
	}
	self.anim = anim;
    }
    
    fn update(&mut self, ctx: &mut Context) {
	if self.target_health == self.lower_hearts.len() as i32+1 {
	    if (self.anim == HeartAnim::Growing && self.top_heart.done_animating()) ||
		self.anim == HeartAnim::Shrinking {
		    self.update_animation(HeartAnim::Steady);
		}
	}
	else if self.target_health < self.lower_hearts.len() as i32+1 {
	    if self.anim != HeartAnim::Shrinking {
		self.update_animation(HeartAnim::Shrinking);
	    } else if self.top_heart.done_animating() {
		self.subtract_heart();
	    }
	}
	else if self.target_health > self.lower_hearts.len() as i32+1 {
	    if self.anim != HeartAnim::Growing {
		self.update_animation(HeartAnim::Growing);
		self.add_heart(ctx);
	    } else if self.top_heart.done_animating() {
		self.add_heart(ctx);
	    }
	}
	self.top_heart.update();
    }

    fn draw(&self, ctx: &mut Context) -> GameResult<()> {
	let p = Point{x:0.0,y:0.0};
	self.bar.draw(ctx,p)?;
	self.lower_hearts.draw(ctx,p)?;
	self.top_heart.draw(ctx,p)?;
	Ok(())
    }
}

struct MyRunner {
    background: SpriteElem,
    clients: Vec<CPClient>,
    word_chests: Vec<Vec<WordChest>>,
    now_team: Team,
    guesses: u32,
    winner: Option<Team>,
    a_hearts: HeartBar,
    b_hearts: HeartBar,
}

impl MyRunner {

    fn new(ctx: &mut Context) -> Result<Self> {
        // errs when cant read file
	let bg = SpriteElem::new(ctx, 0.0, 0.0, 4.0, 4.0, "/background.png");
        let s = fs::read_to_string("/home/requin/rqn/words/game_words.txt")?;
        let all_words_ = s.split("\n").collect::<Vec<&str>>(); 
        let all_words = all_words_[..all_words_.len()-1].iter(); // always a newline at the end so last element is empty
        let mut rng = thread_rng();
        let chosen_words = all_words.choose_multiple(&mut rng, 25);
        let mut runner = MyRunner {
	    background: bg,
            clients: targetlib::get_client_info(),
            word_chests: Vec::new(),
            now_team: Team::A,
	    guesses: 0,
            winner: None,
	    a_hearts: HeartBar::new(ctx, 10, 100.0, 920.0, Team::A),
	    b_hearts: HeartBar::new(ctx, 12, 1820.0 - 20.0*3.0, 920.0, Team::B),
        };

        // randomly choose chest colors
        let golds: Vec<usize> = (0..25).collect();
        let yellows = golds.clone().into_iter()
	    .choose_multiple(&mut rng, 25-4);
        let grays = yellows.clone().into_iter()
	    .choose_multiple(&mut rng, 25-4-5);
        let reds = grays.clone().into_iter()
	    .choose_multiple(&mut rng, 25-4-5-5);
        let crimsons = reds.clone().into_iter()
	    .choose_multiple(&mut rng, 25-4-5-5-5);
        let deaths = crimsons.clone().into_iter()
	    .choose_multiple(&mut rng, 25-4-5-5-5-4);
        let heals = deaths.clone().into_iter()
	    .choose_multiple(&mut rng, 25-4-5-5-5-4-1);
	
        // initiate chests
        for j in 0..5 {
            runner.word_chests.push(Vec::new());
            for i in 0..5 {
                let i_flat = j*5 + i;
                let color = if heals.contains(&i_flat) {
                    ChestType::Heal
                } else if deaths.contains(&i_flat) {
                    ChestType::Death
                } else if crimsons.contains(&i_flat) {
                    ChestType::Crimson
                } else if reds.contains(&i_flat) {
                    ChestType::Red
                } else if grays.contains(&i_flat) {
                    ChestType::Gray
                } else if yellows.contains(&i_flat) {
                    ChestType::Yellow
                } else {
                    ChestType::Gold
                };
                runner.word_chests[j].push(WordChest::new(
		    ctx,
		    220.0 + i as f32*300.0 + j as f32*4.0, 100.0 + j as f32*180.0, color,
		    (*chosen_words[i_flat as usize]).into()
		));
            }
        }

        // assign specs for existing control pads
        for (n, client) in runner.clients.iter().enumerate() {
            targetlib::assign_spec(client,
                                   runner.get_cp_spec(n, client.w, client.h));
        }
	
        Ok(runner)
    }

    fn num_openned(&self, cc: ChestType) -> usize {
        let mut sum = 0;
        for row in &self.word_chests {
            for chest in row {
                if chest.openned.is_some() && chest.chest_type == cc {
                    sum += 1;
                }
            }
        }
        sum
    }


    fn end_game(&mut self, winner: Team) {
        self.winner = Some(winner);
        for row in &mut self.word_chests {
            for chest in row {
                chest.openned = Some(Team::A);
            }
        }
    }
    
    fn get_cp_spec(&self, ctlr_num: usize, w: u32, h: u32) -> CPSpec {
        let main_w = (w*8)/10;
        let plr_pnl_w = (w - main_w)/2;
        let btn_w = main_w/7;
        let btn_h = h/9;
        let x_space = (btn_w as f32 * (7.0 - 5.0)/6.0) as u32;
        let y_space = (btn_h as f32 * (9.0 - 5.0)/6.0) as u32;
        let mut buttons: Vec<Button> = vec![
        ];
        let team_color = match ctlr_num {
            0 => color_to_vec(team_color(Team::A)),
            1 => color_to_vec(team_color(Team::B)),
	    _ => [100, 100, 100, 255],
        };
        let mut panels: Vec<Panel> = vec![
            Panel::new(101,
                       0, 0, plr_pnl_w, h,
                       team_color),
            Panel::new(102,
                       w - plr_pnl_w, 0, plr_pnl_w, h,
                       team_color),
        ];
	// If game is over, provide button to exit back to launcher
	if self.winner != None {
            buttons.push(
                Button::new(99,
                            w - plr_pnl_w + 4, (h - plr_pnl_w)/2,
                            plr_pnl_w - 8, plr_pnl_w));
	}

	// buttons for number of guesses
	if self.guesses == 0 &&
	    (ctlr_num == 0 && self.now_team == Team::A ||
	     ctlr_num == 1 && self.now_team == Team::B) {
		for i in 0..4_u32 {
		    buttons.push(Button::new(
			201 + i, 
			8, h/6 + i*(plr_pnl_w + 4),
			plr_pnl_w - 16, plr_pnl_w - 16,
		    ));
		}
	}
	
        for j in 0..5_u32 {
            for i in 0..5_u32 {
                let chest = &self.word_chests[j as usize][i as usize];
		// chest face up
		if chest.openned.is_some() {
		    if ctlr_num < 2 {
			panels.push(Panel::new(
			    j*5 + i,
                            plr_pnl_w + x_space + i*(btn_w + x_space) + 20,
                            y_space + j*(btn_h + y_space) + 10,
                            btn_w - 40, btn_h - 20,
                            chestcolor_to_vec(&chest.chest_type)
			));
		    }
		// chest face down
		} else {
		    if ctlr_num < 2 {
			panels.push(Panel::new(
			    j*5 + i,
                            plr_pnl_w + x_space + i*(btn_w + x_space) - 10,
                            y_space + j*(btn_h + y_space) - 10,
                            btn_w + 20, btn_h + 20,
                            chestcolor_to_vec(&chest.chest_type)
			));
		    } else if self.guesses != 0{
			buttons.push(Button::new(
			    j*5 + i,
			    plr_pnl_w + x_space + i*(btn_w + x_space),
			    y_space + j*(btn_h + y_space),
			    btn_w, btn_h
			));
                    }
		}
            }
        }
        CPSpec::new(panels, buttons, vec![], vec![])
    }

    fn modify_health(&mut self, openning_team: Team, chest_type: ChestType) {
	let n = health_mod_of_chest_type(chest_type);
	match chest_type {
	    ChestType::Gold | ChestType::Yellow => {
		if openning_team == Team::A {
		    self.b_hearts.modify_health(-n);
		} else {
		    self.a_hearts.modify_health(-n);
		}
	    },
	    ChestType::Gray => (),
	    ChestType::Red | ChestType::Crimson | ChestType::Death => {
		if openning_team == Team::A {
		    self.a_hearts.modify_health(-n);
		} else {
		    self.b_hearts.modify_health(-n);
		}
	    },
	    ChestType::Heal => {
		if openning_team == Team::A {
		    self.a_hearts.modify_health(n);
		} else {
		    self.b_hearts.modify_health(n);
		}
	    },
        }

    }

}


impl EventHandler<ggez::GameError> for MyRunner {

    fn update(&mut self, ctx: &mut Context) -> GameResult<()> {

	self.a_hearts.update(ctx);
	self.b_hearts.update(ctx);
	
	let mut health_updates: Vec<(Team, ChestType)> = vec![];
	for row in &mut self.word_chests {
	    for mut chest in row {
		if let Some(q) = chest.update() {
		    health_updates.push(q);
		}
	    }
	}
	for (t, ct) in health_updates {
	    self.modify_health(t, ct);
	}
	
        let mut controller_change = false;
	let mut chest_value: Option<ChestType> = None;
	let mut guess_number = 0;

        for client in self.clients.iter() {
            for event in targetlib::get_events(&client) {
                match event.datum {
                    ControlDatum::Press => {
                        controller_change = true;
                        if event.element_id == 99 {
			    ggez::event::quit(ctx);
			    std::process::exit(0);
                        } else if event.element_id > 200 {
			    guess_number = 5 - (event.element_id - 200); // im so sorry
			    break;
			}
			let j = event.element_id as usize / 5;
                        let i = event.element_id as usize % 5;
                        self.word_chests[j][i].open(ctx, self.now_team);
			chest_value = Some(self.word_chests[j][i].chest_type);
                    }
                    _ => (),
                }
            }
        }

	if guess_number != 0 {
	    self.guesses = guess_number;
	}
	if let Some(cc) = chest_value {
	    if self.guesses == 0 {
		println!("WARNING: myrunner.guesses was 0 when a chest was chosen. Please debug.");
		return Ok(());
	    }
	    //self.update_hearts(ctx);
	    self.guesses -= 1;
	    if self.guesses == 0 {
		self.now_team = not_team(self.now_team);
	    }
	}

        if self.a_hearts.empty() {
            self.end_game(Team::B);
        }
        if self.b_hearts.empty() {
            self.end_game(Team::A);
        }
	
        if targetlib::clients_changed() || controller_change {
            self.clients = targetlib::get_client_info();
            // asign specs
            for (n, client) in self.clients.iter().enumerate() {
                targetlib::assign_spec(client,
                                       self.get_cp_spec(n, client.w, client.h));
            }
        }
        Ok(())
    }

    fn draw(&mut self, ctx: &mut Context) -> GameResult<()> {
	let p = Point{x:0.0, y:0.0};
	self.background.draw(ctx,p)?;
	
        // draw chests
	for row in &self.word_chests {
	    for chest in row {
		chest.draw(ctx)?;
	    }
	}

	// draw hearts
	self.a_hearts.draw(ctx)?;
	self.b_hearts.draw(ctx)?;
	    
        graphics::present(ctx)
    }

}
