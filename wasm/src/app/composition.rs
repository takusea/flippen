use serde::{Deserialize, Serialize};

use crate::app::clip::{Clip, ClipMetadata};
use crate::core::image::Image;

#[derive(Serialize, Deserialize)]
pub struct Composition {
    pub clips: Vec<Clip>,
}

impl Composition {
    pub fn new() -> Self {
        Self { clips: Vec::new() }
    }

    pub fn add_clip(&mut self, start: u32, duration: u32, track_index: usize) -> Clip {
        let id = self.clips.len() as u32;
        let clip = Clip {
            id,
            start,
            track_index,
            duration,
            image: Image::new(1280, 720),
        };
        self.clips.push(clip.clone());
        clip
    }

    pub fn delete_clip(&mut self, clip_id: u32) {
        let index = self
            .clips
            .iter()
            .position(|clip| clip.id == clip_id)
            .unwrap();
        self.clips.remove(index);
    }

    pub fn move_clip(&mut self, id: u32, new_start: u32, new_track_index: usize) {
        if let Some(clip) = self.clips.iter_mut().find(|c| c.id == id) {
            clip.start = new_start;
            clip.track_index = new_track_index;
        }
    }

    pub fn get_clips(&self) -> &Vec<Clip> {
        &self.clips
    }

    pub fn find_clip(&mut self, clip_id: u32) -> Option<&mut Clip> {
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
