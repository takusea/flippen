use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::app::clip::Clip;
use crate::core::image::Image;
use crate::gpu::GpuRenderer;

const DEFAULT_LAYER_COUNT: usize = 100;

#[derive(Serialize, Deserialize, Clone, Copy, Default)]
pub struct Layer {
    #[serde(default)]
    pub hidden: bool,
    #[serde(default)]
    pub locked: bool,
}

#[derive(Serialize, Deserialize)]
pub struct Composition {
    pub clips: Vec<Clip>,
    pub layers: Vec<Layer>,
}

impl Composition {
    pub fn new() -> Self {
        Self {
            clips: Vec::new(),
            layers: vec![Layer::default(); DEFAULT_LAYER_COUNT],
        }
    }

    pub fn add_clip(&mut self, clip: Clip) {
        self.ensure_layer(clip.metadata.layer_index);
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
        self.ensure_layer(new_layer_index);
        if let Some(clip) = self.clips.iter_mut().find(|c| c.metadata.id == clip_id) {
            clip.metadata.start = new_start;
            clip.metadata.layer_index = new_layer_index;
        }
    }

    pub fn get_clips(&self) -> &Vec<Clip> {
        &self.clips
    }

    pub fn get_layers(&self) -> &[Layer] {
        &self.layers
    }

    pub fn get_clip(&self, clip_id: Uuid) -> Option<&Clip> {
        self.clips.iter().find(|clip| clip.metadata.id == clip_id)
    }

    pub fn find_clip(&mut self, clip_id: Uuid) -> Option<&mut Clip> {
        self.clips
            .iter_mut()
            .find(|clip| clip.metadata.id == clip_id)
    }

    pub fn ensure_layers(&mut self) {
        let clip_layer_count = self
            .clips
            .iter()
            .map(|clip| clip.metadata.layer_index + 1)
            .max()
            .unwrap_or_default();
        self.layers
            .resize(self.layers.len().max(clip_layer_count), Layer::default());
    }

    fn ensure_layer(&mut self, layer_index: usize) {
        self.layers
            .resize(self.layers.len().max(layer_index + 1), Layer::default());
    }

    pub fn is_layer_hidden(&self, layer_index: usize) -> bool {
        self.layers
            .get(layer_index)
            .is_some_and(|layer| layer.hidden)
    }

    pub fn show_layer(&mut self, layer_index: usize) {
        self.ensure_layer(layer_index);
        self.layers[layer_index].hidden = false;
    }

    pub fn hide_layer(&mut self, layer_index: usize) {
        self.ensure_layer(layer_index);
        self.layers[layer_index].hidden = true;
    }

    pub fn is_layer_locked(&self, layer_index: usize) -> bool {
        self.layers
            .get(layer_index)
            .is_some_and(|layer| layer.locked)
    }

    pub fn lock_layer(&mut self, layer_index: usize) {
        self.ensure_layer(layer_index);
        self.layers[layer_index].locked = true;
    }

    pub fn unlock_layer(&mut self, layer_index: usize) {
        self.ensure_layer(layer_index);
        self.layers[layer_index].locked = false;
    }

    pub async fn render_frame_gpu(
        &self,
        renderer: &mut GpuRenderer,
        frame_index: u32,
        width: u32,
        height: u32,
    ) -> Result<Image, String> {
        let mut clips: Vec<&Clip> = self
            .clips
            .iter()
            .filter(|clip| clip.contains_frame(frame_index))
            .filter(|clip| !clip.metadata.hidden)
            .filter(|clip| !self.is_layer_hidden(clip.metadata.layer_index))
            .collect();
        clips.sort_by_key(|clip| clip.metadata.layer_index);
        renderer.render_frame(&clips, width, height).await
    }
}

#[cfg(test)]
mod tests {
    use super::Composition;

    #[test]
    fn layer_lock_state_serializes_and_round_trips() {
        let mut composition = Composition::new();
        composition.lock_layer(2);

        let bytes = rmp_serde::to_vec(&composition).unwrap();
        let restored: Composition = rmp_serde::from_slice(&bytes).unwrap();

        assert!(restored.is_layer_locked(2));

        composition.unlock_layer(2);
        assert!(!composition.is_layer_locked(2));
    }

    #[test]
    fn ensuring_layer_expands_composition_layers() {
        let mut composition = Composition::new();
        composition.ensure_layer(100);

        assert_eq!(composition.get_layers().len(), 101);
    }
}
