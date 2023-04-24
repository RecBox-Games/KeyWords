//==================================<===|===>=================================//
use std::collections::HashMap;
use crate::sprite::*;
use crate::state::*;
use crate::utility::*;
use ggez::{Context, GameResult};
use ggez::graphics::{Rect, Color};

//================================= Constants ================================//
const SPARKLE_OFFSET: Point = Point{x:386.0, y:40.0};
const FONT_SIZE_WORDS: f32 = 36.0;
const COLOR_WORDS: Color = Color::new(0.9, 0.8, 0.7, 1.0);
const COLOR_DARK_WORDS: Color = Color::new(0.10, 0.05, 0.03, 1.0);
const CHEST_WORD_OFFSET_Y: f32 = 40.0;
// Scale
const SCALE_CONTENTS: f32 = 6.0;
const SCALE_HEART_X: f32 = 6.0;
const SCALE_HEART_Y: f32 = 6.0;
const SCALE_CHEST_X: f32 = 7.5;
const SCALE_CHEST_Y: f32 = 6.0;
const SCALE_SPARKLE_X: f32 = 4.0;
const SCALE_SPARKLE_Y: f32 = 4.0;
const SCALE_NOTIFYBOX_X: f32 = 2.5;
const SCALE_NOTIFYBOX_Y: f32 = 2.5;
// Chest Placement
const CHESTS_START_X: f32 = 86.0;
const CHESTS_SPACING_X: f32 = 352.0;
const CHESTS_START_Y: f32 = 80.0;
const CHESTS_SPACING_Y: f32 = 186.0;
const CHESTS_VERTICAL_OFFSET_FACTOR: f32 = 2.0;
// Chest Fall
const CHESTS_DROP_HEIGHT_BASE: f32 = -600.0;
const CHESTS_DROP_ROW_DIFFERENCE: f32 = 40.0;
const SIMULTANEOUS_FALLS: usize = 6;
// Hearts
const HEARTS_START_X: f32 = 6.0;
const HEARTS_SPACING_X: f32 = 80.0;
const HEARTS_START_Y: f32 = 2.0;
const HEARTS_DROP_HEIGHT: f32 = -70.0;
// Chest Opening
const CENTER_CHEST_SCALE: Point = Point{x: 3.0, y:3.0};
const CONTENTS_X: f32 = SCREEN_WIDTH/2.0;
const CONTENTS_Y: f32 = 370.0;
const CONTENTS_SPACING_X: f32 = 100.0;


type GR = GameResult<()>;
type Ctx<'a> = &'a mut Context;

//================================= Graphical ================================//
// the members of Graphical are assets used when drawing a representation of
// the game state
pub struct Graphical {
    background: SpriteElem,
    title: SpriteElem,
    sparkle: SpriteElem,
    // chests
    chest: SpriteElem,
    word_meshes: HashMap<String, TextElem>,
    // hearts
    heart_red: SpriteElem,
    heart_blue: SpriteElem,
    // notification
    notify_box: SpriteElem,
    // chest contents
    sword: SpriteElem,
    bomb: SpriteElem,
    heal: SpriteElem,
}

impl Graphical {
    pub fn new(ctx: &mut Context) -> Self {
        Graphical {
            background: SpriteElem::new(ctx, 4.0, 4.0,
                                        "/keywords_background.png"),
            title: SpriteElem::new(ctx, 10.0, 10.0, "/title.png"),
            sparkle: new_sparkle(ctx),
            chest: new_chest(ctx),
            word_meshes: HashMap::new(),
            heart_red: new_heart(ctx, vec![0, 1, 2, 3, 4], true),
            heart_blue: new_heart(ctx, vec![0, 1, 2, 3, 4], false),
            notify_box: new_notify_box(ctx),
            sword: SpriteElem::new(ctx, SCALE_CONTENTS, SCALE_CONTENTS, "/sword.png"),
            bomb: SpriteElem::new(ctx, SCALE_CONTENTS, SCALE_CONTENTS, "/bomb.png"),
            heal: SpriteElem::new(ctx, SCALE_CONTENTS, SCALE_CONTENTS, "/heal.png"),
        }
    }

    pub fn draw(&mut self, ctx: Ctx, state: &StateManager) -> GR {
	let p = Point{x:0.0, y:0.0};
	self.background.draw(ctx,p)?;
        match &state.game_state {
            GameState::Intro(IntroState::Title(prg)) => {
                self.draw_intro_title(ctx, prg)?;
            }
            GameState::Intro(IntroState::TutNotify(tutnotify_state)) => {
                self.draw_intro_tut_drop(ctx, &tutnotify_state)?;
            }
            GameState::Intro(IntroState::ChestFall(prg)) => {
                self.draw_intro_chestfall(ctx, prg, &state.chest_states)?;
            }
            GameState::Playing(playing_state) => {
                self.draw_playing(ctx, &state.chest_states, &playing_state)?;
            }
            //_ => (),
        }
        //
        Ok(())
    }

//        ======================== Draw Intro ========================        //
    fn draw_intro_title(&mut self, ctx: Ctx, progress: &Progress) -> GR {
        let prg = progress.as_decimal();
	let p1 = Point{x:400.0, y:-500.0};
	let p2 = Point{x:400.0, y:340.0};
	let p3 = Point{x:400.0, y:1100.0};
        //
        let t1 = 0.35;
        let t2 = 0.40;
        let t3 = 0.25;
        let tbuf = 0.15;
        //
        let p = if prg < t1 {
            let sub_prg = prg/t1;
            interpolate(p1, p2, Interpolation::RoundEnd, sub_prg)
        } else if prg < t1+t2 {
            p2
        } else {
            let sub_prg = (prg-t1-t2)/t3;
            interpolate(p2, p3, Interpolation::RoundStart, sub_prg)
        };
	self.title.draw(ctx,p)?;
        if prg > t1+tbuf && prg < t1+t2-tbuf {
            let sub_prg = (prg-t1-tbuf)/(t2-tbuf*2.0);
            let sparkle_p = p2.plus(SPARKLE_OFFSET);
            self.sparkle.animate(ctx, sparkle_p, sub_prg)?;
        }
        //
        Ok(())
    }

    fn draw_intro_tut_drop(&mut self, ctx: Ctx, tutnotify_state: &TutNotifyState) -> GR {
        let x = 220.0;
        let p1 = Point {x, y: -1000.0};
        let p2 = Point {x, y: 100.0};
        let p3 = Point {x, y: 1100.0};
        match tutnotify_state {
            TutNotifyState::DropIn(prg) => {
                let p = interpolate(p1, p2, Interpolation::RoundEnd, prg.as_decimal());
                self.notify_box.draw(ctx, p)?;
            }
            TutNotifyState::In => {
                self.notify_box.draw(ctx, p2)?;
            }
            TutNotifyState::DropOut(prg) => {
                let p = interpolate(p2, p3, Interpolation::RoundStart, prg.as_decimal());
                self.notify_box.draw(ctx, p)?;
            }
        }
        //
        Ok(())
    }
    
    fn draw_intro_chestfall(&mut self, ctx: Ctx, progress: &Progress,
                            chest_states: &Vec<Vec<ChestState>>) -> GR {
        self.draw_hearts_forming(ctx, progress.as_decimal())?;
        self.draw_chests_falling(ctx, progress.as_decimal(), chest_states)?;
        //
        Ok(())
    }

    fn draw_chests_falling(&mut self, ctx: Ctx, prg: f32,
                            chest_states: &Vec<Vec<ChestState>>) -> GR {
        let num_chests = ROWS*COLUMNS;
        let time_slices = num_chests + SIMULTANEOUS_FALLS + 6;
        let slice_len = 1.0 / time_slices as f32;
        let nth_chest = (prg * time_slices as f32) as usize; // the index of the last chest that has started to fall
        // draw chests that have already landed
        let next_to_land = if SIMULTANEOUS_FALLS > nth_chest {
            0} else {nth_chest - SIMULTANEOUS_FALLS};
        for k in 0..next_to_land.min(num_chests) {
            let j = k/COLUMNS;  let i = k%COLUMNS;
            //
            let destination = Point {
                x: CHESTS_START_X + CHESTS_SPACING_X*(i as f32),
                y: CHESTS_START_Y + CHESTS_SPACING_Y*(j as f32) + CHESTS_VERTICAL_OFFSET_FACTOR*(i as f32),
            };
            self.draw_chest(ctx, destination, &chest_states[j][i])?;
        }
        // draw chests that are still falling
        for k in next_to_land..nth_chest.min(num_chests) {
            let j = k/COLUMNS;  let i = k%COLUMNS;
            //
            let prg_fall_start = (k + 1) as f32 * slice_len;
            let fall_duration = slice_len * SIMULTANEOUS_FALLS as f32;
            let sub_prg = (prg - prg_fall_start)/fall_duration;
            let destination = Point {
                x: CHESTS_START_X + CHESTS_SPACING_X*(i as f32),
                y: CHESTS_START_Y + CHESTS_SPACING_Y*(j as f32) + CHESTS_VERTICAL_OFFSET_FACTOR*(i as f32),
            };
            let start = Point {
                x: CHESTS_START_X + CHESTS_SPACING_X*(i as f32),
                y: CHESTS_DROP_HEIGHT_BASE + CHESTS_DROP_ROW_DIFFERENCE*(j as f32),
            };
            let location = interpolate(start, destination, Interpolation::Accelerate, sub_prg);
            self.draw_chest(ctx, location, &chest_states[j][i])?;
        }
        //
        Ok(())
    }

    fn draw_hearts_forming(&mut self, ctx: Ctx, prg: f32) -> GR {
        let time_slices = MAX_HEALTH_RED.max(MAX_HEALTH_BLUE) + 2;
        let slice_len = 1.0 / time_slices as f32;
        let nth_heart = (prg * time_slices as f32) as usize; // the index of the currently dropping heart
        // red hearts that have landed
        for i in 0..nth_heart.min(MAX_HEALTH_RED) {
            let destination = self.get_heart_location(Team::Red, i);
            let formations_since_i = (prg - ((i+1) as f32)*slice_len)/slice_len;
            let formation_prg = (formations_since_i-1.0).max(0.0).min(0.99);
            self.heart_red.animate(ctx, destination, 0.99-formation_prg)?;
        }
        // dropping red heart
        if nth_heart < MAX_HEALTH_RED {
            let sub_prg = (prg - (nth_heart as f32)*slice_len)/slice_len;
            let destination = self.get_heart_location(Team::Red, nth_heart);
            let start = destination.minus(Point{x:0.0, y:HEARTS_DROP_HEIGHT});
            let location = interpolate(start, destination, Interpolation::RoundEnd, sub_prg);
            self.heart_red.animate(ctx, location, 0.99)?;
        }
        // blue hearts that have landed
        for i in 0..nth_heart.min(MAX_HEALTH_BLUE) {
            let destination = self.get_heart_location(Team::Blue, i);
            let formations_since_i = (prg - ((i+1) as f32)*slice_len)/slice_len;
            let formation_prg = (formations_since_i-1.0).max(0.0).min(0.99);
            self.heart_blue.animate(ctx, destination, 0.99-formation_prg)?;
        }
        // dropping blue heart
        if nth_heart < MAX_HEALTH_BLUE {
            let sub_prg = (prg - (nth_heart as f32)*slice_len)/slice_len;
            let destination = self.get_heart_location(Team::Blue, nth_heart);
            let start = destination.minus(Point{x:0.0, y:HEARTS_DROP_HEIGHT});
            let location = interpolate(start, destination, Interpolation::RoundEnd, sub_prg);
            self.heart_blue.animate(ctx, location, 0.99)?;
        }
        //
        Ok(())
    }
    
//        ======================= Draw Playing =======================        //
    fn draw_playing(&mut self, ctx: Ctx, chest_states: &Vec<Vec<ChestState>>,
                    playing_state: &PlayingState) -> GR {
        self.draw_static_chests(ctx, chest_states)?;
        self.draw_opening_chests(ctx, chest_states)?;
        self.draw_health(ctx, &playing_state.red_health_state, &playing_state.blue_health_state )?;
        if let Some(deploying_state) = get_deploying_state(chest_states) {
            self.draw_deploying(ctx, deploying_state, playing_state.current_team(),
                                playing_state.red_health(), playing_state.blue_health())?;
        }
        Ok(())
    }

    fn draw_health(&mut self, ctx: Ctx, red_health: &HealthState, blue_health: &HealthState) -> GR {
        // red
        for i in 0..MAX_HEALTH_RED {
            let p = self.get_heart_location(Team::Red, i);
            let prg = if i < red_health.src_amount {
                0.0
            } else if i == red_health.src_amount {
                0.99 - red_health.fraction()
            } else {
                0.99
            };
            self.heart_red.animate(ctx, p, prg)?;            
        }
        //blue
        for i in 0..MAX_HEALTH_BLUE {
            let p = self.get_heart_location(Team::Blue, i);
            let prg = if i < blue_health.src_amount {
                0.0
            } else if i == blue_health.src_amount {
                0.99 - blue_health.fraction()
            } else {
                0.99
            };
            self.heart_blue.animate(ctx, p, prg)?;            
        }
        //
        Ok(())
    }
    
    fn draw_static_chests(&mut self, ctx: Ctx,
                   chest_states: &Vec<Vec<ChestState>>) -> GR {
        for j in 0..ROWS {
            for i in 0..COLUMNS {
                let chest_state = &chest_states[j][i];
                if chest_state.is_static() {
                    let destination = Point {
                        x: CHESTS_START_X + CHESTS_SPACING_X*(i as f32),
                        y: CHESTS_START_Y + CHESTS_SPACING_Y*(j as f32) + CHESTS_VERTICAL_OFFSET_FACTOR*(i as f32),
                    };
                    self.draw_chest(ctx, destination, chest_state)?;
                }
            }
        }
        Ok(())
    }
    
    fn draw_opening_chests(&mut self, ctx: Ctx,
                   chest_states: &Vec<Vec<ChestState>>) -> GR {
        for j in 0..ROWS {
            for i in 0..COLUMNS {
                let chest_state = &chest_states[j][i];
                if ! chest_state.is_static() {
                    let destination = Point {
                        x: CHESTS_START_X + CHESTS_SPACING_X*(i as f32),
                        y: CHESTS_START_Y + CHESTS_SPACING_Y*(j as f32) + CHESTS_VERTICAL_OFFSET_FACTOR*(i as f32),
                    };
                    self.draw_chest(ctx, destination, chest_state)?;
                }
            }
        }
        Ok(())
    }
    
    fn draw_chest(&mut self, ctx: Ctx, point: Point, chest_state: &ChestState) -> GR {
        let center_chest_point = Point {
            x: (SCREEN_WIDTH - self.chest.width()*CENTER_CHEST_SCALE.x)/2.0,
            y: (SCREEN_HEIGHT - self.chest.height()*CENTER_CHEST_SCALE.y)/2.0,
        };
        let word = &chest_state.word;
        // chest
        match &chest_state.opening_state {
            OpeningState::Closed => {
                self.draw_chest_scaled(ctx, point, Point{x:1.0, y:1.0}, word,
                                       COLOR_WORDS, 0.0)?;
            }
            OpeningState::Growing(prg) => {
                let p = interpolate(point, center_chest_point,
                                    Interpolation::Linear, prg.as_decimal());
                let s = interpolate(Point{x:1.0, y:1.0}, CENTER_CHEST_SCALE,
                                    Interpolation::RoundEnd, prg.as_decimal());
                self.draw_chest_scaled(ctx, p, s, word, COLOR_WORDS, 0.0)?; 
            }
            OpeningState::Opening(prg) => {
                self.draw_chest_scaled(ctx, center_chest_point,
                                       CENTER_CHEST_SCALE, word, COLOR_WORDS,
                                       prg.as_decimal())?;
            }
            OpeningState::Deploying(_) => {
                self.draw_chest_scaled(ctx, center_chest_point,
                                       CENTER_CHEST_SCALE, word, COLOR_WORDS,
                                       0.99)?;
            }
            OpeningState::Shrinking(prg) => {
                let p = interpolate(center_chest_point, point,
                                    Interpolation::Linear, prg.as_decimal());
                let s = interpolate(CENTER_CHEST_SCALE, Point{x:1.0, y:1.0},
                                    Interpolation::RoundStart, prg.as_decimal());
                self.draw_chest_scaled(ctx, p, s, word, COLOR_WORDS, 0.99)?;
            }
            OpeningState::Open => {
                self.draw_chest_scaled(ctx, point, Point{x:1.0, y:1.0}, word, COLOR_DARK_WORDS, 0.99)?;
            }
        }
        //
        Ok(())
    }

    fn draw_chest_scaled(&mut self, ctx: Ctx, point: Point, scale: Point,
                         word: &str, word_color: Color, prg: f32) -> GR {
        self.chest.animate_scaled(ctx, point, scale, prg)?;
        // word
        let word_mesh_width = self.get_word_mesh(word).width(ctx);
        let offset_x = self.chest.width()*0.05 +
            (self.chest.width() - word_mesh_width)/2.0;
        let offset_y = self.chest.height() - CHEST_WORD_OFFSET_Y;
        let offset = Point{x:offset_x*scale.x, y:offset_y*scale.y};
        self.get_word_mesh(word).draw_scaled(ctx, word_color, point.plus(offset), scale)?;
        //
        Ok(())
    }

    fn draw_deploying(&mut self, ctx: Ctx, deploying_state: &DeployingState,
                      team: Team, red_health: usize, blue_health: usize) -> GR {
        let base_p = Point{x:CONTENTS_X, y:CONTENTS_Y};
        let offset = Point{x:-CONTENTS_SPACING_X, y:0.0}
        .scale(deploying_state.total_projectiles as f32 / 2.0);
        let first_p = base_p.plus(offset);
        let spacing = Point{x:CONTENTS_SPACING_X, y:0.0};
        for i in 0..deploying_state.projectiles.len() {
            let projectile = &deploying_state.projectiles[i];
            let start_p = first_p.plus(spacing.scale(i as f32));
            match projectile {
                Projectile::Sword => {
                    let p = if i == deploying_state.projectiles.len() - 1 {
                        let heart_index = match team.opposite() {
                            Team::Red => red_health - 1,
                            Team::Blue => blue_health - 1,
                        };
                        let end_p = self.get_heart_location(team.opposite(), heart_index);
                        interpolate(start_p, end_p, Interpolation::Accelerate,
                                    deploying_state.current_projectile_progress.as_decimal())
                    } else {
                        start_p
                    };
                    self.sword.draw(ctx, p)?;
                }
                Projectile::Bomb => {
                    let p = if i == deploying_state.projectiles.len() - 1 {
                        let heart_index = match team {
                            Team::Red => red_health - 1,
                            Team::Blue => blue_health - 1,
                        };
                        let end_p = self.get_heart_location(team, heart_index);
                        interpolate(start_p, end_p, Interpolation::RoundEnd,
                                    deploying_state.current_projectile_progress.as_decimal())
                    } else {
                        start_p
                    };
                    self.bomb.draw(ctx, p)?;

                }
                Projectile::Heart => {
                    let p = if i == deploying_state.projectiles.len() - 1 {
                        let heart_index = match team {
                            Team::Red => red_health,
                            Team::Blue => blue_health,
                        };
                        let end_p = self.get_heart_location(team, heart_index);
                        interpolate(start_p, end_p, Interpolation::RoundEnd,
                                    deploying_state.current_projectile_progress.as_decimal())
                    } else {
                        start_p
                    };
                    self.heal.draw(ctx, p)?;
                }
            }
        }
        //
        Ok(())
    }

//        =================== Graphical Helpers ======================        //
    fn get_word_mesh(&mut self, word: &str) -> &mut TextElem {
        if ! self.word_meshes.contains_key(word) {
            self.word_meshes.insert(
                word.to_string(), // key
                new_text_elem(    // value
                    word.to_string(),
                    FONT_SIZE_WORDS,
                )
            );
        }
        self.word_meshes.get_mut(word).unwrap()
    }

    fn get_heart_location(&self, team: Team, i: usize) -> Point {
        match team {
            Team::Red => {
                Point {
                    x: HEARTS_START_X + HEARTS_SPACING_X*(i as f32),
                    y: HEARTS_START_Y,
                }
            }
            Team::Blue => {
                Point {
                    x: SCREEN_WIDTH - self.heart_blue.width() -
                        HEARTS_START_X - HEARTS_SPACING_X*(i as f32),
                    y: HEARTS_START_Y,
                }
            }
        }
    }
}

//        =================== Initialization Helpers =================        //
fn new_sparkle(ctx: Ctx) -> SpriteElem {
    let mut sparkle = SpriteElem::new(ctx, SCALE_SPARKLE_X, SCALE_SPARKLE_Y,
                                      "/sparkle.png");
    sparkle.set_animation(
	vec![
            Rect::new(0.0*0.125, 0.0, 0.125, 1.0),
            Rect::new(1.0*0.125, 0.0, 0.125, 1.0),                
            Rect::new(2.0*0.125, 0.0, 0.125, 1.0),                
            Rect::new(3.0*0.125, 0.0, 0.125, 1.0),                
            Rect::new(4.0*0.125, 0.0, 0.125, 1.0),                
            Rect::new(5.0*0.125, 0.0, 0.125, 1.0),                
            Rect::new(6.0*0.125, 0.0, 0.125, 1.0),                
            Rect::new(7.0*0.125, 0.0, 0.125, 1.0),                
        ],
    );
    sparkle
}

fn new_chest(ctx: Ctx) -> SpriteElem {
    let mut chest = SpriteElem::new(ctx, SCALE_CHEST_X, SCALE_CHEST_Y,
                                    "/chest_sprites.png");
    chest.set_animation(
	vec![
            Rect::new(0.0*0.0909, 0.0, 0.0909, 1.0),
            Rect::new(1.0*0.0909, 0.0, 0.0909, 1.0),
            Rect::new(2.0*0.0909, 0.0, 0.0909, 1.0),            
            Rect::new(3.0*0.0909, 0.0, 0.0909, 1.0),            
            Rect::new(4.0*0.0909, 0.0, 0.0909, 1.0),            
        ],
    );
    chest
}

fn new_text_elem(text: String, font_size: f32) -> TextElem {
    TextElem::new(&text, font_size, 1.0, 1.0)
}

fn new_heart(ctx: Ctx, frames: Vec<usize>, red: bool) -> SpriteElem {
    let path = if red {"/heart_red.png"} else {"/heart_blue.png"};
    let mut heart = SpriteElem::new(ctx, SCALE_HEART_X, SCALE_HEART_Y, path);
    let mut anim: Vec<Rect> = vec![];
    for f in frames {
        anim.push(Rect::new((f as f32)*0.2, 0.0, 0.2, 1.0));
    }
    heart.set_animation(anim);
    heart
}

fn new_notify_box(ctx: Ctx) -> SpriteElem {
    let notify_box = SpriteElem::new(ctx, SCALE_NOTIFYBOX_X, SCALE_NOTIFYBOX_Y,
                                      "/tut_notify.png");
    notify_box
}

//==================================<===|===>=================================//

