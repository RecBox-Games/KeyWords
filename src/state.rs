//==================================<===|===>===================================
use crate::utility::*;
use crate::events::*;
use crate::messages::*;
use rand::{seq::IteratorRandom, thread_rng};
use std::mem::take;


//================================= Constants ==================================
// Ticks
pub const TICKS_TITLE: usize = 180; // TODO
pub const TICKS_CHESTFALL: usize = 320;
pub const TICKS_TURN_TRANSITION: usize = 40;
pub const TICKS_CHEST_OPEN: usize = 220;
pub const TICKS_PER_HEALTH: usize = 40;
pub const TICKS_TUT_DROP_IN: usize = 80;
pub const TICKS_TUT_DROP_OUT: usize = 70;
// Health
pub const MAX_HEALTH_RED: usize = 10;
pub const MAX_HEALTH_BLUE: usize = 12;

//=============================== StateManager =================================
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

//        ======================= InputHandling ======================        //
    pub fn handle_input(&mut self, message: InputMessage) {
        match message {
            InputMessage::PrintTurn => {
                self.handle_print_turn();
            }
            InputMessage::PrintChests => {
                self.handle_print_chests();
            }
            InputMessage::Ack => {
                self.handle_ack();
            }
            InputMessage::Clue(clue) => {
                self.handle_clue(clue);
            }
            InputMessage::Guess(row, col) => {
                self.handle_guess(row, col);
            }
            InputMessage::Second(support) => {
                self.handle_second(support);
            }
        }
    }

    fn handle_print_turn(&self) {
        println!("{}", &self.game_state);
    }

    fn handle_print_chests(&self) {
        println!("{}", self);
    }
    
    fn handle_ack(&mut self) {
        if let GameState::Intro(IntroState::TutNotify(tutnotify_state)) = &mut self.game_state {
            tutnotify_state.handle_ack();
        } else {
            println!("Warning: bad ack");
        }
    }

    fn handle_clue(&mut self, clue: Clue) {
        if let GameState::Playing(playing_state) = &mut self.game_state {
            playing_state.turn_state.handle_clue(clue);
        } else {
            println!("Warning: bad clue (1)");
        }
    }

    fn handle_guess(&mut self, row: usize, col: usize) {
        if let GameState::Playing(playing_state) = &mut self.game_state {
            playing_state.turn_state.handle_guess(row, col);
        } else {
            println!("Warning: bad guess (1)");
        }
    }
    
    fn handle_second(&mut self, support: bool) {
        if let GameState::Playing(playing_state) = &mut self.game_state {
            let guess = playing_state.turn_state.handle_second(support);
            if let Some((row, col)) = guess {
                // start openning chest
                self.chest_states[row][col].lid_state = LidState::Opening(0);
            }
        } else {
            println!("Warning: bad second (1)");
        }
    }
    
}

//        ========================= GameState ========================        //
#[derive(Debug)]
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
                if intro_state.tick().is_done() {
                    *self = Playing(PlayingState::new());
                }
            }
            Playing(playing_state) => {
                playing_state.tick();
            }
            //_ => (),
        }
    }
}

//        ======================== IntroState ========================        //
#[derive(Debug)]
pub enum IntroState {
    Title(Progress),
    TutNotify(TutNotifyState),
    ChestFall(Progress),
}

impl IntroState {
    fn tick(&mut self) -> TickEvent {
        use IntroState::*;
        if let Title(p) = self {
            if p.tick().is_done() {
                *self = TutNotify(TutNotifyState::new());
            }
        } else if let TutNotify(tutnotify_state) = self {
            if tutnotify_state.tick().is_done() {
                *self = ChestFall(Progress::new(TICKS_CHESTFALL));
            }
        } else if let ChestFall(p) = self {
            return p.tick();
        }
        TickEvent::None
    }
}

#[derive(Debug)]
pub enum TutNotifyState {
    DropIn(Progress),
    In,
    DropOut(Progress),
}

impl TutNotifyState {
    fn new() -> Self {
        TutNotifyState::DropIn(Progress::new(TICKS_TUT_DROP_IN))
    }

    fn tick(&mut self) -> TickEvent {
        use TutNotifyState::*;
        if let DropIn(p) = self {
            if p.tick().is_done() {
                *self = In;
                return TickEvent::Syn;
            }
        } else if let In = self {
            return TickEvent::None;
        } else if let DropOut(p) = self {
            return p.tick();
        }
        TickEvent::None
    }

    fn handle_ack(&mut self) {
        *self = TutNotifyState::DropOut(Progress::new(TICKS_TUT_DROP_OUT))
    }
}

//        ======================= PlayingState =======================        //
#[derive(Debug)]
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
pub struct ChestState {
    pub lid_state: LidState,
    pub word: String,
    pub contents: ChestContent,
}

impl ChestState {
    /*fn nothing() -> Self {
        ChestState {
            lid_state: LidState::Closed,
            word: "Nothing".to_string(),
            contents: ChestContent::Empty,
        }
    }*/

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

#[derive(Debug, PartialEq)]
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
#[derive(Debug)]
pub enum TurnState {
    RedCluing,
    RedCluingEnd(Progress, Clue),
    //
    RedGuessing(Clue, Option<(usize, usize)>/* proposed guess */),
    RedGuessingEnd(Progress),
    //
    BlueCluing,
    BlueCluingEnd(Progress, Clue),
    //
    BlueGuessing(Clue, Option<(usize, usize)>/* proposed guess */),
    BlueGuessingEnd(Progress),
}

impl TurnState {
    fn new() -> Self { // TODO
        TurnState::RedCluing
    }

    fn tick(&mut self) {
        use TurnState::*;
        match self {
            RedCluingEnd(prg, clue) => {
                if prg.tick().is_done() {
                    *self = RedGuessing(take(clue), None);
                }
            }
            RedGuessingEnd(prg) => {
                if prg.tick().is_done() {
                    *self = BlueCluing;
                }
            }
            BlueCluingEnd(prg, clue) => {
                if prg.tick().is_done() {
                    *self = BlueGuessing(take(clue), None);
                }
            }
            BlueGuessingEnd(prg) => {
                if prg.tick().is_done() {
                    *self = RedCluing;
                }
            }
            _ => ()
        }
    }

    fn handle_clue(&mut self, clue: Clue) {
        use TurnState::*;
        match self {
            RedCluing => {
                *self = RedCluingEnd(Progress::new(TICKS_TURN_TRANSITION), clue);
            }
            BlueCluing => {
                *self = BlueCluingEnd(Progress::new(TICKS_TURN_TRANSITION), clue);
            }
            _ => {
                println!("Warning: bad clue (2)")
            }
        }
    }
    
    fn handle_guess(&mut self, row: usize, col: usize) {
        use TurnState::*;
        match self {
            RedGuessing(_, current_guess) | BlueGuessing(_, current_guess)  => {
                if current_guess.is_none() {
                    *current_guess = Some((row, col));
                } else {
                    println!("Warning: bad guess (2)")
                }
            }
            _ => {
                println!("Warning: bad guess (3)")
            }
        }
            
    }

    // TODO: refactor
    fn handle_second(&mut self, support: bool) -> Option<(usize, usize)> {
        use TurnState::*;
        let mut current_guess = None;
        match self {
            RedGuessing(clue, guess) => {
                current_guess = guess.take();
                if ! support {
                    return None;
                }
                if current_guess.is_some() {
                    clue.num -= 1;
                    if clue.num == 0 {
                        *self = RedGuessingEnd(Progress::new(TICKS_TURN_TRANSITION));
                    }
                }
            }
            BlueGuessing(clue, guess) => {
                current_guess = guess.take();
                if ! support {
                    return None;
                }
                if current_guess.is_some() {
                    clue.num -= 1;
                    if clue.num == 0 {
                        *self = BlueGuessingEnd(Progress::new(TICKS_TURN_TRANSITION));
                    }
                }
            }
            _ => {
                println!("Warning: bad second (2)");
            }
        }
        return current_guess;
    } 

}
/*
    fn is_guessing(&self) -> bool {
        match self {
            Self::RedGuessing(_,_) | Self::BlueGuessing(_,_) => true,
            _ => false,
        }
    }

    /*
    fn accept_guess(clue: &mut Clue, guess: &mut Option<(usize, usize)>)
                    -> Option<(usize, usize)> {
        clue.num -= 1;
        if clue.num == 0 {
            *self = RedGuessingEnd(Progress::new(TICKS_TURN_TRANSITION));
        }
        
    }*/
        

    fn current_team(&self) -> Team {
        use TurnState::*;
        match self {
            RedCluing | RedGuessing(_,_) | RedCluingEnd(_,_) | RedGuessingEnd(_) => Team::Red,
            BlueCluing | BlueGuessing(_,_) | BlueCluingEnd(_,_) | BlueGuessingEnd(_) => Team::Blue,            
        }
    }

}

#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum Team {
    Red,
    Blue,
}
*/
//        ======================== HealthState =======================        //
#[derive(Debug)]
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

// randomly pick words and distribute contents for the grid of chests
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

//        ====================== Pretty Printing =====================        //
impl std::fmt::Display for ChestState {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if let LidState::Open = &self.lid_state {
            write!(f, "O", )
        } else {
            write!(f, "#", )
        }
    }
}

impl std::fmt::Display for StateManager {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let mut j = 0;
        write!(f, "{}{}{}{}{}\n",
               self.chest_states[j][0], self.chest_states[j][1],
               self.chest_states[j][2], self.chest_states[j][3],
               self.chest_states[j][4])?;
        j = 1;
        write!(f, "{}{}{}{}{}\n",
               self.chest_states[j][0], self.chest_states[j][1],
               self.chest_states[j][2], self.chest_states[j][3],
               self.chest_states[j][4])?;
        j = 2;
        write!(f, "{}{}{}{}{}\n",
               self.chest_states[j][0], self.chest_states[j][1],
               self.chest_states[j][2], self.chest_states[j][3],
               self.chest_states[j][4])?;
        j = 3;
        write!(f, "{}{}{}{}{}\n",
               self.chest_states[j][0], self.chest_states[j][1],
               self.chest_states[j][2], self.chest_states[j][3],
               self.chest_states[j][4])?;
        j = 4;
        write!(f, "{}{}{}{}{}\n",
               self.chest_states[j][0], self.chest_states[j][1],
               self.chest_states[j][2], self.chest_states[j][3],
               self.chest_states[j][4])?;
        write!(f, "{}", self.game_state)
    }
}

impl std::fmt::Display for GameState {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if let GameState::Playing(playing_state) = self {
            write!(f, "{:?}", &playing_state.turn_state)
        } else {
            write!(f, "{:?}", self)
        }
    }
}
    

//==================================<===|===>===================================
