//Import libraries
use ggez::{audio, Context};
use ggez::audio::{Source, SoundSource};
use crate::events::TickEvent;
use crate::state::*;
use crate::utility::ROWS;
use crate::utility::COLUMNS;
use std::collections::HashMap;

type Ctx<'a> = &'a mut Context;

#[derive(Eq, Hash, PartialEq, Copy, Clone)]
pub enum Audio {
    Explode,
    Hum,
    Womp,
    Slice,
    Chestfall,
    Unlock,
    Drumroll,
    EmptySplash,
    HeartForms,
    Select,
}



struct PreviousStates{
    //Used for detecting of selecting chest (to compare current frame with the previous frame)
    is_chest_selected: bool,
    is_title: bool,
    is_chest_opening: bool,

    //-1 if not deploying, 0 if empty, 1 if good, 2 if not good
    content_chest_deploying: i32,
    is_chest_unlocking: bool,
   
}

impl PreviousStates {
    pub fn new() -> Self {
        PreviousStates {
            is_chest_selected: false,
            is_title: false,
            is_chest_opening: false,
            content_chest_deploying: -1,
            is_chest_unlocking: false,
        }
    }
}

pub struct AudioManager {
    previous_states: PreviousStates,
    is_audio_initialized: bool,
    sounds: HashMap<Audio, Source>,
}
impl AudioManager {
    pub fn new(ctx: &mut Context) -> Self {
        AudioManager{
            previous_states: PreviousStates::new(),
            is_audio_initialized: false,
            sounds: HashMap::new(),
        }
    }

    //Put audio into hashmap
    fn initialize_audio(&mut self, ctx: Ctx) {
        self.is_audio_initialized = true;
        self.sounds.insert(Audio::Chestfall, Source::from_data(ctx, include_bytes!("../resources/audio/chestfall.mp3").to_vec().into()).unwrap());
        self.sounds.insert(Audio::Slice, Source::from_data(ctx, include_bytes!("../resources/audio/slice.mp3").to_vec().into()).unwrap());
        self.sounds.insert(Audio::Explode, Source::from_data(ctx, include_bytes!("../resources/audio/explode.mp3").to_vec().into()).unwrap());
        self.sounds.insert(Audio::EmptySplash, Source::from_data(ctx, include_bytes!("../resources/audio/empty_splash.mp3").to_vec().into()).unwrap());
        self.sounds.insert(Audio::Hum, Source::from_data(ctx, include_bytes!("../resources/audio/good_hum.mp3").to_vec().into()).unwrap());
        self.sounds.insert(Audio::Womp, Source::from_data(ctx, include_bytes!("../resources/audio/bad_womp.mp3").to_vec().into()).unwrap());
        self.sounds.insert(Audio::Select, Source::from_data(ctx, include_bytes!("../resources/audio/select.mp3").to_vec().into()).unwrap());
        self.sounds.insert(Audio::Unlock, Source::from_data(ctx, include_bytes!("../resources/audio/unlock.mp3").to_vec().into()).unwrap());
        self.sounds.insert(Audio::Drumroll, Source::from_data(ctx, include_bytes!("../resources/audio/drumroll.mp3").to_vec().into()).unwrap());
        self.sounds.insert(Audio::HeartForms, Source::from_data(ctx, include_bytes!("../resources/audio/heart_forms.mp3").to_vec().into()).unwrap());

    }



    
    //Play sounds
    fn play_sounds(&mut self, ctx: Ctx, audio: Audio){
        self.sounds.get_mut(&audio).unwrap().play(ctx).unwrap();
    }

   


    pub fn update(&mut self, state_manager: &StateManager, ctx: Ctx) {
        if !self.is_audio_initialized {
            self.initialize_audio(ctx);
        }
        let chest_content = state_manager.content_chest_deploying();
        if(!state_manager.is_title()  & self.previous_states.is_title) {
            //INSERT CHEST FALL SOUND HERE
            self.play_sounds(ctx, Audio::Chestfall);            
        }
        
        if(state_manager.something_selected()  & !self.previous_states.is_chest_selected) {
            //INSERT SELECTION SOUND HERE
            self.play_sounds(ctx, Audio::Select);            
        }
       
        if(state_manager.is_chest_opening() & !self.previous_states.is_chest_opening){
            //INSERT DRUMROLL SOUND HERE
            self.play_sounds(ctx, Audio::Drumroll);
        }
        if(state_manager.is_unlocking()  & !self.previous_states.is_chest_unlocking) {
            //INSERT UNLOCKING SOUND HERE
            self.play_sounds(ctx, Audio::Unlock);
        }
        if(chest_content != self.previous_states.content_chest_deploying) {
            if chest_content == 1 {
                //INSERT GOOD HUM HERE
                self.play_sounds(ctx, Audio::Hum);
            }
            else if chest_content ==  2{
                //INSERT EXPLODE HERE
                self.play_sounds(ctx, Audio::Womp);
            }
            else if chest_content ==  0{
                //INSERT EMPTY SPLASH HERE
                self.play_sounds(ctx, Audio::EmptySplash);
            }
        }
        
      
        //Update previous state
        self.previous_states.is_chest_selected = state_manager.something_selected();
        self.previous_states.is_title = state_manager.is_title();
        self.previous_states.is_chest_opening = state_manager.is_chest_opening();
        self.previous_states.content_chest_deploying = chest_content;
        self.previous_states.is_chest_unlocking = state_manager.is_unlocking();
    }
}



impl StateManager {
    fn something_selected(&self) -> bool {
        if let GameState::Playing(ps) = &self.game_state {
            ps.turn_state.proposed_guess().is_some()
        } else {
            false
        }
    }
    
    fn is_title(&self) -> bool {
        if let GameState::Intro(ps) = &self.game_state {
            if let IntroState::Title(_) = ps {
                true 
            }
            else {
                false
            }

        }
        else {
            false
        }
    }

    fn is_unlocking(&self) -> bool {
        for i in 0..ROWS {
            for j in 0..COLUMNS {
                if let OpeningState::Opening(_) = &self.chest_states[i][j].opening_state {
                    return true
                }
            }
        }
        return false;

    }
    
    fn is_chest_opening(&self) -> bool {
        if let GameState::Playing(_) = &self.game_state {
            for i in 0..ROWS {
                for j in 0..COLUMNS {
                    if let OpeningState::Growing(_) = &self.chest_states[i][j].opening_state {
                        return true;
                    }
                }

            }
        }
        return false;
    }
    fn content_chest_deploying(&self) -> i32 {
        use ChestContent::*;
        
        if let GameState::Playing(_) = &self.game_state {
            for i in 0..ROWS {
                for j in 0..COLUMNS {
                    if let OpeningState::Deploying(_) = &self.chest_states[i][j].opening_state {
                        match self.chest_states[i][j].contents {
                            Bomb1 | Bomb2 | Bomb3 | Bomb4 => {
                                return 2;
                            }
                            Empty => {
                                return 0;
                            }
                            Sword1 | Sword2 | Heal2 => {
                                return 1;
                            }
                        }
                    }
                }
            }
            return -1;
        }
        return -1;
    }

    fn projectile_chest_deploying(&self) -> i32 {
        if let GameState::Playing(_) = &self.game_state {
            for i in 0..ROWS {
                for j in 0..COLUMNS {
                }
                
            }
            

        }
        

        return -1;
    }

    
    



    
    /*
    fn projectile_good(&self, ctx: Ctx) -> bool {
        use ChestContent::*;
        use OpeningState::*;

        if let GameState::Playing(ps) = &self.game_state {
            for i in 0..ROWS {
                for j in 0..COLUMNS {
                    if self.chest_states[i][j].opening_state {
                        true
                    }


                    
                    if self.chest_states[i][j].                {
                        true
                    }
                }
            }

        }
        
        
        // let GameState::Playing(ps)  = &self.game_state{
         // if self.chest_states 
      //}
       //lse {
        //  false
      false 
    }
     */
  
}

