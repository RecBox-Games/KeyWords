#![allow(dead_code)] // TODO dont allow
use crate::utility::*;

pub const TICKS_TITLE: usize = 50; // TODO
pub const TICKS_CHESTFALL: usize = 50;
pub const TICKS_TURN_TRANSITION: usize = 40;
pub const TICKS_CHEST_OPEN: usize = 220;
pub const TICKS_PER_HEALTH: usize = 40;



// deals only with dynamic state. static state (like words on chests) is not part of game state.
pub enum GameState {
    Intro(IntroState),
    //Joining(JoinState),
    Playing(PlayingState),
    //Over(OverState),
}

impl GameState {
    pub fn new() -> Self {
        GameState::Intro(IntroState::Title(Progress::new(TICKS_TITLE)))
    }

    pub fn tick(&mut self) {
        use GameState::*;
        match self {
            Intro(intro_state) => {
                if ! intro_state.tick() {
                    *self = Playing(PlayingState::new());
                }
            }
            _ => (),
        }
    }
}

pub enum IntroState {
    Title(Progress),
    ChestFall(Progress),
}

impl IntroState {
    fn tick(&mut self) -> bool {
        use IntroState::*;
        if let Title(p) = self {
            if ! p.tick() {
                *self = ChestFall(Progress::new(TICKS_CHESTFALL));
            }
        } else if let ChestFall(p) = self {
            return p.tick();
        }
        true
    }
}

pub struct PlayingState {
    chest_states: Vec<Vec<ChestState>>,
    red_health_state: HealthState,
    blue_health_state: HealthState,
    turn_state: TurnState,
}

impl PlayingState {

    fn new() -> Self { // TODO
        PlayingState {
            chest_states: vec![],
            red_health_state: HealthState::new(),
            blue_health_state: HealthState::new(),
            turn_state: TurnState::new(),
        }
            
    }
    
    fn tick(&mut self) {
        // chests
        for j in 0..ROWS {
            for i in 0..COLLUMNS {
                self.chest_states[j][i].tick();
            }
        }
        // hearts
        self.red_health_state.tick();
        self.blue_health_state.tick();
        // turn
        self.turn_state.tick();
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
            if ! self.turn_state.is_guessing() {
                println!("Warning: attempt to open chest when guessing was not in progress");
                return;
            }
        }
        // state change
        self.chest_states[row][collumn] = ChestState::Opening(0);
        self.turn_state.reduce_guesses();
    }
}


#[derive(PartialEq)]
pub enum ChestState { // TODO: add content and word as part of state
    Closed,
    Opening(usize/*tick number*/),
    Open,
}

impl ChestState {
    fn tick(&mut self) {
        use ChestState::*;
        if let Opening(TICKS_CHEST_OPEN) = self {
            *self = Open;
        } else if let Opening(n) = self {
            *self = Opening(*n+1);
        }
    }
}


#[derive(PartialEq, Clone)]
pub enum TurnState {
    RedCluing,
    RedCluingEnd(usize/*tick number*/, usize/*guesses*/),
    //
    RedGuessing(usize/*guesses remaining*/),
    RedGuessingEnd(usize/*tick number*/),
    //
    BlueCluing,
    BlueCluingEnd(usize/*tick number*/, usize/*guesses*/),
    //
    BlueGuessing(usize/*guesses remaining*/),
    BlueGuessingEnd(usize/*tick number*/),
}

impl TurnState {
    fn new() -> Self { // TODO
        TurnState::RedCluing
    }

    fn tick(&mut self) {
        use TurnState::*;
        *self = match self {
            // dynamic
            RedCluingEnd(TICKS_TURN_TRANSITION, guesses) => RedGuessing(*guesses),
            RedCluingEnd(n, guesses) => RedCluingEnd(*n+1, *guesses),
            RedGuessingEnd(TICKS_TURN_TRANSITION) => BlueCluing,
            RedGuessingEnd(n) => RedGuessingEnd(*n+1),
            BlueCluingEnd(TICKS_TURN_TRANSITION, guesses) => BlueGuessing(*guesses),
            BlueCluingEnd(n, guesses) => BlueCluingEnd(*n+1, *guesses),
            BlueGuessingEnd(TICKS_TURN_TRANSITION) => RedCluing,
            BlueGuessingEnd(n) => BlueGuessingEnd(*n+1),
            // static
            RedCluing => RedCluing,
            RedGuessing(n) => RedGuessing(*n),
            BlueCluing => BlueCluing,
            BlueGuessing(n) => BlueGuessing(*n),
        }
    }

    fn is_guessing(&self) -> bool {
        match self {
            Self::RedGuessing(_) | Self::BlueGuessing(_) => true,
            _ => false,
        }
    }

    fn reduce_guesses(&mut self) {
        use TurnState::*;
        *self = match self {
            RedGuessing(1) => RedGuessingEnd(0),
            RedGuessing(n) => RedGuessing(*n-1),
            BlueGuessing(1) => BlueGuessingEnd(0),            
            BlueGuessing(n) => BlueGuessing(*n-1),
            _ => panic!("can't reduce guess when not guessing"),
        }
    }
    
    pub fn current_team(&self) -> Team {
        use TurnState::*;
        match self {
            RedCluing | RedGuessing(_) | RedCluingEnd(_,_) | RedGuessingEnd(_) => Team::Red,
            BlueCluing | BlueGuessing(_) | BlueCluingEnd(_,_) | BlueGuessingEnd(_) => Team::Blue,            
        }
    }
}


struct HealthState {
    src_amount: usize,
    src_fraction: usize,
    dst_amount: usize,
}

impl HealthState {
    fn new() -> Self { // TODO
        HealthState {
            src_amount: 0,
            src_fraction: 0,
            dst_amount: 0,
        }
    }

    fn tick(&mut self) {
        // decreasing if src_amount > dst_amount or src_amount == dst_amount and src_fraction > 0
        // static once src_fraction is 0 and src_amount == dst_amount
        // increasing if src_amount < dst_amount
        if self.src_amount > self.dst_amount {
            self.tick_health_down();
        } else if self.src_amount == self.dst_amount {
            if self.src_fraction > 0 {
                self.tick_health_down();
            }
        } else if self.src_amount < self.dst_amount {
            self.tick_health_up();
        }
    }

    fn tick_health_up(&mut self) {
        self.src_fraction += 1;
        if self.src_fraction == TICKS_PER_HEALTH {
            self.src_amount += 1;
            self.src_fraction = 0;
        }
    }

    fn tick_health_down(&mut self) {
        if self.src_fraction == 0 {
            self.src_amount -= 1;
            self.src_fraction = TICKS_PER_HEALTH;
        }
        self.src_fraction -= 1;
    }
}
