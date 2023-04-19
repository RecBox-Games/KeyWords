//==================================<===|===>=================================//
#![allow(dead_code)]
use ggez::{Context, GameResult};
use ggez::graphics;
use ggez::graphics::{Image, DrawParam};

use crate::utility::*;

//================================ SpriteElem ================================//
pub struct SpriteElem {
    image: Image,
    x_scale: f32,
    y_scale: f32,
    animation: Vec<graphics::Rect>,
}

impl SpriteElem {
    pub fn new(ctx: &mut Context, x_scale: f32, y_scale: f32, path: &str) -> Self {
	SpriteElem {
	    image: Image::new(ctx, path).unwrap(),
	    x_scale: x_scale,
	    y_scale: y_scale,
	    animation: vec![graphics::Rect::new(0.0, 0.0, 1.0, 1.0)],
	}
    }

    pub fn set_animation(&mut self, anim: Vec<graphics::Rect>) {
	self.animation = anim;
    }

    pub fn draw(&self, ctx: &mut Context, p: Point) -> GameResult<()> {
	let parms = DrawParam::new()
	    .scale(Point{x:self.x_scale, y:self.y_scale})
	    .src(self.animation[0])
	    .dest(p);
	graphics::draw(ctx, &self.image, parms)?;
	Ok(())
    }

    pub fn animate(&self, ctx: &mut Context, p: Point, progress: f32) -> GameResult<()> {
        let frame = (self.animation.len() as f32 * progress ) as usize;
	let parms = DrawParam::new()
	    .scale(Point{x:self.x_scale, y:self.y_scale})
	    .src(self.animation[frame])
	    .dest(p);
	graphics::draw(ctx, &self.image, parms)?;
	Ok(())
    }

    pub fn width(&self) -> f32{
	self.image.dimensions().w * self.animation[0].w * self.x_scale
    }
    pub fn height(&self) -> f32{
	self.image.dimensions().h * self.animation[0].h * self.y_scale
    }
}
//==================================<===|===>=================================//

