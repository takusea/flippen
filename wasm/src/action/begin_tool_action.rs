use wasm_bindgen::prelude::wasm_bindgen;

use crate::app::action::Action;
use crate::app::action::UndoableAction;
use crate::app::timeline::Timeline;
use crate::core::image::Image;

#[wasm_bindgen]
pub struct BeginToolAction {
    clip_id: usize,
    current_frame: usize,
    prev_image: Option<Image>,
}

#[wasm_bindgen]
impl BeginToolAction {
    #[wasm_bindgen(constructor)]
    pub fn new(clip_id: usize, current_frame: usize) -> BeginToolAction {
        BeginToolAction {
            clip_id,
            current_frame,
            prev_image: None,
        }
    }
}

impl Action for BeginToolAction {
    fn apply(&mut self, timeline: &mut Timeline) {
        let frame = &mut timeline.clips[self.clip_id].get_frame(self.current_frame);

        self.prev_image = Some(frame.clone());
    }
}

impl UndoableAction for BeginToolAction {
    fn undo(&mut self, timeline: &mut Timeline) {
        if let Some(ref frame) = self.prev_image {
            timeline.clips[self.clip_id].set_frame(self.current_frame, frame.clone());
        }
    }
}
