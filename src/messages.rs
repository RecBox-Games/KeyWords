//==================================<===|===>=================================//
#![allow(dead_code)]
//use controlpads::*;
use crate::utility::*;

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
    Clue(Clue),
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

    pub fn handle_keyboard_input(&mut self, input: String) {
        let parts: Vec<_> = input.split_whitespace().collect();
        if parts.len() == 0 {
            return;
        }
        match parts[0] {
            "a" => {
                self.simulated_messages.push(InputMessage::Ack)
            }
            "c" => {
                if parts.len() == 3 {
                    let clue = parts[1].to_string();
                    if let Ok(num) = parts[2].parse::<usize>() {
                        self.simulated_messages.push(InputMessage::Clue(Clue::new(clue, num)));
                    }
                }
            }
            _ => ()
        }
    }
}
//==================================<===|===>=================================//
