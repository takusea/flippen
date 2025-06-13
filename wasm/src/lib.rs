mod app;
mod core;
mod tool;

use js_sys::Uint8ClampedArray;
use wasm_bindgen::prelude::wasm_bindgen;

use crate::core::image::Image;
use crate::core::tool::ToolPropertyValue;

#[wasm_bindgen]
pub struct FlippenWasm {
    app: app::app::App,
}

#[wasm_bindgen]
impl FlippenWasm {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> FlippenWasm {
        FlippenWasm {
            app: app::app::App::new(width, height),
        }
    }

    pub fn width(&self) -> u32 {
        self.app.width
    }

    pub fn height(&self) -> u32 {
        self.app.height
    }

    pub fn push_undo(&mut self) {
        self.app.push_undo();
    }

    pub fn undo(&mut self) {
        self.app.undo();
    }

    pub fn redo(&mut self) {
        self.app.redo();
    }

    pub fn apply_tool(&mut self, current_tool: &str, x: u32, y: u32, pressure: f32) {
        let tool_index = match current_tool {
            "pen" => 0,
            "eraser" => 1,
            "fill" => 2,
            _ => {
                eprintln!("Unknown or invalid property: {}.", current_tool);
                return;
            }
        };

        self.app.apply_tool(tool_index, x, y, Some(pressure));
    }

    pub fn set_fill_tolerance(&mut self, tolerance: f64) {
        self.app.tools[1].set_property("tolerance", ToolPropertyValue::Number(tolerance));
    }

    pub fn set_brush_size(&mut self, size: f64) {
        self.app.tools[0].set_property("size", ToolPropertyValue::Number(size));
    }

    pub fn set_current_color(&mut self, r: u8, g: u8, b: u8, a: u8) {
        self.app.current_color = [r, g, b, a];
    }

    pub fn set_brush_image(&mut self, width: u32, height: u32, data: Vec<u8>) {
        self.app.tools[0].set_property(
            "image",
            ToolPropertyValue::Image(Image {
                width,
                height,
                data,
            }),
        );
    }

    pub fn prev_frame(&mut self) {
        self.app.frames.prev();
    }

    pub fn next_frame(&mut self) {
        self.app.frames.next();
    }

    pub fn first_frame(&mut self) {
        self.app.frames.first();
    }

    pub fn last_frame(&mut self) {
        self.app.frames.last();
    }

    pub fn insert_frame(&mut self) {
        self.app.frames.insert(
            self.app.frames.current_index,
            Image {
                data: vec![0; (self.app.width * self.app.height * 4) as usize],
                width: self.app.width,
                height: self.app.height,
            },
        );
    }

    pub fn delete_current_frame(&mut self) {
        self.app.frames.delete(self.app.frames.current_index);
    }

    pub fn current_index(&self) -> usize {
        self.app.frames.current_index
    }

    pub fn set_current_index(&mut self, index: usize) {
        self.app.frames.current_index = index;
    }

    pub fn total_frames(&self) -> usize {
        self.app.frames.len()
    }

    pub fn get_data(&self, index: usize) -> Uint8ClampedArray {
        Uint8ClampedArray::from(&self.app.frames.get_frame(index).data[..])
    }
}
