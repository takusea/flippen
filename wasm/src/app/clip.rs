use crate::core::image::Image;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ClipMetadata {
    pub id: u32,
    pub start: u32,
    pub track_index: usize,
    pub duration: u32,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Clip {
    pub id: u32,
    pub start: u32,
    pub track_index: usize,
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
            track_index: self.track_index,
            duration: self.duration,
        }
    }
}
