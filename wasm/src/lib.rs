mod action;
mod app;
mod core;
mod tool;

use gloo::console::debug;
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
use crate::core::image::Image;
use crate::core::tool::{Tool, ToolPropertyValue};
use crate::core::transform::Transform;

#[wasm_bindgen]
pub struct FlippenCore {
    project: Option<Project>,
    tools: Vec<Box<dyn Tool>>,
    action_manager: ActionManager,
}

#[wasm_bindgen]
impl FlippenCore {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        console_error_panic_hook::set_once();
        Self {
            project: None,
            tools: vec![
                Box::new(tool::circle_brush_tool::CircleBrushTool { size: 5 }),
                Box::new(tool::eraser_tool::EraserTool { size: 5 }),
                Box::new(tool::fill_tool::FillTool { tolerance: 500 }),
            ],
            action_manager: ActionManager::new(),
        }
    }

    pub fn create_project(&mut self, json: JsValue) {
        let settings = json.into_serde().unwrap();
        self.project = Some(Project {
            composition: Composition::new(),
            settings,
        });
    }

    pub fn width(&self) -> Option<u32> {
        if let Some(project) = self.project.as_ref() {
            Some(project.settings.width)
        } else {
            None
        }
    }

    pub fn height(&self) -> Option<u32> {
        if let Some(project) = self.project.as_ref() {
            Some(project.settings.height)
        } else {
            None
        }
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
        if let Some(project) = self.project.as_mut() {
            self.action_manager.do_action(action, project);
        }
    }

    pub fn undo(&mut self) {
        if let Some(project) = self.project.as_mut() {
            self.action_manager.undo(project);
        }
    }

    pub fn redo(&mut self) {
        if let Some(project) = self.project.as_mut() {
            self.action_manager.redo(project);
        }
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

        let project = match &mut self.project {
            Some(p) => p,
            None => return,
        };

        let clip = match project
            .composition
            .clips
            .iter_mut()
            .find(|clip| clip.metadata.id == clip_id)
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

    pub fn get_tool_properties(&self, current_tool: &str) -> JsValue {
        let tool_index = match current_tool {
            "pen" => 0,
            "eraser" => 1,
            "fill" => 2,
            _ => {
                eprintln!("Unknown or invalid property: {}.", current_tool);
                return JsValue::undefined();
            }
        };

        JsValue::from_serde(&self.tools[tool_index].get_properties()).unwrap()
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
                Ok(ToolPropertyValue::Image(Some(Image {
                    data: vec,
                    width: 512,
                    height: 512,
                })))
            } else {
                Err(JsValue::from_str("Unsupported property value"))
            }
        };

        if let Ok(prop) = tool_property {
            self.tools[tool_index].set_property(name, prop);
        }
    }

    pub fn get_clips(&mut self) -> JsValue {
        let project = match &mut self.project {
            Some(p) => p,
            None => {
                return JsValue::undefined();
            }
        };

        let clip_metadatas: Vec<ClipMetadata> = project
            .composition
            .get_clips()
            .iter()
            .map(|clip| clip.metadata.clone())
            .collect();
        JsValue::from_serde(&clip_metadatas).unwrap()
    }

    pub fn add_clip(&mut self, start_frame: u32, layer_index: usize) {
        let action = Box::new(AddClipAction::new(start_frame, layer_index));

        if let Some(project) = self.project.as_mut() {
            self.action_manager.do_action(action, project);
        }
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

        if let Some(project) = self.project.as_mut() {
            self.action_manager.do_action(action, project);
        }
    }

    pub fn move_clip(&mut self, clip_id_str: String, start_frame: u32, layer_index: usize) {
        let clip_id = match Uuid::parse_str(&clip_id_str) {
            Ok(id) => id,
            Err(e) => {
                eprintln!("Failed to parse clip_id: {:?}", e);
                return;
            }
        };

        if let Some(project) = self.project.as_mut() {
            project
                .composition
                .move_clip(clip_id, start_frame, layer_index);
        }
    }

    pub fn change_clip_duration(&mut self, clip_id_str: String, duration: u32) {
        let clip_id = match Uuid::parse_str(&clip_id_str) {
            Ok(id) => id,
            Err(e) => {
                eprintln!("Failed to parse clip_id: {:?}", e);
                return;
            }
        };

        let project = match &mut self.project {
            Some(p) => p,
            None => {
                return;
            }
        };

        if let Some(clip) = project.composition.find_clip(clip_id) {
            clip.metadata.duration = duration;
        }
    }

    pub fn get_hidden_layers(&mut self) -> Vec<usize> {
        let project = match &mut self.project {
            Some(p) => p,
            None => {
                return Vec::new();
            }
        };

        project.composition.hidden_layers.clone()
    }

    pub fn show_layer(&mut self, layer_index: usize) {
        let project = match &mut self.project {
            Some(p) => p,
            None => {
                return;
            }
        };

        project.composition.show_layer(layer_index);
    }

    pub fn hide_layer(&mut self, layer_index: usize) {
        let project = match &mut self.project {
            Some(p) => p,
            None => {
                return;
            }
        };

        project.composition.hide_layer(layer_index);
    }

    pub fn render_frame(&self, frame_index: u32) -> Option<Uint8ClampedArray> {
        let project = match &self.project {
            Some(p) => p,
            None => {
                return None;
            }
        };
        Some(Uint8ClampedArray::from(
            &project
                .composition
                .render_frame(frame_index, project.settings.width, project.settings.height)
                .data[..],
        ))
    }

    pub fn get_clip_transform(&mut self, clip_id_str: String) -> JsValue {
        let clip_id = match Uuid::parse_str(&clip_id_str) {
            Ok(id) => id,
            Err(e) => {
                eprintln!("Failed to parse clip_id: {:?}", e);
                return JsValue::undefined();
            }
        };

        let project = match &mut self.project {
            Some(p) => p,
            None => {
                return JsValue::undefined();
            }
        };

        if let Some(clip) = project.composition.find_clip(clip_id) {
            return JsValue::from_serde(&clip.transform).unwrap();
        }
        JsValue::undefined()
    }

    pub fn set_clip_transform(&mut self, clip_id_str: String, json: JsValue) {
        let clip_id = match Uuid::parse_str(&clip_id_str) {
            Ok(id) => id,
            Err(e) => {
                eprintln!("Failed to parse clip_id: {:?}", e);
                return;
            }
        };

        let project = match &mut self.project {
            Some(p) => p,
            None => {
                return;
            }
        };

        if let Some(clip) = project.composition.find_clip(clip_id) {
            let transform: Transform = json.into_serde().unwrap();
            clip.transform = transform;
        }
    }

    pub fn export(&self) -> Vec<u8> {
        rmp_serde::to_vec(&self.project).unwrap()
    }

    pub fn import(&mut self, data: &[u8]) {
        match rmp_serde::from_slice::<Project>(data) {
            Ok(project) => self.project = Some(project),
            Err(e) => {
                eprintln!("Failed to import composition: {:?}", e);
            }
        }
    }
}
