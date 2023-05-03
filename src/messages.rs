//==================================<===|===>=================================//
#![allow(dead_code)]
//use controlpads::*;
use crate::utility::*;
use crate::state::StateManager;

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
    StateRequest,
}

pub enum InputMessage {
    PrintTurn,
    PrintChests,
    //
    
    //
    Ack,
    Role(Role),
    Clue(Clue),
    Guess(usize, usize),
    Second(bool), // true for support, false for dissent
}

//============================== MessageManager ==============================//
// TODO: refactor: the division of labor between MessageManager and
// ClientManager doesn't really make sense
pub struct MessageManager {
    simulated_messages: Vec<InputMessage>,
    client_manager: ClientManager,
    clients_needing_state: Vec<Handle>,
}

impl MessageManager {
    pub fn new() -> Self {
        Self {
            simulated_messages: vec![],
            client_manager: ClientManager::new(),
            clients_needing_state: vec![],
        }
    }

    pub fn get_input_messages(&mut self) -> Vec<InputMessage> {
        let mut input_messages = vec![];
        match self.client_manager.get_messages() {
            Ok(raw_messages) => {
                for (handle, msg) in raw_messages {
                    let pm = parse_message(msg);
                    if let Some(InMessage::Input(InputMessage::Role(role))) = pm {
                        self.client_manager.assign_role(handle.clone(), role);
                        self.clients_needing_state.push(handle);
                    } else if let Some(InMessage::Input(input_message)) = pm {
                        // add this input message to the vec to be returned
                        input_messages.push(input_message);
                    } else if let Some(InMessage::StateRequest) = pm {
                        // take note of the client who requested state
                        self.clients_needing_state.push(handle);
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

    pub fn needs_state(&self) -> bool {
        self.clients_needing_state.len() > 0
    }

    pub fn send_state(&mut self, state: &StateManager) {
        for handle in std::mem::take(&mut self.clients_needing_state) {
            self.client_manager.send_state(&handle, &state.to_string());
        }
    }

    pub fn send_state_to_all(&mut self, state: &StateManager) {
        self.client_manager.send_state_to_all(&state.to_string());
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
    
    fn get_messages(&mut self) -> Result<Vec<(Handle, String)>> {
        if controlpads::clients_changed()? {
            self.clients = controlpads::get_client_handles()?;
        }
        let mut all_messages: Vec<_> = vec![];
        for handle in &self.clients {
            let messages = controlpads::get_messages(handle)?;
            for msg in messages {
                all_messages.push((handle.to_string(), msg));
            }
        }
        Ok(all_messages)
    }

    fn send_state(&self, handle: &Handle, state_suffix: &String) {
        let state_string = format!("state:{}:{}", self.role_string(handle),
                                   state_suffix);
        let result = controlpads::send_message(handle, &state_string);
        if let Err(e) = result {
            println!("Warning: failed to send state to {}: {}", handle, e);
        }
    }

    fn send_state_to_all(&self, state_suffix: &String) {
        if let Some(h) = self.red_cluegiver.as_ref() {
            self.send_state(h, state_suffix);
        }
        if let Some(h) = self.blue_cluegiver.as_ref() {
            self.send_state(h, state_suffix);
        }
        for h in &self.red_guessers {
            self.send_state(h, state_suffix);
        }
        for h in &self.blue_guessers {
            self.send_state(h, state_suffix);
        }
    }
    
    fn role_string(&self, handle: &Handle) -> String {
        if let Some(h) = self.red_cluegiver.as_ref() {
            if h == handle {
                return "redcluer".to_string();
            }
        }
        if let Some(h) = self.blue_cluegiver.as_ref() {
            if h == handle {
                return "bluecluer".to_string();
            }
        }
        if self.red_guessers.iter().any(|s| s == handle) {
            return "redguesser".to_string();
        }
        if self.blue_guessers.iter().any(|s| s == handle) {
            return "blueguesser".to_string();
        }
        return "choosing".to_string();
    }

    fn assign_role(&mut self, handle: Handle, role: Role) {
        match role {
            Role::RedCluer => {
                self.red_cluegiver = Some(handle);
            }
            Role::BlueCluer => {
                self.blue_cluegiver = Some(handle);
            }
            Role::RedGuesser => {
                self.red_guessers.push(handle);
            }
            Role::BlueGuesser => {
                self.blue_guessers.push(handle);
            }
        }
    }
}

//================================== Helpers =================================//
fn parse_message(message: String) -> Option<InMessage> {
    use InMessage::*;
    let parts: Vec<_> = message.split(':').collect();
    match parts[0] {
        "staterequest" => {
            return Some(StateRequest);
        }
        "exit" => {
            return None;
        }
        "input" => {
            let q: Vec<_> = parts[1].split(",").collect();
            match parse_input_message(q) {
                Ok(input_message) => {
                    return Some(Input(input_message));
                }
                Err(e) => {
                    println!("Warning: error while parsing '{}': {}", &message, e);
                }
                
            }
            
        }
        "warn" => {
            let q = &parts[1..];
            let w = q.join(" ");
            println!("ControlpadWarning:{}", q.join(" "));
            return Some(Warn(w));
        }
        _ => {
            println!("Warning: unrecognized message from controlpad: {}", &message);
        }
    }
    None
}

fn parse_input_message(parts: Vec<&str>) -> Result<InputMessage> {
    if parts.len() == 0 {
        return Err("input message specified but no content".into());
    }
    if parts[0] == "ack" {
        if parts.len() != 1 {
            return Err("wrong number of arguments for ack".into());
        }
        Ok(InputMessage::Ack)
    } else if parts[0] == "role" {
        if parts.len() != 2 {
            return Err("wrong number of arguments for role".into());
        }
        Ok(InputMessage::Role(Role::from_str(parts[1])?))
    } else if parts[0] == "clue" {
        if parts.len() != 3 {
            return Err("wrong number of arguments for clue".into());
        }
        let clue_given = parts[1].to_string();
        let num = parts[2].parse::<usize>()?;
        Ok(InputMessage::Clue(Clue::new(clue_given, num)))
    } else if parts[0] == "guess" {
        if parts.len() != 3 {
            return Err("wrong number of arguments for guess".into());
        }
        let row = parts[1].parse::<usize>()?;
        let col = parts[2].parse::<usize>()?;
        Ok(InputMessage::Guess(row, col))
    } else if parts[0] == "second" {
        if parts.len() != 2 {
            return Err("wrong number of arguments for second".into());
        }
        let support = match parts[1] {
            "support" => true,
            "dissent" => false,
            _ => return Err("second must be support or dissent".into()),
        };
        Ok(InputMessage::Second(support))
    } else {
        Err(format!("{} is unrecognized or not yet implemented", parts[0]).into())
    }
}

//==================================<===|===>=================================//
