use crate::app::action::UndoableAction;
use crate::app::project::Project;

pub struct ActionManager {
    undo_stack: Vec<Box<dyn UndoableAction>>,
    redo_stack: Vec<Box<dyn UndoableAction>>,
}

impl ActionManager {
    pub fn new() -> Self {
        ActionManager {
            undo_stack: Vec::new(),
            redo_stack: Vec::new(),
        }
    }

    pub fn do_action(&mut self, mut action: Box<dyn UndoableAction>, project: &mut Project) {
        action.apply(project);
        self.undo_stack.push(action);
        self.redo_stack.clear();
    }

    pub fn undo(&mut self, project: &mut Project) {
        if let Some(mut action) = self.undo_stack.pop() {
            action.undo(project);
            self.redo_stack.push(action);
        }
    }

    pub fn redo(&mut self, project: &mut Project) {
        if let Some(mut action) = self.redo_stack.pop() {
            action.apply(project);
            self.undo_stack.push(action);
        }
    }

    pub fn can_undo(&self) -> bool {
        !self.undo_stack.is_empty()
    }

    pub fn can_redo(&self) -> bool {
        !self.redo_stack.is_empty()
    }
}
