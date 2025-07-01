use wasm_bindgen::prelude::wasm_bindgen;

use crate::app::action::Action;
use crate::app::action::UndoableAction;
use crate::app::timeline::Timeline;

#[wasm_bindgen]
pub struct InsertFrameAction {
    start_frame: u32,
    track_index: usize,
    clip_id: Option<u32>,
}

#[wasm_bindgen]
impl InsertFrameAction {
    #[wasm_bindgen(constructor)]
    pub fn new(start_frame: u32, track_index: usize) -> InsertFrameAction {
        InsertFrameAction {
            start_frame,
            track_index,
            clip_id: None,
        }
    }
}

impl Action for InsertFrameAction {
    fn apply(&mut self, timeline: &mut Timeline) {
        let clip = timeline.add_clip(self.start_frame, 1, self.track_index);
        self.clip_id = Some(clip.id);
    }
}

impl UndoableAction for InsertFrameAction {
    fn undo(&mut self, timeline: &mut Timeline) {
        if let Some(clip_id) = self.clip_id {
            timeline.delete_clip(clip_id);
        }
    }
}
