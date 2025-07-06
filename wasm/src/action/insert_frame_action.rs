use crate::app::action::Action;
use crate::app::action::UndoableAction;
use crate::app::project::Project;

pub struct InsertFrameAction {
    start_frame: u32,
    track_index: usize,
    clip_id: Option<u32>,
}

impl InsertFrameAction {
    pub fn new(start_frame: u32, track_index: usize) -> Self {
        Self {
            start_frame,
            track_index,
            clip_id: None,
        }
    }
}

impl Action for InsertFrameAction {
    fn apply(&mut self, project: &mut Project) {
        let clip = project
            .composition
            .add_clip(self.start_frame, 1, self.track_index);
        self.clip_id = Some(clip.id);
    }
}

impl UndoableAction for InsertFrameAction {
    fn undo(&mut self, project: &mut Project) {
        if let Some(clip_id) = self.clip_id {
            project.composition.delete_clip(clip_id);
        }
    }
}
