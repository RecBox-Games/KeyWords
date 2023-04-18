#![allow(dead_code)]
use std::f32::consts::PI;
use ggez::mint::Point2;
use std::error::Error;
pub type Result<T> = std::result::Result<T, Box<dyn Error>>;

pub const SCREEN_WIDTH: f32 = 1920.0;
pub const SCREEN_HEIGHT: f32 = 1080.0;
pub const ROWS: usize = 5;
pub const COLLUMNS: usize = 5;

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
    pub fn tick(&mut self) -> bool {
        self.now += 1;
        return self.now < self.end;
    }

    pub fn as_decimal(&self) -> f32 {
        self.now as f32 / self.end as f32
    }
}

#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum Team {
    Red,
    Blue,
}


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


pub enum Interpolation {
    Linear,
    Round,
    RoundStart,
    RoundEnd,
    Damp,
    Accelerate,
}


pub fn interpolate(p1: Point, p2: Point, func: Interpolation, prg: f32) -> Point {
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
        _ => {panic!("not yet implemented");}

    };
    p1.plus(towards.scale(s))
}
