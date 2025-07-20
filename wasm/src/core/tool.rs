use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::core::{color::Color, image::Image};

#[derive(Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ToolPropertyValue {
    Number(f64),
    Bool(bool),
    String(String),
    Image(Option<Image>),
    Color(Color),
}

pub trait Tool {
    fn apply(&mut self, image: &mut Image, x: u32, y: u32, color: Color, pressure: Option<f32>);
    fn get_properties(&self) -> HashMap<&str, ToolPropertyValue>;
    fn set_property(&mut self, name: &str, value: ToolPropertyValue);
}
