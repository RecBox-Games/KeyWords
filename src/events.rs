//==================================<===|===>=================================//
use crate::state::Projectile;

//================================= TickEvent ================================//
pub enum TickEvent {
    None,
    Done,
    //
    NeedsUpdate,
    //
    Syn,
    Deploy,
    ProjectileHit(Projectile),
    DoneOpening,
    GameOver,
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
