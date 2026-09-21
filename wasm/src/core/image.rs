use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize)]
pub struct Image {
    #[serde(with = "serde_bytes")]
    pub data: Vec<u8>,
    pub width: u32,
    pub height: u32,
}

impl Image {
    pub fn new(width: u32, height: u32) -> Self {
        Image {
            data: vec![0; (width * height * 4) as usize],
            width,
            height,
        }
    }
}
