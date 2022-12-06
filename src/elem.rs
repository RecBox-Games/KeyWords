use ggez::{Context, GameResult};
use ggez::graphics;
use ggez::graphics::{Image, Color, DrawParam};
use ggez::mint::Point2;


//use std::error::Error;
//pub type Result<T> = std::result::Result<T, Box<dyn Error>>;


const SNAP_SPEED: f32 = 0.05;
const MIN_SPEED: f32 = 0.5;


pub type Point = Point2<f32>;
trait PointMath {
    fn magnitude(&self) -> f32;
    fn minus(&self, p: Point) -> Point;
    fn plus(&self, p: Point) -> Point;
    fn scale(&self, s: f32) -> Point;
    }

impl PointMath for Point {
    fn magnitude(&self) -> f32 {
	(self.x.powf(2.0) + self.y.powf(2.0)).powf(0.5)
    }
    fn minus(&self, p: Point) -> Point {
	Point {
	    x: self.x - p.x,
	    y: self.y - p.y,
	}
    }
    fn plus(&self, p: Point) -> Point {
	Point {
	    x: self.x + p.x,
	    y: self.y + p.y,
	}
    }
    fn scale(&self, s: f32) -> Point {
	Point {
	    x: self.x * s,
	    y: self.y * s,
	}
    }
}

pub trait Element {
    fn draw(&self, ctx: &mut Context, p: Point) -> GameResult<()>;
    fn update(&mut self);
    fn set_target(&mut self, x: f32, y: f32);
    fn set_location(&mut self, x: f32, y: f32);
    fn x(&self) -> f32;
    fn y(&self) -> f32;
    fn tx(&self) -> f32;
    fn ty(&self) -> f32;
    fn width(&self, ctx: &Context) -> f32;
    fn height(&self, ctx: &Context) -> f32;
    fn settled(&self) -> bool {
	self.x() == self.tx() && self.y() == self.ty()
    }
}

pub struct ImageElem {
    loc: Point,
    targ: Point,
    image: Image,
}

impl ImageElem {
    pub fn new(ctx: &mut Context, x: f32, y: f32, path: &str) -> Self {
	let p = Point{x:x,y:y};
	ImageElem {
	    loc: p,
	    targ: p,
	    image: Image::new(ctx, path).unwrap(),
	}
    }
}

impl Element for ImageElem {
    fn draw(&self, ctx: &mut Context, p: Point) -> GameResult<()> {
	let newp = p.plus(self.loc);
	graphics::draw(ctx, &self.image, (newp,))?;
	Ok(())
    }

    fn update(&mut self) {
	let towards = self.targ.minus(self.loc);
	let mag = towards.magnitude();
	if mag < MIN_SPEED {
	    self.loc = self.targ;
	    return;
	}
	let newmag = mag*SNAP_SPEED + MIN_SPEED;
	self.loc = self.loc.plus(towards.scale(newmag/mag));
    }

    fn set_target(&mut self, x: f32, y: f32) {
	let p = Point{x:x,y:y};
	self.targ = p;
    }
    fn set_location(&mut self, x: f32, y: f32) {
	let p = Point{x:x,y:y};
	self.loc = p;
	self.targ = p;
    }

    fn x(&self) -> f32 {
	self.loc.x
    }
    fn y(&self) -> f32 {
	self.loc.y
    }	
    fn tx(&self) -> f32 {
	self.targ.x
    }
    fn ty(&self) -> f32 {
	self.targ.y
    }	

    fn width(&self, _ctx: &Context) -> f32{
	self.image.dimensions().w
    }
    fn height(&self, _ctx: &Context) -> f32{
	self.image.dimensions().h
    }
}

pub struct SpriteElem {
    loc: Point,
    targ: Point,
    image: Image,
    x_scale: f32,
    y_scale: f32,
    animation: Vec<graphics::Rect>,
    looping: bool,
    ticks_per_frame: usize,
    tick_number: usize,
}

impl SpriteElem {
    pub fn new(ctx: &mut Context, x: f32, y: f32, x_scale: f32, y_scale: f32, path: &str) -> Self {
	let p = Point{x:x,y:y};
	SpriteElem {
	    loc: p,
	    targ: p,
	    image: Image::new(ctx, path).unwrap(),
	    x_scale: x_scale,
	    y_scale: y_scale,
	    animation: vec![graphics::Rect::new(0.0, 0.0, 1.0, 1.0)],
	    looping: false,
	    ticks_per_frame: 1,
	    tick_number: 0,
	}
    }

    pub fn animation_len(&self) -> usize {
	self.animation.len()
    }
    
    pub fn set_animation(&mut self, anim: Vec<graphics::Rect>, tpf: usize, looping: bool) {
	self.animation = anim;
	self.ticks_per_frame = tpf;
	self.looping = looping;
    }

    pub fn done_animating(&self) -> bool {
	self.tick_number == self.animation.len()*self.ticks_per_frame
    }

    pub fn restart_animation(&mut self) {
	self.tick_number = 0;
    }

    fn frame(&self) -> graphics::Rect {
	let mut frame_number = self.tick_number/self.ticks_per_frame;
	if frame_number > self.animation.len() - 1 {
	    frame_number = self.animation.len() - 1;
	}
	self.animation[frame_number]
    }
}

impl Element for SpriteElem {
    fn draw(&self, ctx: &mut Context, p: Point) -> GameResult<()> {
	let newp = p.plus(self.loc);
	let parms = DrawParam::new()
	    .scale(Point{x:self.x_scale, y:self.y_scale})
	    .src(self.frame())
	    .dest(newp);
	graphics::draw(ctx, &self.image, parms)?;
	Ok(())
    }

    fn update(&mut self) {
	// update location
	let towards = self.targ.minus(self.loc);
	let mag = towards.magnitude();
	if mag < MIN_SPEED {
	    self.loc = self.targ;
	} else {
	    let newmag = mag*SNAP_SPEED + MIN_SPEED;
	    self.loc = self.loc.plus(towards.scale(newmag/mag));
	}
	// update animation
	if self.tick_number < self.animation.len()*self.ticks_per_frame {
	    self.tick_number += 1;
	} else if self.looping {
	    self.tick_number = 0;
	}
    }

    fn set_target(&mut self, x: f32, y: f32) {
	let p = Point{x:x,y:y};
	self.targ = p;
    }
    fn set_location(&mut self, x: f32, y: f32) {
	let p = Point{x:x,y:y};
	self.loc = p;
	self.targ = p;
    }

    fn x(&self) -> f32 {
	self.loc.x
    }
    fn y(&self) -> f32 {
	self.loc.y
    }	
    fn tx(&self) -> f32 {
	self.targ.x
    }
    fn ty(&self) -> f32 {
	self.targ.y
    }	

    fn width(&self, _ctx: &Context) -> f32{
	self.image.dimensions().w * self.frame().w * self.x_scale
    }
    fn height(&self, _ctx: &Context) -> f32{
	self.image.dimensions().h * self.frame().h * self.y_scale
    }
}

pub struct TextElem {
    loc: Point,
    targ: Point,
    mesh: graphics::Text,
}

impl TextElem {
    pub fn new(x: f32, y: f32, text: String, font_size: f32, color: Color) -> Self {
	let p = Point{x:x,y:y};
 	let mesh = graphics::Text::new(graphics::TextFragment {
            text: text,
            color: Some(color),
            font: Some(graphics::Font::default()),
            scale: Some(graphics::PxScale::from(font_size)),
        });
	TextElem {
	    loc: p,
	    targ: p,
	    mesh: mesh,
	}
    }
}    

impl Element for TextElem {
    fn draw(&self, ctx: &mut Context, p: Point) -> GameResult<()> {
	let newp = p.plus(self.loc);
	graphics::draw(ctx, &self.mesh, (newp,))?;
	Ok(())
    }

    fn update(&mut self) {
	let towards = self.targ.minus(self.loc);
	let mag = towards.magnitude();
	if mag < MIN_SPEED {
	    self.loc = self.targ;
	    return;
	}
	let newmag = mag*SNAP_SPEED + MIN_SPEED;
	self.loc = self.loc.plus(towards.scale(newmag/mag));
    }

    fn set_target(&mut self, x: f32, y: f32) {
	let p = Point{x:x,y:y};
	self.targ = p;
    }
    fn set_location(&mut self, x: f32, y: f32) {
	let p = Point{x:x,y:y};
	self.loc = p;
	self.targ = p;
    }

    fn x(&self) -> f32 {
	self.loc.x
    }
    fn y(&self) -> f32 {
	self.loc.y
    }	
    fn tx(&self) -> f32 {
	self.targ.x
    }
    fn ty(&self) -> f32 {
	self.targ.y
    }	

    fn width(&self, ctx: &Context) -> f32{
	self.mesh.dimensions(ctx).w
    }
    fn height(&self, ctx: &Context) -> f32{
	self.mesh.dimensions(ctx).h
    }
}

pub struct Container {
    loc: Point,
    targ: Point,
    elements: Vec<Box<dyn Element>>,
}

impl Container {
    pub fn new(x: f32, y: f32, elems: Vec<Box<dyn Element>>) -> Self {
	let p = Point{x:x,y:y};
	Container {
	    loc: p,
	    targ: p,
	    elements: elems,
	}
    }

    pub fn push(&mut self, e: Box<dyn Element>) {
	self.elements.push(e);
    }

    pub fn pop(&mut self) -> Option<Box<dyn Element>> {
	self.elements.pop()
    }
    
    pub fn len(&self) -> usize {
	self.elements.len()
    }
}

impl Element for Container {
    fn draw(&self, ctx: &mut Context, p: Point) -> GameResult<()> {
	let newp = p.plus(self.loc);
	for elem in &self.elements {
	    elem.draw(ctx, newp)?;
	}
	Ok(())
    }

    fn update(&mut self) {
	// update sub elements
	for mut elem in &mut self.elements {
	    elem.update();
	}
	// update location
	let towards = self.targ.minus(self.loc);
	let mag = towards.magnitude();
	if mag < MIN_SPEED {
	    self.loc = self.targ;
	    return;
	}
	let newmag = mag*SNAP_SPEED + MIN_SPEED;
	self.loc = self.loc.plus(towards.scale(newmag/mag));
    }

    fn set_target(&mut self, x: f32, y: f32) {
	let p = Point{x:x,y:y};
	self.targ = p;
    }
    fn set_location(&mut self, x: f32, y: f32) {
	let p = Point{x:x,y:y};
	self.loc = p;
	self.targ = p;
    }

    fn x(&self) -> f32 {
	self.loc.x
    }
    fn y(&self) -> f32 {
	self.loc.y
    }	
    fn tx(&self) -> f32 {
	self.targ.x
    }
    fn ty(&self) -> f32 {
	self.targ.y
    }	

    fn width(&self, ctx: &Context) -> f32{
	// use a rectangle that will expand to the minimum dimensions to hold all
	// elements then return the width of that
	let mut x1 = 0.0;
	let mut x2 = 0.0;
	for elem in &self.elements {
	    if elem.x() < x1 {
		x1 = elem.x();
	    }
	    if elem.x() + elem.width(ctx) > x2 {
		x2 = elem.x() + elem.width(ctx);
	    }
	}
	x2 - x1
    }
    fn height(&self, ctx: &Context) -> f32{
	// use a rectangle that will expand to the minimum dimensions to hold all
	// elements then return the width of that
	let mut y1 = 0.0;
	let mut y2 = 0.0;
	for elem in &self.elements {
	    if elem.y() < y1 {
		y1 = elem.y();
	    }
	    if elem.y() + elem.height(ctx) > y2 {
		y2 = elem.y() + elem.height(ctx);
	    }
	}
	y2 - y1
    }
}

    
