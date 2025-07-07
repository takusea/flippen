use uuid::Uuid;

use crate::app::action::Action;
use crate::app::action::UndoableAction;
use crate::app::clip::Clip;
use crate::app::project::Project;
use crate::core::image::Image;

pub struct AddClipAction {
    start_frame: u32,
    layer_index: usize,
    clip_id: Option<Uuid>,
}

impl AddClipAction {
    pub fn new(start_frame: u32, layer_index: usize) -> Self {
        Self {
            start_frame,
            layer_index,
            clip_id: None,
        }
    }
}

impl Action for AddClipAction {
    fn apply(&mut self, project: &mut Project) {
        let clip = Clip {
            id: Uuid::new_v4(),
            start: self.start_frame,
            layer_index: self.layer_index,
            duration: 1,
            image: Image::new(1280, 720),
        };
        self.clip_id = Some(clip.id);
        project.composition.add_clip(clip);
    }
}

impl UndoableAction for AddClipAction {
    fn undo(&mut self, project: &mut Project) {
        if let Some(clip_id) = self.clip_id {
            project.composition.delete_clip(clip_id);
        }
    }
}
