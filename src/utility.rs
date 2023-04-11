#![allow(dead_code)]
pub const ROWS: usize = 5;
pub const COLLUMNS: usize = 5;


#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum Team {
    Red,
    Blue,
}
