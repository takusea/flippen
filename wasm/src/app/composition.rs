use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::app::clip::Clip;
use crate::core::image::Image;

#[derive(Serialize, Deserialize)]
pub struct Composition {
    pub clips: Vec<Clip>,
}

impl Composition {
    pub fn new() -> Self {
        Self { clips: Vec::new() }
    }

    pub fn add_clip(&mut self, clip: Clip) {
        self.clips.push(clip);
    }

    pub fn delete_clip(&mut self, clip_id: Uuid) -> Option<Clip> {
        if let Some(pos) = self.clips.iter().position(|clip| clip.id == clip_id) {
            Some(self.clips.remove(pos))
        } else {
            None
        }
    }

    pub fn move_clip(&mut self, clip_id: Uuid, new_start: u32, new_track_index: usize) {
        if let Some(clip) = self.clips.iter_mut().find(|c| c.id == clip_id) {
            clip.start = new_start;
            clip.track_index = new_track_index;
        }
    }

    pub fn get_clips(&self) -> &Vec<Clip> {
        &self.clips
    }

    pub fn find_clip(&mut self, clip_id: Uuid) -> Option<&mut Clip> {
        self.clips.iter_mut().find(|clip| clip.id == clip_id)
    }

    pub fn render_frame(&self, frame_index: u32, width: u32, height: u32) -> Image {
        let mut frame = Image::new(width, height);

        for clip in self.clips.iter() {
            if clip.start <= frame_index && frame_index < clip.start + clip.duration {
                let img = clip.render(frame_index as usize);
                frame.composite(img, 0, 0);
            }
        }

        frame
    }
}
