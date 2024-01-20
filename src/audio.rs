//Import libraries
use ggez::{audio, Context};
use ggez::audio::{Source, SoundSource};
use crate::state::*;

type Ctx<'a> = &'a mut Context;

struct PreviousStates{
    //Used for detecting of selecting chest (to compare current frame with the previous frame)
    is_chest_selected: bool,
}
impl PreviousStates {
    pub fn new() -> Self {
        PreviousStates {
            is_chest_selected: false,
        }
    }
}

pub struct AudioManager {
    previous_states: PreviousStates,
    sound_source: audio::Source,
}
impl AudioManager {
    pub fn new(ctx: &mut Context) -> Self {
        AudioManager{
            previous_states: PreviousStates::new(),
            sound_source: Source::from_data(ctx, include_bytes!("../resources/audio/select.mp3").to_vec().into()).expect("Load complete"),
        }
    }


    //Play sounds
    fn play_sounds(&mut self, ctx: Ctx){
        println!("\n\n\n\nPlay Sounds called\n\n\n\n");
        self.sound_source.play_detached(ctx);
    }
    
    pub fn update(&mut self, state_manager: &StateManager, ctx: Ctx) {        
        //Update previous state_manager
        if(state_manager.chest_selected & !self.previous_states.is_chest_selected) {
            self.play_sounds(ctx);
            
            //Update previous state
            self.previous_states.is_chest_selected = state_manager.something_selected();
        }
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
}
