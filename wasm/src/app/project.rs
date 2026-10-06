use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::app::clip::Clip;
use crate::app::composition::Composition;
use crate::app::project_settings::ProjectSettings;

#[derive(Serialize, Deserialize)]
pub struct Project {
    pub composition: Composition,
    pub settings: ProjectSettings,
}

impl Project {
    pub fn new(settings: ProjectSettings) -> Self {
        Self {
            composition: Composition::new(),
            settings,
        }
    }

    pub fn get_clip(&self, clip_id: Uuid) -> Option<&Clip> {
        self.composition.get_clip(clip_id)
    }

    pub fn get_clip_mut(&mut self, clip_id: Uuid) -> Option<&mut Clip> {
        self.composition.find_clip(clip_id)
    }

    pub fn is_clip_locked(&self, clip_id: Uuid) -> bool {
        match self.get_clip(clip_id) {
            Some(clip) => {
                clip.metadata.locked
                    || self
                        .composition
                        .layer_index(clip.metadata.layer_id)
                        .is_some_and(|index| self.composition.is_layer_locked(index))
            }
            None => false,
        }
    }
}
