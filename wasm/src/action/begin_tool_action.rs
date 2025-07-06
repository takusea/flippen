use uuid::Uuid;

use crate::app::action::{Action, UndoableAction};
use crate::app::project::Project;
use crate::core::image::Image;

pub struct BeginToolAction {
    clip_id: Uuid,
    prev_image: Option<Image>,
}

impl BeginToolAction {
    pub fn new(clip_id: Uuid) -> Self {
        Self {
            clip_id,
            prev_image: None,
        }
    }

    fn replace_clip_image(&mut self, project: &mut Project) {
        if let Some(clip) = project.composition.find_clip(self.clip_id) {
            if let Some(ref prev) = self.prev_image {
                let current = clip.get_image().clone();
                clip.set_image(prev.clone());
                self.prev_image = Some(current);
            }
        }
    }
}

impl Action for BeginToolAction {
    fn apply(&mut self, project: &mut Project) {
        if self.prev_image.is_none() {
            if let Some(clip) = project.composition.find_clip(self.clip_id) {
                self.prev_image = Some(clip.get_image().clone());
            }
        } else {
            self.replace_clip_image(project);
        }
    }
}

impl UndoableAction for BeginToolAction {
    fn undo(&mut self, project: &mut Project) {
        self.replace_clip_image(project);
    }
}
