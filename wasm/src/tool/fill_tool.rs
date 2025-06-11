use crate::core::{
    color::{color_distance, Color},
    image::Image,
    tool::{Tool, ToolPropertyValue},
};

pub struct FillTool {
    pub tolerance: u32,
}

impl Tool for FillTool {
    fn apply(&mut self, image: &mut Image, x: u32, y: u32, color: Color, _pressure: Option<f32>) {
        let idx = ((y as usize) * (image.width as usize) + (x as usize)) * 4;
        if idx + 3 >= image.data.len() {
            return;
        }
        let target_color = {
            let slice = &image.data[idx..idx + 4];
            [slice[0], slice[1], slice[2], slice[3]]
        };

        if color_distance(&target_color, &color) <= 0 {
            return;
        }

        let mut visited = vec![false; image.width as usize * image.height as usize];
        let mut stack = vec![(x, y)];

        while let Some((cx, cy)) = stack.pop() {
            if cx >= image.width || cy >= image.height {
                continue;
            }

            let i = ((cy as usize) * (image.width as usize) + (cx as usize)) * 4;
            let vi = (cy as usize) * (image.width as usize) + (cx as usize);

            if visited[vi] {
                continue;
            }
            visited[vi] = true;

            if color_distance((&image.data[i..i + 4]).try_into().unwrap(), &target_color)
                > self.tolerance
            {
                continue;
            }

            image.data[i..i + 4].copy_from_slice(&color);

            if cx > 0 {
                stack.push((cx - 1, cy));
            }
            if cx + 1 < image.width {
                stack.push((cx + 1, cy));
            }
            if cy > 0 {
                stack.push((cx, cy - 1));
            }
            if cy + 1 < image.height {
                stack.push((cx, cy + 1));
            }
        }
    }

    fn set_property(&mut self, name: &str, value: ToolPropertyValue) {
        match (name, value) {
            ("tolerance", ToolPropertyValue::Number(tolerance)) => {
                self.tolerance = tolerance.max(0.0) as u32;
            }
            _ => {
                eprintln!("Brush: Unknown or invalid property: {}.", name);
            }
        }
    }
}
