use crate::app::action::{Action, UndoableAction};
use crate::app::composition::LayerId;
use crate::app::project::Project;

pub struct SetLayerVisibilityAction {
    layer_index: usize,
    layer_id: Option<LayerId>,
    hidden: bool,
    previous: Option<bool>,
}

impl SetLayerVisibilityAction {
    pub fn new(layer_index: usize, hidden: bool) -> Self {
        Self {
            layer_index,
            layer_id: None,
            hidden,
            previous: None,
        }
    }
}

impl Action for SetLayerVisibilityAction {
    fn apply(&mut self, project: &mut Project) {
        let layer_id = *self
            .layer_id
            .get_or_insert_with(|| project.composition.layer_id_at(self.layer_index));
        let was_hidden = project
            .composition
            .is_layer_hidden_by_id(layer_id)
            .expect("Layer action references an unknown layer");
        if self.previous.is_none() {
            self.previous = Some(was_hidden);
        }
        project
            .composition
            .set_layer_visible_by_id(layer_id, !self.hidden);
    }
}

impl UndoableAction for SetLayerVisibilityAction {
    fn undo(&mut self, project: &mut Project) {
        if let Some(previous) = self.previous {
            if let Some(layer_id) = self.layer_id {
                project
                    .composition
                    .set_layer_visible_by_id(layer_id, !previous);
            }
        }
    }
}
