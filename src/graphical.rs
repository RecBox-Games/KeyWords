//use crate::utility::*;
use crate::sprite::*;
use crate::state::*;
use crate::utility::*;
use ggez::{Context, GameResult};
use ggez::graphics::Rect;

pub struct Graphical {
    background: SpriteElem,
    title: SpriteElem,
    sparkle: SpriteElem,
}


impl Graphical {
    pub fn new(ctx: &mut Context) -> Self {
	let background = SpriteElem::new(ctx, 4.0, 4.0, "/keywords_background.png");
	let title = SpriteElem::new(ctx, 10.0, 10.0, "/title.png");
        let sparkle = new_sparkle(ctx);
        Graphical {
            background,
            title,
            sparkle,
        }
    }

    pub fn draw(&mut self, ctx: &mut Context, state: &GameState) -> GameResult<()> {
	let p = Point{x:0.0, y:0.0};
	self.background.draw(ctx,p)?;
        match state {
            GameState::Intro(IntroState::Title(prg)) => self.draw_intro(ctx, prg)?,
            _ => (),
        }
        Ok(())
    }

    fn draw_intro(&mut self, ctx: &mut Context, progress: &Progress) -> GameResult<()> {
	//let mut p = Point{x:200.0, y:-400.0 + prg*1600.0};
        let prg = progress.as_decimal();
	let p1 = Point{x:400.0, y:-500.0};
	let p2 = Point{x:400.0, y:340.0};
	let p3 = Point{x:400.0, y:1100.0};
        //
        let A = 0.35;
        let B = 0.40;
        let C = 0.25;
        let BUF = 0.15;
        //
        let p = if prg < A {
            let sub_prg = prg/A;
            interpolate(p1, p2, Interpolation::Damp, sub_prg)
        } else if prg < A+B {
            p2
        } else {
            let sub_prg = (prg-A-B)/C;
            interpolate(p2, p3, Interpolation::Accelerate, sub_prg)
        };
	self.title.draw(ctx,p)?;
        if prg > A+BUF && prg < A+B-BUF {
            let sub_prg = (prg-A-BUF)/(B-BUF*2.0);
            let sparkle_p = p2.plus(Point{x:400.0, y:30.0});
            self.sparkle.animate(ctx, sparkle_p, sub_prg)?;
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
    
