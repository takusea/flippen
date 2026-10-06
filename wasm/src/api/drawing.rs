use super::FlippenCore;
use crate::action::draw_stroke_action::DrawStrokeAction;
use crate::action::set_layer_lock_action::SetLayerLockAction;
use crate::action::set_layer_visibility_action::SetLayerVisibilityAction;
use crate::core::image::Image;
use crate::core::tool::ToolPropertyValue;
use gloo::utils::format::JsValueSerdeExt;
use uuid::Uuid;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

#[wasm_bindgen]
impl FlippenCore {
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
        let action = Box::new(DrawStrokeAction::new(clip_id));
        if let Some(project) = self.project.as_mut() {
            self.action_manager.do_action(action, project);
            self.action_manager.begin_pixel_recording();
        }
    }

    pub fn end_draw(&mut self) {
        self.action_manager.end_pixel_recording();
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
        let mut changes = Vec::new();
        let image = clip.get_image_mut();
        let color_array = [color[0], color[1], color[2], color[3]];
        tool.apply(image, x, y, color_array, Some(pressure), &mut changes);
        if alpha_locked {
            for change in &mut changes {
                let pixel = &mut image.data[change.index..change.index + 4];
                if change.before[3] == 0 || pixel[3] == 0 {
                    pixel.copy_from_slice(&change.before);
                } else {
                    pixel[3] = change.before[3];
                }
                change.after.copy_from_slice(pixel);
            }
        }
        if !changes.is_empty() {
            clip.mark_image_changed();
        }
        self.action_manager.record_pixel_changes(clip_id, changes);
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
}
