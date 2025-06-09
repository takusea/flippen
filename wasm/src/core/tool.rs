use crate::core::{color::Color, image::Image};

pub enum ToolPropertyValue {
    Number(f64),
    Bool(bool),
    String(String),
    Image(Image),
    Color(Color),
}

pub trait Tool {
    fn apply(&mut self, frame: &mut Image, x: u32, y: u32, color: Color, pressure: Option<f32>);
    fn set_property(&mut self, name: &str, value: ToolPropertyValue);
}
