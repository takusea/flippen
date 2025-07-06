use crate::app::project::Project;

pub trait Action {
    fn apply(&mut self, project: &mut Project);
}

pub trait UndoableAction: Action {
    fn undo(&mut self, project: &mut Project);
}
