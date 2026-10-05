mod action;
mod app;
mod core;
mod gpu;
mod tool;

use gloo::utils::format::JsValueSerdeExt;
use js_sys::Uint8ClampedArray;
use uuid::Uuid;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

use crate::action::add_clip_action::AddClipAction;
use crate::action::begin_tool_action::BeginToolAction;
use crate::action::change_clip_duration_action::ChangeClipDurationAction;
use crate::action::delete_clip_action::DeleteClipAction;
use crate::action::move_clip_action::MoveClipAction;
use crate::action::set_clip_name_action::SetClipNameAction;
use crate::action::set_clip_properties_action::SetClipPropertiesAction;
use crate::action::set_clip_transform_action::SetClipTransformAction;
use crate::action::set_layer_lock_action::SetLayerLockAction;
use crate::action::set_layer_visibility_action::SetLayerVisibilityAction;
use crate::app::action_manager::ActionManager;
use crate::app::clip::{ClipMetadata, ClipProperties};
use crate::app::project::Project;
use crate::app::project_settings::ProjectSettings;
use crate::core::image::Image;
use crate::core::tool::{Tool, ToolPropertyValue};
use crate::core::transform::Transform;
use crate::gpu::GpuRenderer;

#[wasm_bindgen]
pub struct FlippenCore {
    project: Option<Project>,
    tools: Vec<Box<dyn Tool>>,
    action_manager: ActionManager,
    gpu_renderer: Option<GpuRenderer>,
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
            gpu_renderer: None,
        }
    }

    pub fn create_project(&mut self, settings: JsValue) -> Result<(), JsValue> {
        let settings: ProjectSettings = settings
            .into_serde()
            .map_err(|error| JsValue::from_str(&error.to_string()))?;
        self.project = Some(Project::new(settings));
        Ok(())
    }

    pub fn set_project_settings(&mut self, settings: JsValue) -> Result<(), JsValue> {
        let settings: ProjectSettings = settings
            .into_serde()
            .map_err(|error| JsValue::from_str(&error.to_string()))?;
        let project = self
            .project
            .as_mut()
            .ok_or_else(|| JsValue::from_str("Project is not initialized"))?;
        project.settings = settings;
        Ok(())
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

    pub fn get_project_settings(&self) -> Result<JsValue, JsValue> {
        let project = self
            .project
            .as_ref()
            .ok_or_else(|| JsValue::from_str("Project is not initialized"))?;
        JsValue::from_serde(&project.settings)
            .map_err(|error| JsValue::from_str(&error.to_string()))
    }

    pub fn begin_draw(&mut self, clip_id_str: String) {
        let clip_id = match Uuid::parse_str(&clip_id_str) {
            Ok(id) => id,
            Err(e) => {
                eprintln!("Failed to parse clip_id: {:?}", e);
                return;
            }
        };
        if self
            .project
            .as_ref()
            .is_some_and(|project| project.is_clip_locked(clip_id))
        {
            return;
        }
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

    pub fn can_undo(&self) -> bool {
        self.action_manager.can_undo()
    }

    pub fn can_redo(&self) -> bool {
        self.action_manager.can_redo()
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

        if project.is_clip_locked(clip_id) {
            return;
        }
        let clip = match project.get_clip_mut(clip_id) {
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

        let (width, height) = (clip.image.width, clip.image.height);
        let (x, y) = match clip.transform.inverse_transform_point(
            (x as f32, y as f32),
            (width as f32 / 2.0, height as f32 / 2.0),
        ) {
            Some((x, y))
                if x.is_finite()
                    && y.is_finite()
                    && x >= 0.0
                    && y >= 0.0
                    && x < width as f32
                    && y < height as f32 =>
            {
                (x.floor() as u32, y.floor() as u32)
            }
            Some(_) => return,
            None => {
                eprintln!("Clip transform is not invertible.");
                return;
            }
        };

        let alpha_locked = clip.metadata.alpha_locked;
        let previous_pixels = alpha_locked.then(|| clip.image.data.clone());
        let image = clip.get_image_mut();
        let color_array = [color[0], color[1], color[2], color[3]];
        tool.apply(image, x, y, color_array, Some(pressure));
        if let Some(previous_pixels) = previous_pixels {
            for (pixel, previous) in image
                .data
                .chunks_exact_mut(4)
                .zip(previous_pixels.chunks_exact(4))
            {
                if previous[3] == 0 {
                    pixel.copy_from_slice(previous);
                } else if pixel[3] == 0 {
                    pixel.copy_from_slice(previous);
                } else {
                    pixel[3] = previous[3];
                }
            }
        }
        clip.mark_image_changed();
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

    pub fn get_layers(&self) -> JsValue {
        let project = match self.project.as_ref() {
            Some(project) => project,
            None => return JsValue::undefined(),
        };

        JsValue::from_serde(project.composition.get_layers()).unwrap()
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

    pub fn get_clip_pixels(&self, clip_id_str: String) -> Option<Uint8ClampedArray> {
        let clip_id = Uuid::parse_str(&clip_id_str).ok()?;
        let project = self.project.as_ref()?;
        let clip = project
            .composition
            .clips
            .iter()
            .find(|clip| clip.metadata.id == clip_id)?;
        Some(Uint8ClampedArray::from(&clip.image.data[..]))
    }

    pub fn replace_clip_pixels(
        &mut self,
        clip_id_str: String,
        pixels: &[u8],
    ) -> Result<(), JsValue> {
        let clip_id =
            Uuid::parse_str(&clip_id_str).map_err(|error| JsValue::from_str(&error.to_string()))?;
        let project = self
            .project
            .as_mut()
            .ok_or_else(|| JsValue::from_str("Project is not initialized"))?;
        let clip = project
            .get_clip(clip_id)
            .ok_or_else(|| JsValue::from_str("Clip does not exist"))?;
        if project.is_clip_locked(clip_id) {
            return Err(JsValue::from_str("Clip is locked"));
        }
        if clip.image.data.len() != pixels.len() {
            return Err(JsValue::from_str(
                "Pixel data dimensions do not match the clip",
            ));
        }

        self.action_manager
            .do_action(Box::new(BeginToolAction::new(clip_id)), project);
        let clip = project
            .composition
            .clips
            .iter_mut()
            .find(|clip| clip.metadata.id == clip_id)
            .ok_or_else(|| JsValue::from_str("Clip does not exist"))?;
        clip.image.data.copy_from_slice(pixels);
        clip.mark_image_changed();
        Ok(())
    }

    pub fn move_clip(&mut self, clip_id_str: String, start_frame: u32, layer_index: usize) {
        let clip_id = match Uuid::parse_str(&clip_id_str) {
            Ok(id) => id,
            Err(e) => {
                eprintln!("Failed to parse clip_id: {:?}", e);
                return;
            }
        };

        let action = Box::new(MoveClipAction::new(clip_id, start_frame, layer_index));

        if let Some(project) = self.project.as_mut() {
            self.action_manager.do_action(action, project);
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

        let action = Box::new(ChangeClipDurationAction::new(clip_id, duration));

        if let Some(project) = self.project.as_mut() {
            self.action_manager.do_action(action, project);
        }
    }

    pub fn set_clip_properties(&mut self, clip_id_str: String, json: JsValue) {
        let clip_id = match Uuid::parse_str(&clip_id_str) {
            Ok(id) => id,
            Err(error) => {
                eprintln!("Failed to parse clip_id: {:?}", error);
                return;
            }
        };
        let properties: ClipProperties = match json.into_serde() {
            Ok(properties) => properties,
            Err(error) => {
                eprintln!("Failed to parse clip properties: {:?}", error);
                return;
            }
        };
        if !properties.opacity.is_finite() {
            eprintln!("Clip opacity must be finite.");
            return;
        }
        let action = Box::new(SetClipPropertiesAction::new(clip_id, properties));

        if let Some(project) = self.project.as_mut() {
            self.action_manager.do_action(action, project);
        }
    }

    pub fn set_clip_name(&mut self, clip_id_str: String, name: String) {
        let clip_id = match Uuid::parse_str(&clip_id_str) {
            Ok(id) => id,
            Err(error) => {
                eprintln!("Failed to parse clip_id: {:?}", error);
                return;
            }
        };
        if name.trim().is_empty() {
            eprintln!("Clip name cannot be empty.");
            return;
        }
        let action = Box::new(SetClipNameAction::new(clip_id, name));

        if let Some(project) = self.project.as_mut() {
            self.action_manager.do_action(action, project);
        }
    }

    pub fn show_layer(&mut self, layer_index: usize) {
        let action = Box::new(SetLayerVisibilityAction::new(layer_index, false));

        if let Some(project) = self.project.as_mut() {
            self.action_manager.do_action(action, project);
        }
    }

    pub fn hide_layer(&mut self, layer_index: usize) {
        let action = Box::new(SetLayerVisibilityAction::new(layer_index, true));

        if let Some(project) = self.project.as_mut() {
            self.action_manager.do_action(action, project);
        }
    }

    pub fn unlock_layer(&mut self, layer_index: usize) {
        let action = Box::new(SetLayerLockAction::new(layer_index, false));

        if let Some(project) = self.project.as_mut() {
            self.action_manager.do_action(action, project);
        }
    }

    pub fn lock_layer(&mut self, layer_index: usize) {
        let action = Box::new(SetLayerLockAction::new(layer_index, true));

        if let Some(project) = self.project.as_mut() {
            self.action_manager.do_action(action, project);
        }
    }

    pub async fn render_frame(&mut self, frame_index: u32) -> Option<Uint8ClampedArray> {
        let (width, height) = match self.project.as_ref() {
            Some(project) => (project.settings.width, project.settings.height),
            None => return None,
        };
        if self.gpu_renderer.is_none() {
            self.gpu_renderer = GpuRenderer::new().await.ok();
        }
        let renderer = self.gpu_renderer.as_mut()?;
        let project = self.project.as_ref()?;
        let image = project
            .composition
            .render_frame_gpu(renderer, frame_index, width, height)
            .await
            .ok()?;
        Some(Uint8ClampedArray::from(&image.data[..]))
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

        let transform: Transform = match json.into_serde() {
            Ok(transform) => transform,
            Err(e) => {
                eprintln!("Failed to parse transform: {:?}", e);
                return;
            }
        };
        let action = Box::new(SetClipTransformAction::new(clip_id, transform));

        if let Some(project) = self.project.as_mut() {
            self.action_manager.do_action(action, project);
        }
    }

    pub fn export(&self) -> Vec<u8> {
        rmp_serde::to_vec(&self.project).unwrap()
    }

    pub fn import(&mut self, data: &[u8]) {
        match rmp_serde::from_slice::<Project>(data) {
            Ok(mut project) => {
                project.composition.ensure_layers();
                self.project = Some(project);
            }
            Err(e) => {
                eprintln!("Failed to import composition: {:?}", e);
            }
        }
    }
}
