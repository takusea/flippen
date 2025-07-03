use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ProjectSettings {
    pub width: u32,
    pub height: u32,
    pub frame_rate: u32,
}
