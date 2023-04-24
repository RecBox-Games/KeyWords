//==================================<===|===>=================================//
use crate::state::Projectile;

//================================= TickEvent ================================//
pub enum TickEvent {
    None,
    Done,
    //
    Syn,
    Deploy,
    ProjectileHit(Projectile),
    DoneOpening,
}

impl TickEvent {
    pub fn is_done(&self) -> bool {
        if let TickEvent::Done = self {
            true
        } else {
            false
        }
    }
}
//==================================<===|===>=================================//
