//use crate::utility::*;
use crate::sprite::*;
use crate::state::*;
use crate::utility::*;
use ggez::{Context, GameResult};
use ggez::graphics::Rect;

// the members of Graphical are assets used when drawing a representation of the game state
pub struct Graphical {
    background: SpriteElem,
    title: SpriteElem,
    sparkle: SpriteElem,
    chest: SpriteElem
}


impl Graphical {
    pub fn new(ctx: &mut Context) -> Self {
        Graphical {
            background: SpriteElem::new(ctx, 4.0, 4.0, "/keywords_background.png"),
            title: SpriteElem::new(ctx, 10.0, 10.0, "/title.png"),
            sparkle: new_sparkle(ctx),
            chest: new_chest(ctx),
        }
    }

    pub fn draw(&mut self, ctx: &mut Context, state: &GameState) -> GameResult<()> {
	let p = Point{x:0.0, y:0.0};
	self.background.draw(ctx,p)?;
        match state {
            GameState::Intro(IntroState::Title(prg)) => self.draw_intro_title(ctx, prg)?,
            GameState::Intro(IntroState::ChestFall(prg)) => self.draw_intro_chestfall(ctx, prg)?,
            _ => (),
        }
        Ok(())
    }

    fn draw_intro_title(&mut self, ctx: &mut Context, progress: &Progress) -> GameResult<()> {
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
    
    fn draw_intro_chestfall(&mut self, ctx: &mut Context, progress: &Progress) -> GameResult<()> {
	//let mut p = Point{x:200.0, y:-400.0 + prg*1600.0};
        let prg = progress.as_decimal();
	let p1 = Point{x:400.0, y:-400.0};
	let p2 = Point{x:400.0, y:340.0};
        //
        let t1 = 0.6;
        if prg < t1 {
            let sub_prg = prg/t1;
            let p = interpolate(p1, p2, Interpolation::Accelerate, sub_prg);
	    self.chest.draw(ctx,p)?;
        } else {
	    self.chest.draw(ctx,p2)?;
        }
        //
        Ok(())
    }        
}


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

/*
fn set_chest_animation(chest: &mut SpriteElem, /* TODO: chest content enum*/) {
    chest.set_animation(
	vec![
            Rect::new(0.0*0.909, 0.0, 0.909, 1.0),
        ],
    );
}
*/
