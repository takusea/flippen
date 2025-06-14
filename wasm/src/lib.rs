mod app;
mod core;
mod tool;

use js_sys::Uint8ClampedArray;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

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

    pub fn apply_tool(&mut self, current_tool: &str, x: u32, y: u32, color: &[u8], pressure: f32) {
        let tool_index = match current_tool {
            "pen" => 0,
            "eraser" => 1,
            "fill" => 2,
            _ => {
                eprintln!("Unknown or invalid property: {}.", current_tool);
                return;
            }
        };

        self.app.apply_tool(
            tool_index,
            x,
            y,
            [color[0], color[1], color[2], color[3]],
            Some(pressure),
        );
    }

    pub fn set_tool_property(&mut self, current_tool: &str, name: &str, value: JsValue) {
        let tool_index = match current_tool {
            "pen" => 0,
            "eraser" => 1,
            "fill" => 2,
            _ => {
                eprintln!("Unknown or invalid property: {}.", current_tool);
                return;
            }
        };

        let tool_property: Result<ToolPropertyValue, JsValue> = {
            if let Some(n) = value.as_f64() {
                Ok(ToolPropertyValue::Number(n))
            } else if let Some(b) = value.as_bool() {
                Ok(ToolPropertyValue::Bool(b))
            } else if let Some(s) = value.as_string() {
                Ok(ToolPropertyValue::String(s))
            } else if js_sys::Array::is_array(&value) {
                let array = js_sys::Array::from(&value);
                if array.length() == 4 {
                    let mut color = [0u8; 4];
                    for i in 0..4 {
                        if let Some(n) = array.get(i).as_f64() {
                            color[i as usize] = n as u8;
                        } else {
                            return;
                        }
                    }
                    Ok(ToolPropertyValue::Color(color))
                } else {
                    Err(JsValue::from_str("Invalid color array length"))
                }
            } else if value.is_object() {
                let uint8_array = js_sys::Uint8Array::new(&value);
                let vec = uint8_array.to_vec();
                Ok(ToolPropertyValue::Image(Image {
                    data: vec,
                    width: 512,
                    height: 512,
                }))
            } else {
                Err(JsValue::from_str("Unsupported property value"))
            }
        };

        if let Ok(prop) = tool_property {
            self.app.tools[tool_index].set_property(name, prop);
        }
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

    pub fn insert_frame(&mut self, index: usize) {
        self.app.frames.insert(
            index,
            Image {
                data: vec![0; (self.app.width * self.app.height * 4) as usize],
                width: self.app.width,
                height: self.app.height,
            },
        );
    }

    pub fn delete_frame(&mut self, index: usize) {
        self.app.frames.delete(index);
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
