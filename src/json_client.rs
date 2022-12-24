// This interface is bad. This code should be trashed soon.

use controlpads::ClientHandle;
use targetlib::{CPEvent, CPSpec};

pub enum ClientState {
    NoSize,
    NewSized(u32, u32),
    Sized(u32, u32),
}

fn old_sized(cs: &mut ClientState) {
    if let ClientState::NewSized(w,h) = cs {
	*cs = ClientState::Sized(*w,*h)
    };
}

pub struct Client {
    pub handle: ClientHandle,
    pub state: ClientState,
}

impl Client {
    pub fn new(handle: ClientHandle) -> Self {
	let client = Client {
	    handle: handle,
	    state: ClientState::NoSize,
	};
	// send request for dimensions
	controlpads::send_message(&client.handle, "DimensionsRequest")
	    .unwrap_or_else(|_| println!("Warning: unable to send dimensions request"));
	client
    }

    pub fn get_events(&mut self) -> Vec<CPEvent> {
	let mut ret: Vec<CPEvent> = vec![];
	if let Ok(all_msgs) = controlpads::get_messages(&self.handle) {
	    for msg in all_msgs {
		if msg.starts_with("{\"Dimensions\":") {
		    // sorry about these variables
		    println!("got dimensions");
		    let a: Vec<&str> = msg.split("[").collect();
		    if a.len() != 2 {
			println!("Warning: Bad dimensions message (a) {}", &msg);
			continue;
		    }
		    let b: Vec<&str> = a[1].split("]").collect();
		    if b.len() != 2 {
			println!("Warning: Bad dimensions message (b) {}", &msg);
			continue;
		    }
		    let c: Vec<&str> = b[0].split(",").collect();
		    if c.len() != 2 {
			println!("Warning: Bad dimensions message (c) {}", &msg);
			continue;
		    }
		    let w_ = c[0].to_string().parse::<u32>();
		    let h_ = c[1].to_string().parse::<u32>();
		    match (w_, h_) {
			(Ok(w), Ok(h)) => {
			    self.state = ClientState::NewSized(w,h);
			}
			(_,_) => {
			    println!("Warning: Bad dimensions message (w,h) {}", &msg);
			}
		    }
		    continue;
		}

		let res = serde_json::from_str::<CPEvent>(&msg);
		match res {
		    Ok(cpevent) => {
			ret.push(cpevent);
		    }
		    Err(e) => {
			println!("Warning: {}, Bad message. Not Dimensions or parsable event: {}", e, &msg);
		    }
		}
	    }
	} else {
	    println!("Warning: failed to get _messages from {}", &self.handle);
	}
	ret
    }

    pub fn assign_spec(&mut self, spec: CPSpec) {
	if let Ok(msg) = serde_json::to_string(&spec) {
	    controlpads::send_message(&self.handle, &msg)
		.unwrap_or_else(|_| println!("Warning: unable to send spec msg: {}", &msg));
	    old_sized(&mut self.state);
	} else {
	    println!("Warning: unable to stringify spec: {:?}", spec);
	}
    }
}


pub fn clients_from_client_handles(handles: Vec<ClientHandle>) -> Vec<Client> {
    handles.into_iter().map(|h| Client::new(h) ).collect()//::<Vec::Client
}


