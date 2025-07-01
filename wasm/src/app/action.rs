use crate::app::timeline::Timeline;

pub trait Action {
    fn apply(&mut self, timeline: &mut Timeline);
}

pub trait UndoableAction: Action {
    fn undo(&mut self, timeline: &mut Timeline);
}
