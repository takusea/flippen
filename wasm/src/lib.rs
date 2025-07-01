mod action;
mod app;
mod core;
mod tool;

use std::collections::btree_map::Range;

use gloo::utils::format::JsValueSerdeExt;
use js_sys::Uint8ClampedArray;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

use crate::action::begin_tool_action::BeginToolAction;
use crate::action::insert_frame_action::InsertFrameAction;
use crate::app::action_manager::ActionManager;
use crate::app::project_settings::ProjectSettings;
use crate::app::timeline::Timeline;
use crate::core::image::Image;
use crate::core::tool::{Tool, ToolPropertyValue};

#[wasm_bindgen]
pub struct FlippenCore {
    timeline: Timeline,
    tools: Vec<Box<dyn Tool>>,
    project_settings: ProjectSettings,
    action_manager: ActionManager,
}

#[wasm_bindgen]
impl FlippenCore {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> FlippenCore {
        FlippenCore {
            timeline: Timeline::new(),
            tools: vec![
                Box::new(tool::circle_brush_tool::CircleBrushTool { size: 5 }),
                Box::new(tool::eraser_tool::EraserTool { size: 5 }),
                Box::new(tool::fill_tool::FillTool { tolerance: 500 }),
            ],
            project_settings: ProjectSettings {
                width,
                height,
                frame_rate: 8,
            },
            action_manager: ActionManager::new(),
        }
    }

    pub fn width(&self) -> u32 {
        self.project_settings.width
    }

    pub fn height(&self) -> u32 {
        self.project_settings.height
    }

    pub fn begin_draw(&mut self, clip_id: usize, current_frame: usize) {
        self.action_manager.do_action(
            Box::new(BeginToolAction::new(clip_id, current_frame)),
            &mut self.timeline,
        );
    }

    pub fn undo(&mut self) {
        self.action_manager.undo(&mut self.timeline);
    }

    pub fn redo(&mut self) {
        self.action_manager.redo(&mut self.timeline);
    }

    pub fn apply_tool(
        &mut self,
        clip_id: usize,
        current_frame: usize,
        current_tool: &str,
        x: u32,
        y: u32,
        color: &[u8],
        pressure: f32,
    ) {
        let tool_index = match current_tool {
            "pen" => 0,
            "eraser" => 1,
            "fill" => 2,
            _ => {
                eprintln!("Unknown or invalid property: {}.", current_tool);
                return;
            }
        };

        let image = self.timeline.clips[clip_id].get_frame_mut(current_frame);

        if let Some(tool) = self.tools.get_mut(tool_index) {
            if color.len() == 4 {
                let color_array = [color[0], color[1], color[2], color[3]];
                tool.apply(image, x, y, color_array, Some(pressure));
            } else {
                eprintln!("Color array must have exactly 4 elements.");
            }
        }
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
            self.tools[tool_index].set_property(name, prop);
        }
    }

    pub fn get_clips(&self) -> JsValue {
        JsValue::from_serde(&self.timeline.get_clips()).unwrap()
    }

    pub fn add_clip(&mut self, start_frame: u32, track_index: usize) {
        self.action_manager.do_action(
            Box::new(InsertFrameAction::new(start_frame, track_index)),
            &mut self.timeline,
        )
    }

    pub fn delete_clip(&mut self, clip_id: u32) {
        self.timeline.delete_clip(clip_id);
    }

    pub fn move_clip(&mut self, clip_id: u32, start_frame: u32, track_index: usize) {
        self.timeline.move_clip(clip_id, start_frame, track_index);
    }

    pub fn change_clip_duration(&mut self, clip_id: u32, duration: usize) {
        if let Some(clip) = self
            .timeline
            .clips
            .iter_mut()
            .find(|clip| clip.id == clip_id)
        {
            if clip.frames.len() < duration {
                for _ in 0..(duration - clip.frames.len()) {
                    clip.frames.push(Image::new(
                        self.project_settings.width,
                        self.project_settings.height,
                    ));
                }
            } else {
                for _ in 0..(clip.frames.len() - duration) {
                    clip.frames.pop();
                }
            }
        }
    }

    pub fn get_data(&self, frame_index: u32) -> Uint8ClampedArray {
        Uint8ClampedArray::from(
            &self
                .timeline
                .render_frame(
                    frame_index,
                    self.project_settings.width,
                    self.project_settings.height,
                )
                .data[..],
        )
    }
}
