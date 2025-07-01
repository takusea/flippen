use crate::core::image::Image;

use serde::{ser::SerializeStruct, Serialize, Serializer};

#[derive(Clone)]
pub struct Clip {
    pub id: u32,
    pub start: u32,
    pub track_index: usize,
    pub frames: Vec<Image>,
}

impl Clip {
    pub fn render(&self, time: usize) -> &Image {
        &self.frames[time - self.start as usize]
    }

    pub fn get_frame(&self, time: usize) -> &Image {
        &self.frames[time - self.start as usize]
    }

    pub fn get_frame_mut(&mut self, time: usize) -> &mut Image {
        &mut self.frames[time - self.start as usize]
    }

    pub fn set_frame(&mut self, time: usize, frame: Image) {
        self.frames[time - self.start as usize] = frame;
    }
}

impl Serialize for Clip {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("Clip", 4)?;
        state.serialize_field("id", &self.id)?;
        state.serialize_field("start", &self.start)?;
        state.serialize_field("track_index", &self.track_index)?;
        state.serialize_field("duration", &self.frames.len())?;
        state.end()
    }
}
