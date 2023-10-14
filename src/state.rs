//==================================<===|===>===================================
use crate::utility::*;
use crate::events::*;
use crate::messages::*;
use rand::{seq::IteratorRandom, thread_rng};
use std::mem::take;


//================================= Constants ==================================
// Ticks
pub const TICKS_TITLE: usize = 320; //320;
pub const TICKS_CHESTFALL: usize = 320; //320;
pub const TICKS_TURN_TRANSITION: usize = 40;
pub const TICKS_CHEST_GROW: usize = 150;
pub const TICKS_CHEST_OPEN: usize = 80;
pub const TICKS_CHEST_SHRINK: usize = 120;
pub const TICKS_PER_HEALTH: usize = 30;
pub const TICKS_DROP_IN: usize = 160;
pub const TICKS_INFORM: usize = 100;
pub const TICKS_DROP_OUT: usize = 70;
pub const TICKS_PROJECTILE: usize = 40;
pub const TICKS_DISPLAY_CONTENTS: usize = 40;
pub const TICKS_GAME_OVER: usize = 100;
// Health
pub const MAX_HEALTH_RED: usize = 10;
pub const MAX_HEALTH_BLUE: usize = 12;
// Contents
pub const N_SWORD1: usize = 5;
pub const N_SWORD2: usize = 4;
pub const N_BOMB1: usize = 5;
pub const N_BOMB2: usize = 4;
pub const N_BOMB4: usize = 1;
pub const N_HEAL3: usize = 1;


//=============================== StateManager =================================
pub struct StateManager {
    pub game_state: GameState,
    pub chest_states: Vec<Vec<ChestState>>,
    pub state_update: bool,
}

impl StateManager {
    pub fn new() -> Self {
        StateManager {
            game_state: GameState::new(),
            chest_states: new_chest_states(),
            state_update: false,
        }
    }

    pub fn tick(&mut self) {
        let game_tick_event = self.game_state.tick();
        if game_tick_event.needs_update() {
            self.state_update = true;
        }
            
        // chests
        if let GameState::Playing(playing_state) = &mut self.game_state {
            for j in 0..ROWS {
                for i in 0..COLUMNS {
                    let tick_event = self.chest_states[j][i].tick();
                    if let TickEvent::ProjectileHit(projectile) = tick_event { // TODO refactor
                        playing_state.handle_projectile_hit(projectile);
                        self.state_update = true;
                    }
                    if let TickEvent::DoneOpening = tick_event {
                        playing_state.handle_done_opening();
                        self.state_update = true;
                    }
                }
            }
        }

        // check for sudden death
        let num_sword_chests = self.num_sword_chests();
        if let GameState::Playing(playing_state) = &mut self.game_state {
            if num_sword_chests == 0 && playing_state.sudden_death == false{
                for j in 0..ROWS {
                    for i in 0..COLUMNS {
                        if ! self.chest_states[j][i].is_open() {
                            self.chest_states[j][i].sudden_death_convert();
                        }
                    }
                }
                playing_state.sudden_death = true;
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
            //
            InputMessage::Ack => {
                //self.handle_ack();
            }
            InputMessage::Role(_role) => {
                println!("Warning: role not meant to be handled by state");
            }
            InputMessage::Clue(clue) => {
                self.handle_clue(clue);
                self.state_update = true;
            }
            InputMessage::Guess(row, col) => {
                if ! chests_are_settled(&self.chest_states) {
                    println!("Warning: attempt to guess before settled");
                    return;
                }
                if let OpeningState::Open = self.chest_states[row][col].opening_state {
                    println!("Warning: attempt to guess opened chest");
                    return;
                }
                self.handle_guess(row, col);
                self.state_update = true;
            }
            InputMessage::Second(support) => {
                if ! chests_are_settled(&self.chest_states) {
                    println!("Warning: attempt to support before settled");
                    return;
                }
                self.handle_second(support);
                self.state_update = true;
            }
            InputMessage::Restart => {
                self.handle_restart();
                self.state_update = true;
            }
        }
    }

    fn handle_restart(&mut self) {
        self.game_state = GameState::new();
        self.chest_states = new_chest_states();
    }

    fn handle_print_turn(&self) {
        println!("{}", &self.game_state);
    }

    fn handle_print_chests(&self) {
        println!();
        for j in 0..ROWS {
            for i in 0..COLUMNS {
                print!(" {}", self.chest_states[j][i].two_char());
            }
            println!();
        }
        println!();
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
                // start opening chest
                self.chest_states[row][col].opening_state.start_opening();
            }
        } else {
            println!("Warning: bad second (1)");
        }
    }

    fn num_sword_chests(&self) -> usize {
        let mut sword_chests = 0;
        for j in 0..ROWS {
            for i in 0..COLUMNS {
                if ! self.chest_states[j][i].is_open() {
                    if let ChestContent::Sword1 = self.chest_states[j][i].contents {
                        sword_chests += 1;
                    }
                    if let ChestContent::Sword2 = self.chest_states[j][i].contents {
                        sword_chests += 1;
                    }
                }
            }
        }
        sword_chests
    }
}

//        ========================= GameState ========================        //
#[derive(Debug)]
pub enum GameState {
    Intro(IntroState),
    Playing(PlayingState),
    Over(HealthState/*red*/, HealthState/*blue*/, Progress),
}

impl GameState {
    pub fn new() -> Self { Self::Intro(IntroState::new()) }

    pub fn tick(&mut self) -> TickEvent {
        use GameState::*;
        match self {
            Intro(intro_state) => {
                let tick_event = intro_state.tick();
                if tick_event.is_done() {
                    *self = Playing(PlayingState::new());
                    return TickEvent::NeedsUpdate;
                }
                if tick_event.needs_update() {
                    return TickEvent::NeedsUpdate;
                }
            }
            Playing(playing_state) => {
                let tick_event = playing_state.tick();
                if tick_event.is_done() {
                    *self = Over(playing_state.red_health_state.clone(),
                                 playing_state.blue_health_state.clone(),
                                 Progress::new(TICKS_GAME_OVER));
                    return TickEvent::NeedsUpdate;
                }
                if tick_event.needs_update() {
                    return TickEvent::NeedsUpdate;
                }
            }
            Over(_, _, progress) => {
                if ! progress.is_done() {
                    progress.tick();
                }
            }
            //_ => (),
        }
        TickEvent::None
    }
}

//        ======================== IntroState ========================        //
#[derive(Debug)]
pub enum IntroState {
    Title(Progress),
    ChestFall(Progress),
}

impl IntroState {
    fn new() -> Self { Self::Title(Progress::new(TICKS_TITLE)) }
    fn new_chest_fall() -> Self { Self::ChestFall(Progress::new(TICKS_CHESTFALL)) }
    fn tick(&mut self) -> TickEvent {
        use IntroState::*;
        if let Title(p) = self {
            if p.tick().is_done() {
                *self = Self::new_chest_fall();
                return TickEvent::NeedsUpdate;
            }
        } else if let ChestFall(p) = self {
            return p.tick();
        }
        TickEvent::None
    }
}

#[derive(Debug)]
pub enum InformState {
    DropIn(Progress),
    In(Progress),
    DropOut(Progress),
}

impl InformState {
    fn new() -> Self {
        InformState::DropIn(Progress::new(TICKS_DROP_IN))
    }

    fn tick(&mut self) -> TickEvent {
        use InformState::*;
        if let DropIn(p) = self {
            if p.tick().is_done() {
                *self = In(Progress::new(TICKS_INFORM));
            }
        } else if let In(p) = self {
            if p.tick().is_done() {
                *self = DropOut(Progress::new(TICKS_DROP_OUT));
            }
        } else if let DropOut(p) = self {
            return p.tick();
        }
        TickEvent::None
    }

    pub fn is_done(&self) -> bool {
        if let InformState::DropOut(progress) = self {
            return progress.is_done();
        }
        false
    }
}

//        ======================= PlayingState =======================        //
#[derive(Debug)]
pub struct PlayingState {
    pub red_health_state: HealthState,
    pub blue_health_state: HealthState,
    pub turn_state: TurnState,
    pub sudden_death: bool,
    pub sudden_death_progress: InformState,
}

impl PlayingState {
    fn new() -> Self {
        PlayingState {
            red_health_state: HealthState::new(MAX_HEALTH_RED),
            blue_health_state: HealthState::new(MAX_HEALTH_BLUE),
            turn_state: TurnState::new(),
            sudden_death: false,
            sudden_death_progress: InformState::new(),
        }
            
    }
    
    fn tick(&mut self) -> TickEvent {
        // hearts
        if self.red_health_state.tick().is_done() {
            return TickEvent::Done;
        }
        if self.blue_health_state.tick().is_done() {
            return TickEvent::Done;
        }
        // turn
        if self.turn_state.tick().needs_update() {
            return TickEvent::NeedsUpdate;
        }
        // sudden death
        if self.sudden_death && ! self.sudden_death_progress.is_done() {
            self.sudden_death_progress.tick();
        }
        TickEvent::None
    }

    fn handle_projectile_hit(&mut self, projectile: Projectile) {
        match (projectile, self.current_team()) {
            (Projectile::Sword, Team::Red) |
            (Projectile::Bomb, Team::Blue) => {
                self.blue_health_state.take_damage(1, MAX_HEALTH_BLUE);
            }
            (Projectile::Sword, Team::Blue) |
            (Projectile::Bomb, Team::Red) => {
                self.red_health_state.take_damage(1, MAX_HEALTH_RED);
            }
            (Projectile::Heart, Team::Red) => {
                self.red_health_state.take_damage(-1, MAX_HEALTH_RED);
            }
            (Projectile::Heart, Team::Blue) => {
                self.blue_health_state.take_damage(-1, MAX_HEALTH_BLUE);
            }
        }
    }

    fn handle_done_opening(&mut self) {
        match self.turn_state {
            TurnState::RedGuessingEnd(_) => {
                self.turn_state = TurnState::BlueCluing;
            }
            TurnState::BlueGuessingEnd(_) => {
                self.turn_state = TurnState::RedCluing;
            }
            _ => (),
        }
    }
    
    pub fn current_team(&self) -> Team {
        self.turn_state.current_team()
    }

    pub fn red_health(&self) -> usize {
        self.red_health_state.dst_amount
    }

    pub fn blue_health(&self) -> usize {
        self.blue_health_state.dst_amount
    }
}

//        ======================== ChestState ========================        //
pub struct ChestState {
    pub opening_state: OpeningState,
    pub word: String,
    pub contents: ChestContent,
}

impl ChestState {
    fn new(word: String, contents: ChestContent) -> Self {
        ChestState {
            opening_state: OpeningState::Closed,
            word,
            contents,
        }
    }
    
    fn tick(&mut self) -> TickEvent {
        use OpeningState::*;
        let tick_event = self.opening_state.tick();
        if let TickEvent::Deploy = tick_event {
            self.opening_state = Deploying(DeployingState::new(self.contents));
            return TickEvent::None;
        }
        tick_event
    }

    pub fn is_static(&self) -> bool {
        use OpeningState::*;
        match &self.opening_state {
            Closed | Open => true,
            _ => false,
        }
    }

    fn two_char(&self) -> String {
        use ChestContent::*;
        match self.contents {
            Empty => ".".to_string(),
            Bomb1 => "b".to_string(),
            Bomb2 => "B".to_string(),
            Bomb3 => "8".to_string(),
            Bomb4 => "&".to_string(),
            Sword1 => "s".to_string(),
            Sword2 => "S".to_string(),
            Heal3 => "H".to_string(),
        }
    }

    fn sudden_death_convert(&mut self) {
        use ChestContent::*;
        self.contents = match &self.contents {
            Empty => Bomb3,
            Bomb1 => Sword1,
            Bomb2 => Sword2,
            Bomb3 => Bomb3,
            Bomb4 => Bomb4,
            Sword1 => Sword1,
            Sword2 => Sword2,
            Heal3 => Heal3,
        };
        println!("convert");
    }
    
    fn is_open(&self) -> bool {
        if let OpeningState::Open = &self.opening_state {
            true
        } else {
            false
        }
    }
}

#[derive(Debug)]
pub enum OpeningState {
    Closed,
    Growing(Progress),
    Opening(Progress),
    Deploying(DeployingState),
    Shrinking(Progress),
    Open,
}

impl OpeningState {
    fn tick(&mut self) -> TickEvent {
        use OpeningState::*;
        match self {
            Growing(prg) => {
                if prg.tick().is_done() {
                    *self = Opening(Progress::new(TICKS_CHEST_OPEN));
                }
            }
            Opening(prg) => {
                if prg.tick().is_done() {
                    return TickEvent::Deploy;
                } 
            }
            Deploying(deploying_state) => {
                let tick_event = deploying_state.tick();
                if tick_event.is_done() {
                    *self = Shrinking(Progress::new(TICKS_CHEST_SHRINK));
                } else {
                    return tick_event;
                }
            }
            Shrinking(prg) => {
                if prg.tick().is_done() {
                    *self = Open;
                    return TickEvent::DoneOpening;
                }
            }
            _ => ()
        }
        TickEvent::None
    }

    fn start_opening(&mut self) {
        use OpeningState::*;
        *self = Growing(Progress::new(TICKS_CHEST_GROW));
    }
}

#[derive(Debug)]
pub struct DeployingState {
    pub display_progress: Progress,
    pub current_projectile_progress: Progress,
    pub projectiles: Vec<Projectile>,
    pub total_projectiles: usize,
}

impl DeployingState {
    fn new(content: ChestContent) -> Self {
        use ChestContent::*;
        use Projectile::*;
        let projectiles = match content {
            Empty => vec![],
            Bomb1 => vec![Bomb],
            Bomb2 => vec![Bomb, Bomb],
            Bomb3 => vec![Bomb, Bomb, Bomb],
            Bomb4 => vec![Bomb, Bomb, Bomb, Bomb],
            Sword1 => vec![Sword],
            Sword2 => vec![Sword, Sword],
            Heal3 => vec![Heart, Heart, Heart],
        };
        let total_projectiles = projectiles.len();
        Self {
            display_progress: Progress::new(TICKS_DISPLAY_CONTENTS),
            current_projectile_progress: Progress::new(TICKS_PROJECTILE),
            projectiles,
            total_projectiles,
        }
    }

    fn tick(&mut self) -> TickEvent {
        if ! self.display_progress.is_done() {
            self.display_progress.tick();
            return TickEvent::None;
        }
        if self.projectiles.len() == 0 {
            return TickEvent::Done;
        }
        if self.current_projectile_progress.tick().is_done() {
            self.current_projectile_progress = Progress::new(TICKS_PROJECTILE);
            return TickEvent::ProjectileHit(self.projectiles.pop().unwrap());
            // we can unwrap because we already checked for 0 len
        }
        TickEvent::None
    }
}
    
#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum ChestContent {
    Empty,
    Bomb1,
    Bomb2,
    Bomb3,
    Bomb4,
    Sword1,
    Sword2,
    Heal3,
}

#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum Projectile {
    Sword,
    Bomb,
    Heart,
}

//        ========================= TurnState ========================        //
#[derive(Debug)]
pub enum TurnState {
    RedCluing,
    RedCluingEnd(Progress, Clue),
    //
    RedGuessing(Clue, Option<(usize, usize)>/* proposed guess */),
    RedGuessingEnd(Clue),
    //
    BlueCluing,
    BlueCluingEnd(Progress, Clue),
    //
    BlueGuessing(Clue, Option<(usize, usize)>/* proposed guess */),
    BlueGuessingEnd(Clue),
}

impl TurnState {
    fn new() -> Self { // TODO
        TurnState::RedCluing
    }

    fn tick(&mut self) -> TickEvent {
        use TurnState::*;
        match self {
            RedCluingEnd(prg, clue) => {
                if prg.tick().is_done() {
                    *self = RedGuessing(take(clue), None);
                    return TickEvent::NeedsUpdate;
                }
            }
            BlueCluingEnd(prg, clue) => {
                if prg.tick().is_done() {
                    *self = BlueGuessing(take(clue), None);
                    return TickEvent::NeedsUpdate;
                }
            }
            _ => ()
        }
        TickEvent::None
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
                if current_guess.is_some() {
                    println!("Warning: bad guess (2)");
                    return;
                }
                *current_guess = Some((row, col));
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
                        *self = RedGuessingEnd(take(clue));
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
                        *self = BlueGuessingEnd(take(clue));
                    }
                }
            }
            _ => {
                println!("Warning: bad second (2)");
            }
        }
        return current_guess;
    } 

    pub fn current_team(&self) -> Team {
        use TurnState::*;
        match self {
            RedCluing | RedGuessing(_,_) | RedCluingEnd(_,_) | RedGuessingEnd(_) => Team::Red,
            BlueCluing | BlueGuessing(_,_) | BlueCluingEnd(_,_) | BlueGuessingEnd(_) => Team::Blue,            
        }
    }

    pub fn proposed_guess(&self) -> Option<(usize, usize)> {
        use TurnState::*;
        match self {
            RedGuessing(_, guess) => *guess,
            BlueGuessing(_, guess) => *guess,
            _ => None,
        }
    } 
}

//        ======================== HealthState =======================        //
#[derive(Debug, Clone)]
pub struct HealthState {
    pub src_amount: usize,
    pub src_fraction: usize,
    pub dst_amount: usize,
}

impl HealthState {
    fn new(max_health: usize) -> Self { 
        HealthState {
            src_amount: max_health,
            src_fraction: 0,
            dst_amount: max_health,
        }
    }

    fn tick(&mut self) -> TickEvent {
        // decreasing if src_amount > dst_amount or src_amount == dst_amount and src_fraction > 0
        // static once src_fraction is 0 and src_amount == dst_amount
        // increasing if src_amount < dst_amount
        if self.src_amount > self.dst_amount {
            self.tick_health_down();
        } else if self.src_amount == self.dst_amount {
            if self.src_fraction > 0 {
                self.tick_health_down();
            }
            if self.src_amount == 0 && self.src_fraction == 0 {
                return TickEvent::Done;
            }
        } else if self.src_amount < self.dst_amount {
            self.tick_health_up();
        }
        TickEvent::None
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

    fn take_damage(&mut self, damage: isize, max: usize) {
        if damage > self.dst_amount as isize {
            self.dst_amount = 0;
        } else if self.dst_amount as isize - damage > max as isize {
            self.dst_amount = max;
        } else {
            self.dst_amount = ((self.dst_amount as isize) - damage) as usize;
        }
    }

    pub fn fraction(&self) -> f32 {
        self.src_fraction as f32 / TICKS_PER_HEALTH as f32
    }
}

//        =================== Initialization Helpers =================        //

// randomly pick words and distribute contents for the grid of chests
fn new_chest_states() -> Vec<Vec<ChestState>> {
    let mut chest_states = vec![];
    let mut rng = thread_rng();
    // choose words from file
    let s = std::fs::read_to_string("./resources/game_words.txt").unwrap(); // TODO
    let all_words_ = s.split("\n").collect::<Vec<&str>>(); 
    let all_words = all_words_[..all_words_.len()-1].iter(); // always a newline at the end so last element is empty
    let chosen_words = all_words.choose_multiple(&mut rng, 25);
    // randomly choose chest contents
    let n_total = ROWS*COLUMNS;
    let sword2s: Vec<usize> = (0..n_total).collect();
    let sword1s = sword2s.clone().into_iter()
	.choose_multiple(&mut rng, n_total-N_SWORD2);
    let bomb2s = sword1s.clone().into_iter()
	.choose_multiple(&mut rng, n_total-N_SWORD2-N_SWORD1);
    let bomb1s = bomb2s.clone().into_iter()
	.choose_multiple(&mut rng, n_total-N_SWORD2-N_SWORD1-N_BOMB2);
    let bomb4s = bomb1s.clone().into_iter()
	.choose_multiple(&mut rng, n_total-N_SWORD2-N_SWORD1-N_BOMB2-N_BOMB1);
    let heal3s = bomb4s.clone().into_iter()
	.choose_multiple(&mut rng, n_total-N_SWORD2-N_SWORD1-N_BOMB2-N_BOMB1-N_BOMB4);
    let emptys = heal3s.clone().into_iter()
	.choose_multiple(&mut rng, n_total-N_SWORD2-N_SWORD1-N_BOMB2-N_BOMB1-N_BOMB4-N_HEAL3);
    // initiate chests with chosen words and contents
    for j in 0..ROWS {
        chest_states.push(vec![]);
        for i in 0..COLUMNS {
            let i_flat = j*5 + i;
            let content = if emptys.contains(&i_flat) {
                ChestContent::Empty
            } else if heal3s.contains(&i_flat) {
                ChestContent::Heal3
            } else if bomb4s.contains(&i_flat) {
                ChestContent::Bomb4
            } else if bomb1s.contains(&i_flat) {
                ChestContent::Bomb1
            } else if bomb2s.contains(&i_flat) {
                ChestContent::Bomb2
            } else if sword1s.contains(&i_flat) {
                ChestContent::Sword1
            } else {
                ChestContent::Sword2
            };
            chest_states[j].push(ChestState::new(String::from(*chosen_words[i_flat]), content));
        }
    }

    chest_states
}

pub fn get_deploying_state(chests: &Vec<Vec<ChestState>>) -> Option<&DeployingState> {
    for row in chests {
        for chest in row {
            if let OpeningState::Deploying(deploying_state) = &chest.opening_state {
                return Some(deploying_state);
            }
        }
    }
    None
}

pub fn chests_are_settled(chests: &Vec<Vec<ChestState>>) -> bool {
    for row in chests {
        for chest in row {
            match &chest.opening_state {
                OpeningState::Open | OpeningState::Closed => (),
                _ => {
                    return false;
                }
            }
        }
    }
    true
}

//        ====================== Pretty Printing =====================        //
impl std::fmt::Display for StateManager {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let mut turn_state_string = String::from("tutorial");
        if let GameState::Intro(IntroState::ChestFall(_)) = &self.game_state {
            turn_state_string = String::from("none");
        }
        let mut health_state_string = String::from("none");
        if let GameState::Playing(playing_state) = &self.game_state {
            turn_state_string = playing_state.turn_state.to_string();
            health_state_string = format!("{},{}",
                                          playing_state.red_health_state.src_amount,
                                          playing_state.blue_health_state.src_amount);
        } else if let GameState::Over(_, _, _) = &self.game_state {
            turn_state_string = String::from("over");
        }
        let mut q: Vec<String> = vec![];
        for row in &self.chest_states {
            for chest in row {
                q.push(chest.to_string())
            }
        }
        let chest_states_string = q.join(";");
        write!(f, "{}:{}:{}", turn_state_string, health_state_string, chest_states_string)
    }
}

impl std::fmt::Display for TurnState {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        use TurnState::*;
        let s = match &self {
            RedCluing => String::from("redcluing"),
            BlueCluing => String::from("bluecluing"),
            RedCluingEnd(_,clue) => {
                format!("redguessing,{},{},{}", clue.word, clue.num, "none")
            }
            RedGuessing(clue, proposed_guess) => {
                let pg_str = match proposed_guess {
                    Some((row,col)) => format!("{}{}", row, col),
                    None => format!("none"),
                };
                format!("redguessing,{},{},{}", clue.word, clue.num, pg_str)
            }
            RedGuessingEnd(clue) => {
                format!("redguessing,{},{},{}", clue.word, clue.num, "none")
            }
            BlueCluingEnd(_,clue) => {
                format!("blueguessing,{},{},{}", clue.word, clue.num, "none")
            }
            BlueGuessing(clue, proposed_guess) => {
                let pg_str = match proposed_guess {
                    Some((row,col)) => format!("{}{}", row, col),
                    None => format!("none"),
                };
                format!("blueguessing,{},{},{}", clue.word, clue.num, pg_str)
            }
            BlueGuessingEnd(clue) => {
                format!("blueguessing,{},{},{}", clue.word, clue.num, "none")
            }
        };
        println!("TurnState {}", s); //TODO: remove
        write!(f, "{}", s)
    }
}
    
impl std::fmt::Display for ChestState {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{},{},{}", self.word, self.opening_state, self.contents)
    }
}

impl std::fmt::Display for ChestContent {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        use ChestContent::*;
        let s = match self {
            Empty => "empty",
            Bomb1 => "bomb1",
            Bomb2 => "bomb2",
            Bomb3 => "bomb3",
            Bomb4 => "bomb4",
            Sword1 => "sword1",
            Sword2 => "sword2",
            Heal3 => "heal3",
        };
        write!(f, "{}", s)
    }
}

impl std::fmt::Display for OpeningState {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        use OpeningState::*;
        let s = match self {
            Open => "open",
            _ => "closed",
        };
        write!(f, "{}", s)
    }
}

// only for debug
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
