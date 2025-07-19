use crate::core::{image::Image, transform::Transform};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone)]
pub struct ClipMetadata {
    pub id: Uuid,
    pub start: u32,
    pub layer_index: usize,
    pub duration: u32,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Clip {
    pub metadata: ClipMetadata,
    pub transform: Transform,
    pub image: Image,
}

impl Clip {
    pub fn contains_frame(&self, frame_index: u32) -> bool {
        let is_after_start = self.metadata.start <= frame_index;
        let is_before_end = frame_index < self.metadata.start + self.metadata.duration;
        is_after_start && is_before_end
    }

    pub fn render(&self, _frame_index: usize) -> Image {
        self.image.transform(&self.transform)
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
}
