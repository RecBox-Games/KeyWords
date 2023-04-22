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
    PrintTurn,
    PrintChests,
    //
    Ack,
    Clue(Clue),
    Guess(usize, usize),
    Second(bool), // true for support, false for dissent
}

//============================== MessageManager ==============================//
pub struct MessageManager {
    simulated_messages: Vec<InputMessage>,
    client_manager: ClientManager
}

impl MessageManager {
    pub fn new() -> Self {
        Self {
            simulated_messages: vec![],
            client_manager: ClientManager::new(),
        }
    }

    pub fn get_input_messages(&mut self) -> Vec<InputMessage> {
        let mut input_messages = vec![];
        match self.client_manager.get_messages() {
            Ok(raw_messages) => {
                for raw_msg in raw_messages {
                    if let Some(input_message) = parse_message(raw_msg) {
                        input_messages.push(input_message);
                    }
                }
            }
            Err(e) =>{
                println!("Warning: error in get_messages: {}", e);
            }
        }
        //
        let simulated = std::mem::take(&mut self.simulated_messages);
        input_messages.extend(simulated);
        input_messages
    }

    pub fn handle_keyboard_input(&mut self, input: String) {
        let parts: Vec<_> = input.split_whitespace().collect();
        if parts.len() == 0 {
            return;
        }
        match parts[0] {
            "warn" => {
                let q = &parts[1..];
                println!("{}", q.join(" "));
            }
            "t" => {
                self.simulated_messages.push(InputMessage::PrintTurn)
            }
            "p" => {
                self.simulated_messages.push(InputMessage::PrintChests)
            }
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
            "g" => {
                if parts.len() == 3 {
                    if let Ok(col) = parts[1].parse::<usize>() {
                        if let Ok(row) = parts[2].parse::<usize>() {
                            self.simulated_messages.push(InputMessage::Guess(row, col));
                        }
                    }
                }
            }
            "s" => {
                if parts.len() == 2 {
                    if parts[1] == "s" {
                        self.simulated_messages.push(InputMessage::Second(true));
                    } else if parts[1] == "d" {
                        self.simulated_messages.push(InputMessage::Second(false));
                    }
                }
            }
            _ => ()
        }
    }
}

//=============================== ClientManager ==============================//
type Handle = String;
struct ClientManager {
    clients: Vec<Handle>,
    red_cluegiver: Option<Handle>,
    blue_cluegiver: Option<Handle>,
    red_guessers: Vec<Handle>,
    blue_guessers: Vec<Handle>,
}

impl ClientManager {
    fn new() -> Self {
        Self {
            clients: vec![],
            red_cluegiver: None,
            blue_cluegiver: None,
            red_guessers: vec![],
            blue_guessers: vec![],
        }
    }
    
    fn get_messages(&mut self) -> Result<Vec<String>> {
        if controlpads::clients_changed()? {
            self.clients = controlpads::get_client_handles()?;
        }
        let mut all_messages: Vec<String> = vec![];
        for handle in &self.clients {
            let messages = controlpads::get_messages(handle)?;
            all_messages.extend(messages);
        }
        Ok(all_messages)
    }
}

//================================== Helpers =================================//
fn parse_message(message: String) -> Option<InputMessage> {
    let parts: Vec<_> = message.split(':').collect();
    match parts[0] {
        "input" => {
            let q: Vec<_> = parts[1..].iter().collect();
            match parse_input_message(q) {
                Ok(input_message) => {
                    return Some(input_message);
                }
                Err(e) => {
                    println!("Warning: error while parsing {}: {}", &message, e);
                }
                
            }
            
        }
        "warn" => {
            let q = &parts[1..];
            println!("ControlpadWarning:{}", q.join(" "));
        }
        _ => {
            println!("Warning: unrecognized message from controlpad: {}", &message);
        }
    }
    None
}

fn parse_input_message(parts: Vec<&&str>) -> Result<InputMessage> {
    if parts.len() == 1 && *parts[0] == "ack" {
        Ok(InputMessage::Ack)
    } else {
        Err("Not an ack".into())
    }
}

//==================================<===|===>=================================//
