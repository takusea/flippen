use uuid::Uuid;

use crate::app::action::{Action, UndoableAction};
use crate::app::clip::Clip;
use crate::app::project::Project;

pub struct DeleteClipAction {
    clip_id: Uuid,
    deleted_clip: Option<Clip>,
}

impl DeleteClipAction {
    pub fn new(clip_id: Uuid) -> Self {
        Self {
            clip_id,
            deleted_clip: None,
        }
    }
}

impl Action for DeleteClipAction {
    fn apply(&mut self, project: &mut Project) {
        if self.deleted_clip.is_none() {
            let deleted = project.composition.delete_clip(self.clip_id);
            self.deleted_clip = deleted;
        }
    }
}

impl UndoableAction for DeleteClipAction {
    fn undo(&mut self, project: &mut Project) {
        if let Some(ref clip) = self.deleted_clip {
            project.composition.add_clip(clip.clone());
        }
    }
}
