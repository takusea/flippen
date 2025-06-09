pub trait Action {
    fn apply(&mut self, app: &mut App);
}

pub trait UndoableAction: Action {
    fn undo(&mut self, app: &mut App);
}
