//==================================<===|===>=================================//
#![allow(dead_code)]
use std::f32::consts::PI;
use ggez::mint::Point2;
use std::error::Error;
use crate::events::*;
pub type Result<T> = std::result::Result<T, Box<dyn Error>>;

//================================= Constants ================================//
pub const SCREEN_WIDTH: f32 = 1920.0;
pub const SCREEN_HEIGHT: f32 = 1080.0;
pub const ROWS: usize = 5;
pub const COLUMNS: usize = 5;

//================================= Progress =================================//
#[derive(Debug)]
pub struct Progress {
    pub now: usize,
    pub end: usize,
}

impl Progress {
    pub fn new(end: usize) -> Self{
        Progress {
            now: 0,
            end,
        }
    }

    // returns true if still in progress
    pub fn tick(&mut self) -> TickEvent {
        self.now += 1;
        return if self.now < self.end { TickEvent::None } else { TickEvent::Done };
    }

    pub fn as_decimal(&self) -> f32 {
        self.now as f32 / self.end as f32
    }

    pub fn is_done(&self) -> bool{
        self.now >= self.end
    }
}


//=================================== Point ==================================//
pub type Point = Point2<f32>;

pub trait PointMath {
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

//=============================== Interpolation ==============================//
pub enum Interpolation {
    Linear,
    Round,
    RoundStart,
    RoundEnd,
    Damp,
    Accelerate,
}

pub fn interpolate(p1: Point, p2: Point, func: Interpolation, prg: f32)
                   -> Point {
    use Interpolation::*;
    let towards = p2.minus(p1);
    let s = match func {
        Linear => {
            prg
        }
        RoundStart => {
            1.0 - (prg * PI/2.0).cos()
        }
        RoundEnd => {
            (prg * PI/2.0).sin()
        }
        Accelerate => {
            prg.powf(2.0)
        }
        Damp => {
            prg.powf(0.5)
        }
        _ => {panic!("not yet implemented");}

    };
    p1.plus(towards.scale(s))
}

pub fn interpolate2(p1: Point, p2: Point, p3: Point, func: Interpolation, prg: f32)
                   -> Point {
    use Interpolation::*;
    let p1_2 = interpolate(p1, p2, Linear, prg);
    let p2_3 = interpolate(p2, p3, RoundEnd, prg);
    let p1_2_3 = interpolate(p1_2, p2_3, func, prg);
    p1_2_3
}


//=================================== Clue ===================================//
#[derive(Default, Debug)]
pub struct Clue {
    pub word: String,
    pub num: usize,
}

impl Clue {
    pub fn new(word: String, num: usize) -> Self {
        Self {
            word,
            num,
        }
    }
}

//=================================== Team ===================================//
#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum Team {
    Red,
    Blue,
}

impl Team {
    pub fn opposite(&self) -> Team {
        match self {
            Team::Red => Team::Blue,
            Team::Blue => Team::Red,
        }
    }
}

//==================================<===|===>=================================//
