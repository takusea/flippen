use crate::app::project::Project;
use crate::core::image::PixelChange;

pub trait Action {
    fn apply(&mut self, project: &mut Project);

    fn record_pixel_changes(&mut self, _clip_id: uuid::Uuid, _changes: Vec<PixelChange>) {}
}

pub trait UndoableAction: Action {
    fn undo(&mut self, project: &mut Project);
}
