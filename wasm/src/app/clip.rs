use crate::core::image::Image;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ClipMetadata {
    pub id: u32,
    pub start: u32,
    pub track_index: usize,
    pub duration: usize,
}

#[derive(Clone)]
pub struct Clip {
    pub id: u32,
    pub start: u32,
    pub track_index: usize,
    pub frames: Vec<Image>,
}

impl Clip {
    pub fn render(&self, frame_index: usize) -> &Image {
        &self.frames[frame_index - self.start as usize]
    }

    pub fn get_frame(&self, frame_index: usize) -> &Image {
        &self.frames[frame_index - self.start as usize]
    }

    pub fn get_frame_mut(&mut self, frame_index: usize) -> &mut Image {
        &mut self.frames[frame_index - self.start as usize]
    }

    pub fn set_frame(&mut self, frame_index: usize, frame: Image) {
        self.frames[frame_index - self.start as usize] = frame;
    }

    pub fn to_metadata(&self) -> ClipMetadata {
        ClipMetadata {
            id: self.id,
            start: self.start,
            track_index: self.track_index,
            duration: self.frames.len(),
        }
    }
}
