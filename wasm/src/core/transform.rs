use serde::{Deserialize, Serialize};

pub type Pos2D = (u32, u32);
pub type Scale2D = (f32, f32);

#[derive(Serialize, Deserialize, Clone)]
pub struct Transform {
    pub position: Pos2D,
    pub rotation: f32,
    pub scale: Scale2D,
}

impl Default for Transform {
    fn default() -> Self {
        Self {
            position: (0, 0),
            rotation: 0.0,
            scale: (1.0, 1.0),
        }
    }
}
