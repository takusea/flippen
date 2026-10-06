use crate::app::action::UndoableAction;
use crate::app::project::Project;
use crate::core::image::PixelChange;
use uuid::Uuid;

pub struct ActionManager {
    undo_stack: Vec<Box<dyn UndoableAction>>,
    redo_stack: Vec<Box<dyn UndoableAction>>,
    recording_pixel_changes: bool,
}

impl ActionManager {
    pub fn new() -> Self {
        ActionManager {
            undo_stack: Vec::new(),
            redo_stack: Vec::new(),
            recording_pixel_changes: false,
        }
    }

    pub fn do_action(&mut self, mut action: Box<dyn UndoableAction>, project: &mut Project) {
        self.recording_pixel_changes = false;
        action.apply(project);
        self.undo_stack.push(action);
        self.redo_stack.clear();
    }

    pub fn undo(&mut self, project: &mut Project) {
        self.recording_pixel_changes = false;
        if let Some(mut action) = self.undo_stack.pop() {
            action.undo(project);
            self.redo_stack.push(action);
        }
    }

    pub fn redo(&mut self, project: &mut Project) {
        self.recording_pixel_changes = false;
        if let Some(mut action) = self.redo_stack.pop() {
            action.apply(project);
            self.undo_stack.push(action);
        }
    }

    pub fn begin_pixel_recording(&mut self) {
        self.recording_pixel_changes = true;
    }

    pub fn end_pixel_recording(&mut self) {
        self.recording_pixel_changes = false;
    }

    pub fn record_pixel_changes(&mut self, clip_id: Uuid, changes: Vec<PixelChange>) {
        if self.recording_pixel_changes {
            self.record_pixel_changes_to_latest(clip_id, changes);
        }
    }

    pub fn record_pixel_changes_to_latest(&mut self, clip_id: Uuid, changes: Vec<PixelChange>) {
        if let Some(action) = self.undo_stack.last_mut() {
            action.record_pixel_changes(clip_id, changes);
        }
    }

    pub fn can_undo(&self) -> bool {
        !self.undo_stack.is_empty()
    }

    pub fn can_redo(&self) -> bool {
        !self.redo_stack.is_empty()
    }
}
