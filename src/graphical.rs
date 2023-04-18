//==================================<===|===>===================================
use std::collections::HashMap;
use crate::sprite::*;
use crate::state::*;
use crate::utility::*;
use ggez::{Context, GameResult};
use ggez::graphics;
use ggez::graphics::{Rect, Color};

//================================= Constants ==================================
const FONT_SIZE_WORDS: f32 = 36.0;
const COLOR_WORDS: Color = Color::new(0.9, 0.8, 0.7, 1.0);
const CHEST_WORD_OFFSET_Y: f32 = 40.0;
// Chest Placement
const CHEST_START_X: f32 = 220.0;
const CHEST_SPACING_X: f32 = 300.0;
const CHEST_START_Y: f32 = 100.0;
const CHEST_SPACING_Y: f32 = 180.0;

//================================= Graphical ==================================
// the members of Graphical are assets used when drawing a representation of
// the game state
pub struct Graphical {
    background: SpriteElem,
    title: SpriteElem,
    sparkle: SpriteElem,
    chest: SpriteElem,
    word_meshes: HashMap<String, graphics::Text>,
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
        }
    }

    pub fn draw(&mut self, ctx: &mut Context, state: &StateManager)
                -> GameResult<()> {
	let p = Point{x:0.0, y:0.0};
	self.background.draw(ctx,p)?;
        match &state.game_state {
            GameState::Intro(IntroState::Title(prg)) => {
                self.draw_intro_title(ctx, prg)?;
            }
            GameState::Intro(IntroState::ChestFall(prg)) => {
                self.draw_intro_chestfall(ctx, prg, &state.chest_states)?;
            }
            _ => (),
        }
        Ok(())
    }

//        ======================= Draw Helpers =======================        //

    fn draw_intro_title(&mut self, ctx: &mut Context, progress: &Progress)
                        -> GameResult<()> {
	//let mut p = Point{x:200.0, y:-400.0 + prg*1600.0};
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
            let sparkle_p = p2.plus(Point{x:395.0, y:35.0});
            self.sparkle.animate(ctx, sparkle_p, sub_prg)?;
        }
        //
        Ok(())
    }
    
    fn draw_intro_chestfall(&mut self, ctx: &mut Context, progress: &Progress,
                            chest_states: &Vec<Vec<ChestState>>)
                            -> GameResult<()> {
        let prg = progress.as_decimal();
        let nth_chest = (prg/6.0) as usize;
        
	let p1 = Point{x:400.0, y:-400.0};
	let p2 = Point{x:400.0, y:340.0};
        //
        let t1 = 0.6;
        let p = if prg < t1 {
            let sub_prg = prg/t1;
            interpolate(p1, p2, Interpolation::Accelerate, sub_prg)
        } else {
            p2
        };
        self.draw_chest(ctx, p, &chest_states[0][0])?;
        //
        Ok(())
    }

    fn draw_chest(&mut self, ctx: &mut Context, point: Point,
                  chest_state: &ChestState) -> GameResult<()> {
        // chest
        self.chest.draw(ctx, point)?; // TODO: animate()
        // word
        let word_mesh_width = self.get_word_mesh(&chest_state.word).width(ctx);
        let offset_x = self.chest.width()*0.05 +
            (self.chest.width() - word_mesh_width)/2.0;
        let offset_y = self.chest.height() - CHEST_WORD_OFFSET_Y;
        let offset = Point{x:offset_x, y:offset_y};
        graphics::draw(ctx, self.get_word_mesh(&chest_state.word),
                       (point.plus(offset),))?;
        //
        Ok(())
    }

    fn get_word_mesh(&mut self, word: &str) -> &mut graphics::Text {
        if ! self.word_meshes.contains_key(word) {
            self.word_meshes.insert(
                word.to_string(), // key
                new_text_mesh(    // value
                    word.to_string(),
                    FONT_SIZE_WORDS,
                    COLOR_WORDS,
                )
            );
        }
        self.word_meshes.get_mut(word).unwrap()
    }
}

//        =================== Initialization Helpers =================        //

fn new_sparkle(ctx: &mut Context) -> SpriteElem {
    let mut sparkle = SpriteElem::new(ctx, 4.0, 4.0, "/sparkle.png");
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

fn new_chest(ctx: &mut Context) -> SpriteElem {
    let mut chest = SpriteElem::new(ctx, 6.0, 6.0, "/chest_sprites.png");
    chest.set_animation(
	vec![
            Rect::new(0.0*0.0909, 0.0, 0.0909, 1.0),
            Rect::new(1.0*0.0909, 0.0, 0.0909, 1.0),
            Rect::new(2.0*0.0909, 0.0, 0.0909, 1.0),            
        ],
    );
    chest
}

fn new_text_mesh(text: String, font_size: f32, color: Color) -> graphics::Text {
    graphics::Text::new(graphics::TextFragment {
        text: text,
        color: Some(color),
        font: Some(graphics::Font::default()),
        scale: Some(graphics::PxScale::from(font_size)),
    })
}

//==================================<===|===>===================================
