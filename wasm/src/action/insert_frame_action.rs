use wasm_bindgen::prelude::wasm_bindgen;

use crate::app::action::Action;
use crate::app::action::UndoableAction;
use crate::app::context::Context;
use crate::core::image::Image;

#[wasm_bindgen]
pub struct InsertFrameAction {
    frame_index: usize,
}

#[wasm_bindgen]
impl InsertFrameAction {
    #[wasm_bindgen(constructor)]
    pub fn new(frame_index: usize) -> InsertFrameAction {
        InsertFrameAction { frame_index }
    }
}

impl Action for InsertFrameAction {
    fn apply(&mut self, context: &mut Context) {
        context.frames.insert(
            self.frame_index,
            Image {
                data: vec![0; (context.width * context.height * 4) as usize],
                width: context.width,
                height: context.height,
            },
        );
    }
}

impl UndoableAction for InsertFrameAction {
    fn undo(&mut self, app: &mut Context) {
        app.frames.delete(self.frame_index);
    }
}
