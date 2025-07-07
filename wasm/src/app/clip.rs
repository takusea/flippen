use crate::core::image::Image;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
pub struct ClipMetadata {
    pub id: Uuid,
    pub start: u32,
    pub layer_index: usize,
    pub duration: u32,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Clip {
    pub id: Uuid,
    pub start: u32,
    pub layer_index: usize,
    pub image: Image,
    pub duration: u32,
}

impl Clip {
    pub fn render(&self, frame_index: usize) -> &Image {
        &self.image
    }

    pub fn get_image(&self) -> &Image {
        &self.image
    }

    pub fn get_image_mut(&mut self) -> &mut Image {
        &mut self.image
    }

    pub fn set_image(&mut self, image: Image) {
        self.image = image;
    }

    pub fn to_metadata(&self) -> ClipMetadata {
        ClipMetadata {
            id: self.id,
            start: self.start,
            layer_index: self.layer_index,
            duration: self.duration,
        }
    }
}
