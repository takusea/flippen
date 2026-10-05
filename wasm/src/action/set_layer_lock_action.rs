use crate::app::action::{Action, UndoableAction};
use crate::app::project::Project;

pub struct SetLayerLockAction {
    layer_index: usize,
    locked: bool,
    previous: Option<bool>,
}

impl SetLayerLockAction {
    pub fn new(layer_index: usize, locked: bool) -> Self {
        Self {
            layer_index,
            locked,
            previous: None,
        }
    }
}

impl Action for SetLayerLockAction {
    fn apply(&mut self, project: &mut Project) {
        let was_locked = project.composition.is_layer_locked(self.layer_index);
        if self.previous.is_none() {
            self.previous = Some(was_locked);
        }
        if self.locked {
            project.composition.lock_layer(self.layer_index);
        } else {
            project.composition.unlock_layer(self.layer_index);
        }
    }
}

impl UndoableAction for SetLayerLockAction {
    fn undo(&mut self, project: &mut Project) {
        if let Some(previous) = self.previous {
            if previous {
                project.composition.lock_layer(self.layer_index);
            } else {
                project.composition.unlock_layer(self.layer_index);
            }
        }
    }
}
