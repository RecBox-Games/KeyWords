#![allow(dead_code)] // TODO dont allow
use crate::utility::*;

pub const TICKS_CHEST_OPENNING: usize = 666;

// deals only with dynamic state. static state (like words on chests) is not part of game state.
enum GameState {
    Splash(usize/*tick number*/),
    //Joining(JoinState),
    Playing(PlayingState),
    //Over(OverState),
}

impl GameState {
   //pub fn tick(
}

struct PlayingState {
    chest_states: Vec<Vec<ChestState>>,
    //red_health_state: HealthState,
    //blue_health_state: HealthState,
    guess_state: GuessState,
}

impl PlayingState {
    fn tick(&mut self) {
        // chests
        for j in 0..ROWS {
            for i in 0..COLLUMNS {
                
            }
        }
        // hearts
    }

    fn start_open_chest(&mut self, row: usize, collumn: usize) {
        /* parameter validation */ {
            if ! (row < ROWS && collumn < COLLUMNS) {
                println!("Warning: attempt to open chest out of bounds");
                return;
            }
            if ! (self.chest_states[row][collumn] == ChestState::Closed) {
                println!("Warning: attempt to open non-closed chest");
                return;
            }
            if ! self.guess_state.is_guessing() {
                println!("Warning: attempt to open chest when guessing was not in progress");
                return;
            }
        }
        // state change
        self.chest_states[row][collumn] = ChestState::Opening(0);
        self.guess_state.reduce_guesses();
    }
}

#[derive(PartialEq)]
enum ChestState {
    Closed,
    Opening(usize/*tick number*/),
    Open,
}


#[derive(PartialEq)]
enum GuessState {
    RedCluing,
    RedCluingEnd(usize/*tick number*/),
    //
    RedGuessing(usize/*guesses remaining*/),
    RedGuessingEnd(usize/*tick number*/),
    //
    BlueCluing,
    BlueCluingEnd(usize/*tick number*/),
    //
    BlueGuessing(usize/*guesses remaining*/),
    BlueGuessingEnd(usize/*tick number*/),
}

impl GuessState {
    fn is_guessing(&self) -> bool {
        match self {
            Self::RedGuessing(_) | Self::BlueGuessing(_) => true,
            _ => false,
        }
    }

    fn reduce_guesses(&mut self) {
        use GuessState::*;
        *self = match self {
            RedGuessing(1) => RedGuessingEnd(0),
            RedGuessing(n) => RedGuessing(*n-1),
            BlueGuessing(1) => BlueGuessingEnd(0),            
            BlueGuessing(n) => BlueGuessing(*n-1),
            _ => panic!("can't reduce guess when not guessing"),
        }
    }
    
    pub fn current_team(&self) -> Team {
        use GuessState::*;
        match self {
            RedCluing | RedGuessing(_) | RedCluingEnd(_) | RedGuessingEnd(_) => Team::Red,
            BlueCluing | BlueGuessing(_) | BlueCluingEnd(_) | BlueGuessingEnd(_) => Team::Blue,            
        }
    }
}
