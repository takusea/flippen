use crate::app::action::{Action, UndoableAction};
use crate::app::project::Project;

pub struct SetLayerVisibilityAction {
    layer_index: usize,
    hidden: bool,
    previous: Option<bool>,
}

impl SetLayerVisibilityAction {
    pub fn new(layer_index: usize, hidden: bool) -> Self {
        Self {
            layer_index,
            hidden,
            previous: None,
        }
    }
}

impl Action for SetLayerVisibilityAction {
    fn apply(&mut self, project: &mut Project) {
        let was_hidden = project
            .composition
            .hidden_layers
            .contains(&self.layer_index);
        if self.previous.is_none() {
            self.previous = Some(was_hidden);
        }
        if self.hidden {
            project.composition.hide_layer(self.layer_index);
        } else {
            project.composition.show_layer(self.layer_index);
        }
    }
}

impl UndoableAction for SetLayerVisibilityAction {
    fn undo(&mut self, project: &mut Project) {
        if let Some(previous) = self.previous {
            if previous {
                project.composition.hide_layer(self.layer_index);
            } else {
                project.composition.show_layer(self.layer_index);
            }
        }
    }
}
