use crate::app::action::{Action, UndoableAction};
use crate::app::composition::LayerId;
use crate::app::project::Project;

pub struct SetLayerLockAction {
    layer_index: usize,
    layer_id: Option<LayerId>,
    locked: bool,
    previous: Option<bool>,
}

impl SetLayerLockAction {
    pub fn new(layer_index: usize, locked: bool) -> Self {
        Self {
            layer_index,
            layer_id: None,
            locked,
            previous: None,
        }
    }
}

impl Action for SetLayerLockAction {
    fn apply(&mut self, project: &mut Project) {
        let layer_id = *self
            .layer_id
            .get_or_insert_with(|| project.composition.layer_id_at(self.layer_index));
        let was_locked = project
            .composition
            .is_layer_locked_by_id(layer_id)
            .expect("Layer action references an unknown layer");
        if self.previous.is_none() {
            self.previous = Some(was_locked);
        }
        project
            .composition
            .set_layer_locked_by_id(layer_id, self.locked);
    }
}

impl UndoableAction for SetLayerLockAction {
    fn undo(&mut self, project: &mut Project) {
        if let Some(previous) = self.previous {
            if let Some(layer_id) = self.layer_id {
                project
                    .composition
                    .set_layer_locked_by_id(layer_id, previous);
            }
        }
    }
}
