// This interface is bad. This code should be trashed soon.

use controlpads::ClientHandle;
use targetlib::{CPEvent, CPSpec};

pub enum ClientState {
    NoSize,
    Sized(u32, u32),
}

#[derive(PartialEq, Clone, Copy)]
pub enum Role {
    Choosing,
    OrangeClueGiver,
    PurpleClueGiver,
    OrangeGuesser,
    PurpleGuesser,
}

pub struct Client {
    pub handle: ClientHandle,
    pub state: ClientState,
    pub needs_spec: bool,
    pub role: Role,
    pub w: u32,
    pub h: u32,
}

impl Client {
    pub fn new(handle: ClientHandle) -> Self {
	let client = Client {
	    handle: handle,
	    state: ClientState::NoSize,
	    needs_spec: false,
	    role: Role::Choosing,
	    w: 0,
	    h: 0,
	};
	// send request for dimensions
	println!("sending a dim req");
	controlpads::send_message(&client.handle, "DimensionsRequest")
	    .unwrap_or_else(|_| println!("Warning: unable to send dimensions request"));
	client
    }

    fn handle_message(&mut self, msg: String) -> Option<CPEvent> {
	if msg.starts_with("{\"Dimensions\":") {
	    println!("handling some dims");
	    // sorry about these variables
	    println!("got dimensions");
	    let a: Vec<&str> = msg.split("[").collect();
	    if a.len() != 2 {
		println!("Warning: Bad dimensions message (a) {}", &msg);
		return None;
	    }
	    let b: Vec<&str> = a[1].split("]").collect();
	    if b.len() != 2 {
		println!("Warning: Bad dimensions message (b) {}", &msg);
		return None;
	    }
	    let c: Vec<&str> = b[0].split(",").collect();
	    if c.len() != 2 {
		println!("Warning: Bad dimensions message (c) {}", &msg);
		return None;
	    }
	    let w_ = c[0].to_string().parse::<u32>();
	    let h_ = c[1].to_string().parse::<u32>();
	    match (w_, h_) {
		(Ok(w), Ok(h)) => {
		    self.state = ClientState::Sized(w,h);
		    println!("sized");
		    self.needs_spec = true;
		}
		(_,_) => {
		    println!("Warning: Bad dimensions message (w,h) {}", &msg);
		}
	    }
	    return None;
	}
	let res = serde_json::from_str::<CPEvent>(&msg);
	match res {
	    Ok(cpevent) => {
		Some(cpevent)
	    }
	    Err(e) => {
		println!("Warning: {}, Bad message. Not Dimensions or parsable event: {}", e, &msg);
		None
	    }
	}
    }
    
    pub fn get_events(&mut self) -> Vec<CPEvent> {
	let mut events: Vec<CPEvent> = vec![];
	if let Ok(all_msgs) = controlpads::get_messages(&self.handle) {
	    for msg in all_msgs {
		let maybe_event = self.handle_message(msg);
		if let Some(event) = maybe_event {
		    events.push(event);
		}
	    }
	} else {
	    println!("Warning: failed to get _messages from {}", &self.handle);
	}
	events
    }

    pub fn assign_spec(&mut self, spec: CPSpec) {
	if let Ok(msg) = serde_json::to_string(&spec) {
	    controlpads::send_message(&self.handle, &msg)
		.unwrap_or_else(|_| println!("Warning: unable to send spec msg: {}", &msg));
	    println!("spec assigned for {}", self.handle);
	    self.needs_spec = false;
	} else {
	    println!("Warning: unable to stringify spec: {:?}", spec);
	}
    }
}

pub fn clients_from_client_handles(handles: Vec<ClientHandle>) -> Vec<Client> {
    handles.into_iter().map(|h| Client::new(h) ).collect()//::<Vec::Client
}


