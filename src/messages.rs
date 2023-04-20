//==================================<===|===>=================================//

use targetlib::{Button, Panel, ControlDatum, CPSpec};
use controlpads::*;


/*enum ControlpadMessage {
    Out(OutMessage),
    In(InMessage),
}
 */

//================================ OutMessage ================================//
enum OutMessage {
    State(StateMessage),
    Notify(String),
    Syn,
}

//================================= InMessage ================================//
enum InMessage {
    Input(InputMessage),
    Warn(String),
    Ack,
}

//============================== MessageManager ==============================//
pub struct MessageManager {
    client_map: HashMap<Role, ClientHandle>,

}

//        ===================== Message Handling =====================        //
pub fn get_messages() -> Vec<InMessage> {

}

pub fn send_message
    
//==================================<===|===>=================================//
