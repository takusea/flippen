use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::app::clip::Clip;
use crate::core::image::Image;

#[derive(Serialize, Deserialize)]
pub struct Composition {
    pub clips: Vec<Clip>,
    pub hidden_layers: Vec<usize>,
}

impl Composition {
    pub fn new() -> Self {
        Self {
            clips: Vec::new(),
            hidden_layers: Vec::new(),
        }
    }

    pub fn add_clip(&mut self, clip: Clip) {
        self.clips.push(clip);
    }

    pub fn delete_clip(&mut self, clip_id: Uuid) -> Option<Clip> {
        if let Some(pos) = self
            .clips
            .iter()
            .position(|clip| clip.metadata.id == clip_id)
        {
            Some(self.clips.remove(pos))
        } else {
            None
        }
    }

    pub fn move_clip(&mut self, clip_id: Uuid, new_start: u32, new_layer_index: usize) {
        if let Some(clip) = self.clips.iter_mut().find(|c| c.metadata.id == clip_id) {
            clip.metadata.start = new_start;
            clip.metadata.layer_index = new_layer_index;
        }
    }

    pub fn get_clips(&self) -> &Vec<Clip> {
        &self.clips
    }

    pub fn find_clip(&mut self, clip_id: Uuid) -> Option<&mut Clip> {
        self.clips
            .iter_mut()
            .find(|clip| clip.metadata.id == clip_id)
    }

    pub fn show_layer(&mut self, layer_index: usize) {
        self.hidden_layers.push(layer_index);
    }

    pub fn hide_layer(&mut self, layer_index: usize) {
        if let Some(index) = self.hidden_layers.iter().position(|i| i == &layer_index) {
            self.hidden_layers.remove(index);
        }
    }

    pub fn render_frame(&self, frame_index: u32, width: u32, height: u32) -> Image {
        let mut clips: Vec<&Clip> = self
            .clips
            .iter()
            .filter(|clip| clip.contains_frame(frame_index))
            .filter(|clip| !self.hidden_layers.contains(&clip.metadata.layer_index))
            .collect();

        clips.sort_by_key(|clip| clip.metadata.layer_index);

        clips
            .into_iter()
            .map(|clip| clip.render(frame_index as usize))
            .fold(Image::new(width, height), |mut acc, img| {
                acc.composite(&img, 0, 0);
                acc
            })
    }
}
