use uuid::Uuid;

use crate::app::action::{Action, UndoableAction};
use crate::app::project::Project;

pub struct MoveClipAction {
    clip_id: Uuid,
    start_frame: u32,
    layer_index: usize,
    previous: Option<(u32, usize)>,
}

impl MoveClipAction {
    pub fn new(clip_id: Uuid, start_frame: u32, layer_index: usize) -> Self {
        Self {
            clip_id,
            start_frame,
            layer_index,
            previous: None,
        }
    }
}

impl Action for MoveClipAction {
    fn apply(&mut self, project: &mut Project) {
        if self.previous.is_none() {
            self.previous = project
                .composition
                .get_clips()
                .iter()
                .find(|clip| clip.metadata.id == self.clip_id)
                .map(|clip| (clip.metadata.start, clip.metadata.layer_index));
        }
        project
            .composition
            .move_clip(self.clip_id, self.start_frame, self.layer_index);
    }
}

impl UndoableAction for MoveClipAction {
    fn undo(&mut self, project: &mut Project) {
        if let Some((start_frame, layer_index)) = self.previous {
            project
                .composition
                .move_clip(self.clip_id, start_frame, layer_index);
        }
    }
}
