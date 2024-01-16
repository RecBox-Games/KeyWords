//==================================<===|===>=================================//
#![allow(dead_code)]
use ggez::{Context, GameResult};
use ggez::graphics;
use ggez::graphics::{Image, Text, DrawParam, Color};

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

    pub fn animate_scaled(&self, ctx: &mut Context, p: Point, scale: Point, progress: f32) -> GameResult<()> {
        let frame = (self.animation.len() as f32 * progress ) as usize;
	let parms = DrawParam::new()
	    .scale(Point{x:self.x_scale*scale.x, y:self.y_scale*scale.y})
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

pub struct TextElem {
    mesh: Text,
    size: f32,
    x_scale: f32,
    y_scale: f32,
}

impl TextElem {
    pub fn new(ctx: &mut Context, text: &str, size: f32, x_scale: f32, y_scale: f32) -> Self {
        let mesh = Text::new(graphics::TextFragment {
            text: text.to_string(),
            color: None,
            font: Some(graphics::Font::new(ctx, "/fonts/MinecraftRegular-Bmg3.otf").unwrap()),
            scale: Some(graphics::PxScale::from(size)),
        });
	TextElem {
	    mesh,
            size,
	    x_scale,
	    y_scale,
	}
    }

    pub fn draw(&self, ctx: &mut Context, color: Color, p: Point) -> GameResult<()> {
        //graphics::set_default_filter(ctx, graphics::FilterMode::Nearest);
	let parms = DrawParam::new()
	    .scale(Point{x:self.x_scale, y:self.y_scale})
            .color(color)
	    .dest(p);
	graphics::draw(ctx, &self.mesh, parms)?;
	Ok(())
    }

    pub fn draw_scaled(&self, ctx: &mut Context, color: Color, p: Point, scale: Point) -> GameResult<()> {
	let parms = DrawParam::new()
	    .scale(Point{x:self.x_scale*scale.x, y:self.y_scale*scale.y})
            .color(color)
	    .dest(p);
	graphics::draw(ctx, &self.mesh, parms)?;
	Ok(())
    }

    pub fn width(&self, ctx: &mut Context) -> f32{
	self.mesh.dimensions(ctx).w  * self.x_scale
    }
    pub fn height(&self, ctx: &mut Context) -> f32{
	self.mesh.dimensions(ctx).h  * self.y_scale
    }
}

//==================================<===|===>=================================//
