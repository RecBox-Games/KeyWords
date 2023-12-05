//==================================<===|===>=================================//
use crate::state::Projectile;

//================================= TickEvent ================================//
#[derive(PartialEq)]
pub enum TickEvent {
    None,
    Done,
    //
    Deploy,
    ProjectileHit(Projectile),
    DoneOpening,
    NeedsUpdate,
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
    pub fn needs_update(&self) -> bool {
        if let TickEvent::NeedsUpdate = self {
            true
        } else {
            false
        }
    }
}
//==================================<===|===>=================================//
