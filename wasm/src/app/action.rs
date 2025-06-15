use crate::app::context::Context;

pub trait Action {
    fn apply(&mut self, context: &mut Context);
}

pub trait UndoableAction: Action {
    fn undo(&mut self, context: &mut Context);
}
