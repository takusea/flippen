use std::collections::HashMap;

use crate::core::{
    color::Color,
    image::Image,
    tool::{Tool, ToolPropertyValue},
};

pub struct EraserTool {
    pub size: u32,
}

impl Tool for EraserTool {
    fn apply(&mut self, image: &mut Image, x: u32, y: u32, _color: Color, pressure: Option<f32>) {
        let pressure = pressure.unwrap_or(1.0);
        let radius = (self.size as f32 * pressure) as i32;
        let fw = image.width as i32;
        let fh = image.height as i32;

        for dy in -radius..=radius {
            for dx in -radius..=radius {
                if dx * dx + dy * dy <= radius * radius {
                    let px = x as i32 + dx;
                    let py = y as i32 + dy;
                    if px < 0 || py < 0 || px >= fw || py >= fh {
                        continue;
                    }
                    let idx = ((py * fw + px) * 4) as usize;
                    image.data[idx + 3] = 0;
                }
            }
        }
    }

    fn get_properties(&self) -> HashMap<&str, ToolPropertyValue> {
        HashMap::from([("size", ToolPropertyValue::Number((self.size as f64)))])
    }

    fn set_property(&mut self, name: &str, value: ToolPropertyValue) {
        match (name, value) {
            ("size", ToolPropertyValue::Number(size)) => {
                self.size = size.max(1.0) as u32;
            }
            _ => {
                eprintln!("Brush: Unknown or invalid property: {}.", name);
            }
        }
    }
}
