use ggez::{Context, ContextBuilder, GameResult, conf};
use ggez::event::{self, EventHandler};
use ggez::graphics;
use ggez::graphics::Color;
use ggez::mint::Point2;
//use ggez::input::mouse::MouseButton;

use targetlib::{CPClient, CPSpec, Panel, Button, ControlDatum};//, Joystick};

use std::fs;
use rand::{seq::IteratorRandom, thread_rng};

use std::error::Error;
pub type Result<T> = std::result::Result<T, Box<dyn Error>>;

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
    my_window_mode.fullscreen_type = conf::FullscreenType::True;

    // Make a Context and an EventLoop.
    let (ctx, event_loop) =
       ContextBuilder::new("CodeWords", "weston")
	.window_setup(my_window_settings)
	.window_mode(my_window_mode)
        .build()
        .unwrap();

    // Create an instance of your event handler.
    // Usually, you should provide it with the Context object
    // so it can load resources like images during setup.
    let my_runner = match MyRunner::new() {
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
enum CardColor {
    Gold,
    Yellow,
    Gray,
    Red,
    Crimson,
    Death,
    Heal,
}

fn opposite_color(cc: &CardColor) -> CardColor {
    match cc {
        CardColor::Crimson  => CardColor::Gold,
        CardColor::Red => CardColor::Yellow,
        _ => panic!("No opposite of {:?}", cc),
    }
}

fn cardcolor_to_vec(cc: &CardColor) -> [u8; 4] {
    match cc {
        /*
	CardColor::Gold    => [240, 200, 50,  255],
        CardColor::Yellow  => [220, 220, 150, 255],
        CardColor::Gray    => [180, 170, 160, 255],
        CardColor::Red     => [220, 120, 120, 255],
        CardColor::Crimson => [200, 40,  40,  255],
        CardColor::Death   => [80,  80,  80,  255],
        CardColor::Heal    => [30,  220, 100, 255],
	*/
	CardColor::Gold    => [40, 200, 30,  255],
        CardColor::Yellow  => [170, 210, 170, 255],
        CardColor::Gray    => [210, 210, 220, 255],
        CardColor::Red     => [210, 170, 170, 255],
        CardColor::Crimson => [230, 40,  40, 255],
        CardColor::Death   => [80,  80,  80,  255],
        CardColor::Heal    => [30,  120, 220, 255],
    }
}

fn cardcolor_to_color(cc: &CardColor) -> Color {
    let v = cardcolor_to_vec(cc);
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

struct WordCard {
    word: String,
    // TODO: text_graphic so we dont render each frame
    color: CardColor,
    flipped: bool,
}
impl WordCard {

    fn draw(&self, ctx: &mut Context, x: f32, y: f32, w: f32, h: f32) -> GameResult<()> {
        // determine exact colors for the card
        // TODO
	/*let (c1, c2, c3) = if self.flipped {
            match self.color {
                CardColor::Neutral =>
                    (Color::new(0.75, 0.75, 0.75, 1.0),
                     //Color::new(0.45, 0.5, 0.4, 1.0),
                     Color::new(0.85, 0.85, 0.85, 1.0),
                     Color::new(0.85, 0.85, 0.85, 1.0)),
                CardColor::Blue =>
                    (Color::new(0.6, 0.6, 0.8, 1.0),
                     //Color::new(0.35, 0.35, 0.55, 1.0),
                     Color::new(0.7, 0.7, 0.85, 1.0),
                     Color::new(0.7, 0.7, 0.85, 1.0)),
                CardColor::Red =>
                    (Color::new(0.8, 0.6, 0.6, 1.0),
                     //Color::new(0.55, 0.35, 0.35, 1.0),
                     Color::new(0.85, 0.7, 0.7, 1.0),
                     Color::new(0.85, 0.7, 0.7, 1.0)),
                CardColor::Death =>
                    (Color::new(0.4, 0.4, 0.4, 1.0),
                     //Color::new(0.1, 0.1, 0.1, 1.0),
                     Color::new(0.5, 0.5, 0.5, 1.0),
                     Color::new(0.5, 0.5, 0.5, 1.0)),
            }
        } else {
            (Color::new(0.8, 0.7, 0.6, 1.0),
             Color::new(0.6, 0.5, 0.2, 1.0),
             Color::new(0.9, 0.8, 0.7, 1.0),)
        };
	 */
	let c1 = if self.flipped {
	    cardcolor_to_color(&self.color)
	} else {
	    Color::new(0.9, 0.8, 0.7, 1.0)
	};
	let c2 = if self.flipped {
	    Color::new(0.3, 0.3, 0.3, 1.0)
	} else {
	    Color::new(0.1, 0.1, 0.1, 1.0)
	};

        macro_rules! ezdraw {
            ($a:expr) => {
                graphics::draw(ctx, & $a,  (Point2{x:0.0, y:0.0},))?
            }
        }
        macro_rules! ezdrawxy {
            ($a:expr, $x:expr, $y:expr) => {
                graphics::draw(ctx, & $a,  (Point2{x:$x, y:$y},))?
            }
        }
        
        // draw rects
        let r1 = graphics::Mesh::new_rounded_rectangle(
            ctx,
            graphics::DrawMode::fill(),
            graphics::Rect::new(x, y, w, h),
            h/10.0,
            c1,
        )?;
        let r2 = graphics::Mesh::new_rounded_rectangle(
            ctx,
            graphics::DrawMode::fill(),
            graphics::Rect::new(x+5.0, y+5.0, w-10.0, h-10.0),
            h/10.0,
            c2,
        )?;
        let r3 = graphics::Mesh::new_rounded_rectangle(
            ctx,
            graphics::DrawMode::fill(),
            graphics::Rect::new(x+7.0, y+7.0, w-14.0, h-14.0),
            h/10.0,
            c1,
        )?;        
        ezdraw!(r1); ezdraw!(r2); ezdraw!(r3);

        // draw text
        let (text_scale, mut text_color) = match self.flipped {
            true => (w/9.0, Color::new(0.05, 0.05, 0.05, 1.0)),
            false => (w/6.0, Color::new(0.05, 0.05, 0.05, 1.0)),
        };
        if let CardColor::Death = self.color {
            if self.flipped == true {
                text_color = Color::new(1.0, 1.0, 1.0, 1.0);
            }
        }
        let text = graphics::Text::new(graphics::TextFragment {
            text: self.word.clone(),
            color: Some(text_color),
            font: Some(graphics::Font::default()),
            scale: Some(graphics::PxScale::from(text_scale)),
        });
        let dims = text.dimensions(ctx);
        let (text_x, text_y) = match self.flipped {
            true => (x + w*0.10,
                     y + h*0.68,
            ),
            false => (x + (w - dims.w)/2.0,
                      y + (h - dims.h)/2.0,
            ),
        };
        ezdrawxy!(text, text_x, text_y);
        // done
        Ok(())
    }
}

struct MyRunner {
    clients: Vec<CPClient>,
    word_cards: Vec<Vec<WordCard>>,
    now_team: Team,
    guesses: u32,
    winner: Option<Team>,
    a_health: i32,
    b_health: i32,
}

impl MyRunner {
    fn new() -> Result<Self> {
        // errs when cant read file
        let s = fs::read_to_string("/home/requin/rqn/words/game_words.txt")?;
        let all_words_ = s.split("\n").collect::<Vec<&str>>(); 
        let all_words = all_words_[..all_words_.len()-1].iter(); // always a newline at the end so last element is empty
        let mut rng = thread_rng();
        let chosen_words = all_words.choose_multiple(&mut rng, 25);
        let mut runner = MyRunner {
            clients: targetlib::get_client_info(),
            word_cards: Vec::new(),
            now_team: Team::A,
	    guesses: 0,
            winner: None,
	    a_health: 10,
	    b_health: 12,
        };

        // randomly choose card colors
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
	
        // initiate cards
        for j in 0..5 {
            runner.word_cards.push(Vec::new());
            for i in 0..5 {
                let i_flat = j*5 + i;
                let color = if heals.contains(&i_flat) {
                    CardColor::Heal
                } else if deaths.contains(&i_flat) {
                    CardColor::Death
                } else if crimsons.contains(&i_flat) {
                    CardColor::Crimson
                } else if reds.contains(&i_flat) {
                    CardColor::Red
                } else if grays.contains(&i_flat) {
                    CardColor::Gray
                } else if yellows.contains(&i_flat) {
                    CardColor::Yellow
                } else {
                    CardColor::Gold
                };
                runner.word_cards[j].push(WordCard {
                    word: (*chosen_words[i_flat as usize]).into(),
                    color: color,
                    flipped: false,
                });
            }
        }

        // assign specs for existing control pads
        for (n, client) in runner.clients.iter().enumerate() {
            targetlib::assign_spec(client,
                                   runner.get_cp_spec(n, client.w, client.h));
        }
	
        Ok(runner)
    }

    fn num_flipped(&self, cc: CardColor) -> usize {
        let mut sum = 0;
        for row in &self.word_cards {
            for card in row {
                if card.flipped && card.color == cc {
                    sum += 1;
                }
            }
        }
        sum
    }


    fn end_game(&mut self, winner: Team) {
        self.winner = Some(winner);
        for row in &mut self.word_cards {
            for card in row {
                card.flipped = true;
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
                let card = &self.word_cards[j as usize][i as usize];
		// card face up
		if card.flipped {
		    if ctlr_num < 2 {
			panels.push(Panel::new(
			    j*5 + i,
                            plr_pnl_w + x_space + i*(btn_w + x_space) + 20,
                            y_space + j*(btn_h + y_space) + 10,
                            btn_w - 40, btn_h - 20,
                            cardcolor_to_vec(&card.color)
			));
		    }
		// card face down
		} else {
		    if ctlr_num < 2 {
			panels.push(Panel::new(
			    j*5 + i,
                            plr_pnl_w + x_space + i*(btn_w + x_space) - 10,
                            y_space + j*(btn_h + y_space) - 10,
                            btn_w + 20, btn_h + 20,
                            cardcolor_to_vec(&card.color)
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
    
}


impl EventHandler<ggez::GameError> for MyRunner {

    fn update(&mut self, ctx: &mut Context) -> GameResult<()> {
        let mut controller_change = false;
	let mut card_value: Option<CardColor> = None;
	let mut guess_number = 0;
        //let mut end_game: Option<CardColor> = None;
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
                        self.word_cards[j][i].flipped = true;
			card_value = Some(self.word_cards[j][i].color);
                    }
                    _ => (),
                }
            }
        }
	// FYI if you're reading this then I'm sorry the code in this file is so bad.
	// I'll separate out functions later.
	if guess_number != 0 {
	    self.guesses = guess_number;
	}
	if let Some(cc) = card_value {
	    match cc {
		CardColor::Gold => {
		    if self.now_team == Team::A {
			self.b_health -= 2;
		    } else {
			self.a_health -= 2;
		    }
		},
		CardColor::Yellow => {
		    if self.now_team == Team::A {
			self.b_health -= 1;
		    } else {
			self.a_health -= 1;
		    }
		},
		CardColor::Gray => (),
		CardColor::Red => {
		    if self.now_team == Team::A {
			self.a_health -= 1;
		    } else {
			self.b_health -= 1;
		    }
		},
		CardColor::Crimson => {
		    if self.now_team == Team::A {
			self.a_health -= 2;
		    } else {
			self.b_health -= 2;
		    }
		},
		CardColor::Death => {
		    if self.now_team == Team::A {
			self.a_health -= 5;
		    } else {
			self.b_health -= 5;
		    }
		},
		CardColor::Heal => {
		    if self.now_team == Team::A {
			self.a_health += 3;
		    } else {
			self.b_health += 3;
		    }
		},
            }
	    self.guesses -= 1;
	    if self.guesses == 0 {
		self.now_team = not_team(self.now_team);
	    } else if self.guesses < 0 {
		panic!("negative guesses");
	    }
	}

        if self.a_health <= 0 {
            self.end_game(Team::B);
        }
        if self.b_health <= 0 {
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
        macro_rules! ezdraw {
            ($a:expr) => {
                graphics::draw(ctx, & $a,  (Point2{x:0.0, y:0.0},))?
            }
        }
        macro_rules! ezdrawxy {
            ($a:expr, $x:expr, $y:expr) => {
                graphics::draw(ctx, & $a,  (Point2{x:$x, y:$y},))?
            }
        }
        graphics::clear(ctx, Color::WHITE); 
    
        // determine dimensions of different areas
        let (sw, sh) = (START_WIDTH, START_HEIGHT);//self.size;
        let prompt_area_h = sh/10.0;
	let prompt_h = prompt_area_h/2.0;
        let prompt_area_w = sw;
	let health_area_w = sw/12.0;
	let lower_pad_h = sh/20.0;
        let card_area_w = sw - 2.0*health_area_w;
        let card_area_h = sh - prompt_area_h - lower_pad_h;
        let card_area_x = health_area_w;
        let card_area_y = prompt_area_h;
	let health_area_h = card_area_h;

        // if game over, draw end game prompt
        if let Some(w_team) = &self.winner {
            let text_win = graphics::Text::new(graphics::TextFragment {
                text: format!("{} Team Wins!", team_name(*w_team)),
                color: Some(Color::BLACK),
                font: Some(graphics::Font::default()),
                scale: Some(graphics::PxScale::from(prompt_h/0.9)),
            });
            let dims_win = text_win.dimensions(ctx);
            let text_x_win = (prompt_area_w - dims_win.w)/2.0;
            let text_y_win = prompt_h/5.0;
            let r = graphics::Mesh::new_rounded_rectangle( // draw current turn color box
                ctx,
                graphics::DrawMode::fill(),
                graphics::Rect::new(text_x_win - 4.0, text_y_win - 4.0,
                                    dims_win.w + 8.0, dims_win.h + 5.0),
                4.0,
                team_color(*w_team),
            )?;        
            ezdraw!(r);
            ezdrawxy!(text_win, text_x_win, text_y_win);
        }

        // draw prompt text
        else if self.guesses != 0 {
            let text_1 = graphics::Text::new(graphics::TextFragment {
                text: format!("{} team's turn to guess ({})",
			      team_name(self.now_team), self.guesses),
                color: Some(Color::BLACK),
                font: Some(graphics::Font::default()),
                scale: Some(graphics::PxScale::from(prompt_h/1.1)),
            });
            let dims_1 = text_1.dimensions(ctx);
            let text_x_1 = (prompt_area_w - dims_1.w)/2.0;
            let text_y_1 = prompt_h/5.0;
            let r = graphics::Mesh::new_rounded_rectangle( // draw current turn color box
                ctx,
                graphics::DrawMode::fill(),
                graphics::Rect::new(text_x_1 - 4.0, text_y_1 - 4.0, dims_1.w + 8.0, dims_1.h + 5.0),
                4.0,
                team_color(self.now_team),
            )?;        
            ezdraw!(r);
            ezdrawxy!(text_1, text_x_1, text_y_1);
	    
            let text_2 = graphics::Text::new(graphics::TextFragment {
                text: format!("{} team's Clue Giver must touch the button \
                               corresponding to {} team's guess",
                              team_name(not_team(self.now_team)), team_name(self.now_team)),
                color: Some(Color::BLACK),
                font: Some(graphics::Font::default()),
                scale: Some(graphics::PxScale::from(prompt_h/1.8)),
            });
            let dims_2 = text_2.dimensions(ctx);
            let text_x_2 = (prompt_area_w - dims_2.w)/2.0;
            let text_y_2 = text_y_1 + dims_1.h + prompt_h/10.0;
            ezdrawxy!(text_2, text_x_2, text_y_2);
        }
    
	// display team's health
	let a_health_size = 0.8 + (self.a_health as f32)/10.0;
        let text_a_health = graphics::Text::new(graphics::TextFragment {
            text: format!("{}", self.a_health),
            color: Some(Color::BLACK),
            font: Some(graphics::Font::default()),
            scale: Some(graphics::PxScale::from(prompt_h*a_health_size)),
        });
	let dims_a = text_a_health.dimensions(ctx);
	let a_health_x = (health_area_w - dims_a.w)/2.0;
	let a_health_y = (health_area_h - dims_a.h)/2.0;
        let ra = graphics::Mesh::new_rounded_rectangle( // draw health box
            ctx,
            graphics::DrawMode::fill(),
            graphics::Rect::new(a_health_x - 4.0, a_health_y - 4.0,
				dims_a.w + 8.0, dims_a.h + 5.0),
            4.0,
	    Color::new(0.85, 0.65, 0.4, 1.0),
        )?;        
        ezdraw!(ra);
	ezdrawxy!(text_a_health, a_health_x, a_health_y);
	let b_health_size = 0.8 + (self.b_health as f32)/10.0;
        let text_b_health = graphics::Text::new(graphics::TextFragment {
            text: format!("{}", self.b_health),
            color: Some(Color::BLACK),
            font: Some(graphics::Font::default()),
            scale: Some(graphics::PxScale::from(prompt_h*b_health_size)),
        });
	let dims_b = text_b_health.dimensions(ctx);
    	let b_health_x = health_area_w + card_area_w + (health_area_w - dims_b.w)/2.0;
	let b_health_y = (health_area_h - dims_b.h)/2.0;
        let rb = graphics::Mesh::new_rounded_rectangle( // draw health box
            ctx,
            graphics::DrawMode::fill(),
            graphics::Rect::new(b_health_x - 4.0, b_health_y - 4.0,
				dims_b.w + 8.0, dims_b.h + 5.0),
            4.0,
	    Color::new(0.65, 0.4, 0.8, 1.0),
	)?;
        ezdraw!(rb);
	ezdrawxy!(text_b_health, b_health_x, b_health_y);
    
        // draw cards
        for (j, card_row) in self.word_cards.iter().enumerate() {
            for (i, card) in card_row.iter().enumerate() {
                /*let mut texty = graphics::Text::new(&card.word[..]);
                texty.set_font(graphics::Font::default(), graphics::PxScale::from(24.0));
                let params = graphics::DrawParam::default()
                    .dest([50.0 + (i as f32)*100.0, 50.0 + (j as f32)*100.0]);
                graphics::draw(ctx, &texty, params)?;
                ezdrawxy!(texty, 100.0 + (i as f32)*180.0, 50.0 + (j as f32)*160.0);
                 */
                let card_w = card_area_w/6.0;
                let card_h = card_area_h/7.0;
                let x_space = card_w * (6.0 - 5.0)/4.0;
                let y_space = card_h * (7.0 - 5.0)/4.0;
                card.draw(ctx,
                          card_area_x + (i as f32)*(card_w+x_space),
                          card_area_y + (j as f32)*(card_h+y_space),
                          card_w, card_h
                )?;
            }
        }
  
        graphics::present(ctx)
}

}
