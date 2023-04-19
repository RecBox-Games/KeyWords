//==================================<===|===>===================================
#![allow(dead_code)] // TODO dont allow
use crate::utility::*;
use rand::{seq::IteratorRandom, thread_rng};

//================================= Constants ==================================
pub const TICKS_TITLE: usize = 180; // TODO
pub const TICKS_CHESTFALL: usize = 300;
pub const TICKS_TURN_TRANSITION: usize = 40;
pub const TICKS_CHEST_OPEN: usize = 220;
pub const TICKS_PER_HEALTH: usize = 40;

//=============================== StateManager =================================
// deals only with dynamic state. static state (like words on chests) is not
// part of game state.
pub struct StateManager {
    pub game_state: GameState,
    pub chest_states: Vec<Vec<ChestState>>,
}

impl StateManager {
    pub fn new() -> Self {
        StateManager {
            game_state: GameState::new(),
            chest_states: new_chest_states(),
        }
    }

    pub fn tick(&mut self) {
        self.game_state.tick();
        // chests
        for j in 0..ROWS {
            for i in 0..COLUMNS {
                self.chest_states[j][i].tick();
            }
        }
    }

    pub fn start_open_chest(&mut self, row: usize, collumn: usize) {
        if let GameState::Playing(playing_state) = &mut self.game_state {
            /* parameter validation */ {
                if ! (row < ROWS && collumn < COLUMNS) {
                    println!("Warning: attempt to open chest out of bounds");
                    return;
                }
                if ! (self.chest_states[row][collumn].lid_state == LidState::Closed) {
                    println!("Warning: attempt to open non-closed chest");
                    return;
                }
                if ! playing_state.turn_state.is_guessing() {
                    println!("Warning: attempt to open chest when guessing was not in progress");
                    return;
                }
            }
            // state change
            self.chest_states[row][collumn].lid_state = LidState::Opening(0);
            playing_state.turn_state.reduce_guesses();
        } else {
            println!("Warning: attempt to open chest while not in a playing state");
            return;
        }
    }
}

//        ========================= GameState ========================        //
pub enum GameState {
    Intro(IntroState),
    //Joining(JoinState),
    Playing(PlayingState),
    //Over(OverState),
}

impl GameState {
    pub fn new() -> Self {
        GameState::Intro(IntroState::Title(Progress::new(TICKS_TITLE)))
        //GameState::Playing(PlayingState::new())
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
    red_health_state: HealthState,
    blue_health_state: HealthState,
    turn_state: TurnState,
}

impl PlayingState {
    fn new() -> Self { // TODO
        PlayingState {
            red_health_state: HealthState::new(),
            blue_health_state: HealthState::new(),
            turn_state: TurnState::new(),
        }
            
    }
    
    fn tick(&mut self) {
        // hearts
        self.red_health_state.tick();
        self.blue_health_state.tick();
        // turn
        self.turn_state.tick();
    }

}

//        ======================== ChestState ========================        //
pub struct ChestState { // TODO: add content and word as part of state
    pub lid_state: LidState,
    pub word: String,
    pub contents: ChestContent,
}

impl ChestState {
    fn nothing() -> Self {
        ChestState {
            lid_state: LidState::Closed,
            word: "Nothing".to_string(),
            contents: ChestContent::Empty,
        }
    }

    fn new(word: String, contents: ChestContent) -> Self {
        ChestState {
            lid_state: LidState::Closed,
            word,
            contents,
        }
    }
    
    fn tick(&mut self) {
        self.lid_state.tick();
    }
}

#[derive(PartialEq)]
pub enum LidState {
    Closed,
    Opening(usize/*tick number*/),
    Open,
}

impl LidState {
    fn tick(&mut self) {
        use LidState::*;
        if let Opening(TICKS_CHEST_OPEN) = self {
            *self = Open;
        } else if let Opening(n) = self {
            *self = Opening(*n+1);
        }
    }
}

#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum ChestContent {
    Empty,
    Bomb1,
    Bomb2,
    Bomb5,
    Sword1,
    Sword2,
    Heal3,
}

//        ========================= TurnState ========================        //
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

#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum Team {
    Red,
    Blue,
}

//        ======================== HealthState =======================        //
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

//        =================== Initialization Helpers =================        //

fn new_chest_states() -> Vec<Vec<ChestState>> {
    let mut chest_states = vec![];
    let mut rng = thread_rng();
    // choose words from file
    let s = std::fs::read_to_string("/home/requin/rqn/words/game_words.txt").unwrap(); // TODO
    let all_words_ = s.split("\n").collect::<Vec<&str>>(); 
    let all_words = all_words_[..all_words_.len()-1].iter(); // always a newline at the end so last element is empty
    let chosen_words = all_words.choose_multiple(&mut rng, 25);
    // randomly choose chest contents
    let golds: Vec<usize> = (0..25).collect();
    let yellows = golds.clone().into_iter()
	.choose_multiple(&mut rng, 25-4);
    let grays = yellows.clone().into_iter()
	.choose_multiple(&mut rng, 25-4-5);
    let reds = grays.clone().into_iter()
	.choose_multiple(&mut rng, 25-4-5-5);
    let crimsons = reds.clone().into_iter()
	.choose_multiple(&mut rng, 25-4-5-5-5);
    let deaths = crimsons.clone().into_iter()
	.choose_multiple(&mut rng, 25-4-5-5-5-4);
    let heals = deaths.clone().into_iter()
	.choose_multiple(&mut rng, 25-4-5-5-5-4-1);
    // initiate chests with chosen words and contents
    for j in 0..5 {
        chest_states.push(vec![]);
        for i in 0..5 {
            let i_flat = j*5 + i;
            let content = if heals.contains(&i_flat) {
                ChestContent::Heal3
            } else if deaths.contains(&i_flat) {
                ChestContent::Bomb5
            } else if crimsons.contains(&i_flat) {
                ChestContent::Bomb2
            } else if reds.contains(&i_flat) {
                ChestContent::Bomb1
            } else if grays.contains(&i_flat) {
                ChestContent::Empty
            } else if yellows.contains(&i_flat) {
                ChestContent::Sword1
            } else {
                ChestContent::Sword2
            };
            chest_states[j].push(ChestState::new(String::from(*chosen_words[i_flat]), content));
        }
    }

    chest_states
}
//==================================<===|===>===================================
