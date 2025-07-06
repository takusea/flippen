mod action;
mod app;
mod core;
mod tool;

use gloo::utils::format::JsValueSerdeExt;
use js_sys::Uint8ClampedArray;
use uuid::Uuid;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

use crate::action::add_clip_action::AddClipAction;
use crate::action::begin_tool_action::BeginToolAction;
use crate::action::delete_clip_action::DeleteClipAction;
use crate::app::action_manager::ActionManager;
use crate::app::clip::ClipMetadata;
use crate::app::composition::Composition;
use crate::app::project::Project;
use crate::app::project_settings::ProjectSettings;
use crate::core::image::Image;
use crate::core::tool::{Tool, ToolPropertyValue};

#[wasm_bindgen]
pub struct FlippenCore {
    project: Project,
    tools: Vec<Box<dyn Tool>>,
    action_manager: ActionManager,
}

#[wasm_bindgen]
impl FlippenCore {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> Self {
        Self {
            project: Project {
                composition: Composition::new(),
                settings: ProjectSettings {
                    width,
                    height,
                    frame_rate: 8,
                },
            },
            tools: vec![
                Box::new(tool::circle_brush_tool::CircleBrushTool { size: 5 }),
                Box::new(tool::eraser_tool::EraserTool { size: 5 }),
                Box::new(tool::fill_tool::FillTool { tolerance: 500 }),
            ],
            action_manager: ActionManager::new(),
        }
    }

    pub fn width(&self) -> u32 {
        self.project.settings.width
    }

    pub fn height(&self) -> u32 {
        self.project.settings.height
    }

    pub fn begin_draw(&mut self, clip_id_str: String) {
        let clip_id = match Uuid::parse_str(&clip_id_str) {
            Ok(id) => id,
            Err(e) => {
                eprintln!("Failed to parse clip_id: {:?}", e);
                return;
            }
        };
        let action = Box::new(BeginToolAction::new(clip_id));
        self.action_manager.do_action(action, &mut self.project);
    }

    pub fn undo(&mut self) {
        self.action_manager.undo(&mut self.project);
    }

    pub fn redo(&mut self) {
        self.action_manager.redo(&mut self.project);
    }

    pub fn apply_tool(
        &mut self,
        clip_id_str: String,
        current_tool: &str,
        x: u32,
        y: u32,
        color: &[u8],
        pressure: f32,
    ) {
        let clip_id = match Uuid::parse_str(&clip_id_str) {
            Ok(id) => id,
            Err(e) => {
                eprintln!("Failed to parse clip_id: {:?}", e);
                return;
            }
        };

        let tool_index = match current_tool {
            "pen" => 0,
            "eraser" => 1,
            "fill" => 2,
            _ => {
                eprintln!("Unknown or invalid property: {}.", current_tool);
                return;
            }
        };

        let clip = match self
            .project
            .composition
            .clips
            .iter_mut()
            .find(|clip| clip.id == clip_id)
        {
            Some(c) => c,
            None => return,
        };

        let tool = match self.tools.get_mut(tool_index) {
            Some(t) => t,
            None => return,
        };

        if color.len() != 4 {
            eprintln!("Color array must have exactly 4 elements.");
            return;
        }

        let image = clip.get_image_mut();
        let color_array = [color[0], color[1], color[2], color[3]];
        tool.apply(image, x, y, color_array, Some(pressure));
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
        let clip_metadatas: Vec<ClipMetadata> = self
            .project
            .composition
            .get_clips()
            .iter()
            .map(|clip| clip.to_metadata())
            .collect();
        JsValue::from_serde(&clip_metadatas).unwrap()
    }

    pub fn add_clip(&mut self, start_frame: u32, track_index: usize) {
        let action = Box::new(AddClipAction::new(start_frame, track_index));
        self.action_manager.do_action(action, &mut self.project);
    }

    pub fn delete_clip(&mut self, clip_id_str: String) {
        let clip_id = match Uuid::parse_str(&clip_id_str) {
            Ok(id) => id,
            Err(e) => {
                eprintln!("Failed to parse clip_id: {:?}", e);
                return;
            }
        };

        let action = Box::new(DeleteClipAction::new(clip_id));
        self.action_manager.do_action(action, &mut self.project);
    }

    pub fn move_clip(&mut self, clip_id_str: String, start_frame: u32, track_index: usize) {
        let clip_id = match Uuid::parse_str(&clip_id_str) {
            Ok(id) => id,
            Err(e) => {
                eprintln!("Failed to parse clip_id: {:?}", e);
                return;
            }
        };

        self.project
            .composition
            .move_clip(clip_id, start_frame, track_index);
    }

    pub fn change_clip_duration(&mut self, clip_id_str: String, duration: u32) {
        let clip_id = match Uuid::parse_str(&clip_id_str) {
            Ok(id) => id,
            Err(e) => {
                eprintln!("Failed to parse clip_id: {:?}", e);
                return;
            }
        };

        if let Some(clip) = self.project.composition.find_clip(clip_id) {
            clip.duration = duration;
        }
    }

    pub fn render_frame(&self, frame_index: u32) -> Uint8ClampedArray {
        Uint8ClampedArray::from(
            &self
                .project
                .composition
                .render_frame(
                    frame_index,
                    self.project.settings.width,
                    self.project.settings.height,
                )
                .data[..],
        )
    }

    pub fn export(&self) -> Vec<u8> {
        rmp_serde::to_vec(&self.project).unwrap()
    }

    pub fn import(&mut self, data: &[u8]) {
        match rmp_serde::from_slice::<Project>(data) {
            Ok(project) => self.project = project,
            Err(e) => {
                eprintln!("Failed to import composition: {:?}", e);
            }
        }
    }
}
