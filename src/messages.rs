//==================================<===|===>=================================//
use ggez::event::KeyCode;
use targetlib::{Button, Panel, ControlDatum, CPSpec};
use controlpads::*;

//================================ OutMessage ================================//
enum OutMessage {
    State(StateMessage),
    Notify(String),
    Syn,
}

struct StateMessage {}

//================================= InMessage ================================//
enum InMessage {
    Input(InputMessage),
    Warn(String),
}

pub enum InputMessage {
    Ack,
}

//============================== MessageManager ==============================//
pub struct MessageManager {
    simulated_messages: Vec<InputMessage>,
    //client_map: HashMap<Role, ClientHandle>,
}

impl MessageManager {
    pub fn new() -> Self {
        Self {
            simulated_messages: vec![],
        }
    }
    pub fn get_messages(&mut self) -> Vec<InputMessage> {
        std::mem::take(&mut self.simulated_messages)
    }

    pub fn handle_keyboard_input(&mut self, key: KeyCode) {
        match key {
            KeyCode::S => {
                println!("S");
                self.simulated_messages.push(InputMessage::Ack)
            }
            _ => ()
        }
    }
}
//==================================<===|===>=================================//
