use wasm_bindgen::prelude::wasm_bindgen;

use crate::app::action::Action;
use crate::app::action::UndoableAction;
use crate::app::context::Context;
use crate::core::image::Image;

#[wasm_bindgen]
pub struct BeginToolAction {
    frame_index: usize,
    prev_frame: Option<Image>,
}

#[wasm_bindgen]
impl BeginToolAction {
    #[wasm_bindgen(constructor)]
    pub fn new(frame_index: usize) -> BeginToolAction {
        BeginToolAction {
            frame_index,
            prev_frame: None,
        }
    }
}

impl Action for BeginToolAction {
    fn apply(&mut self, context: &mut Context) {
        let frame = &mut context.frames.frames[self.frame_index];

        self.prev_frame = Some(frame.clone());
    }
}

impl UndoableAction for BeginToolAction {
    fn undo(&mut self, context: &mut Context) {
        if let Some(ref frame) = self.prev_frame {
            context.frames.frames[self.frame_index] = frame.clone();
        }
    }
}
