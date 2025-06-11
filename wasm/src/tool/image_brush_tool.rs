use crate::core::{
    color::Color,
    image::Image,
    tool::{Tool, ToolPropertyValue},
};

pub struct ImageBrushTool {
    pub size: u32,
    pub image: Option<Image>,
}

impl Tool for ImageBrushTool {
    fn apply(&mut self, image: &mut Image, x: u32, y: u32, color: Color, pressure: Option<f32>) {
        let pressure = pressure.unwrap_or(1.0);
        if let Some(ref brush_image) = self.image {
            let bw = brush_image.width;
            let bh = brush_image.height;
            let brush_data = &brush_image.data;

            let scale = self.size as f32 * pressure / (bw).min(bh) as f32;
            let scaled_w = (bw as f32 * scale) as u32;
            let scaled_h = (bh as f32 * scale) as u32;

            let half_w = (scaled_w / 2) as i32;
            let half_h = (scaled_h / 2) as i32;

            let fw = image.width as i32;
            let fh = image.height as i32;

            for sy in 0..scaled_h {
                for sx in 0..scaled_w {
                    let dx = x as i32 - half_w + sx as i32;
                    let dy = y as i32 - half_h + sy as i32;
                    if dx < 0 || dy < 0 || dx >= fw || dy >= fh {
                        continue;
                    }

                    // 最近傍補間で元画像のピクセルを取得
                    let ox = (sx as f32 / scaled_w as f32 * bw as f32) as usize;
                    let oy = (sy as f32 / scaled_h as f32 * bh as f32) as usize;

                    let idx = (oy * bw as usize + ox) * 4;
                    let r = brush_data[idx];
                    let g = brush_data[idx + 1];
                    let b = brush_data[idx + 2];
                    let a = brush_data[idx + 3];

                    if a == 0 {
                        continue;
                    }

                    // 色変換（カラー着色モード）
                    let (cr, cg, cb, _) = (color[0], color[1], color[2], color[3]);
                    let colored_r = (r as u16 * cr as u16 / 255) as u8;
                    let colored_g = (g as u16 * cg as u16 / 255) as u8;
                    let colored_b = (b as u16 * cb as u16 / 255) as u8;

                    let fi = ((dy as u32 * image.width + dx as u32) * 4) as usize;

                    if fi + 4 > image.data.len() {
                        continue;
                    }

                    let dst = &mut image.data[fi..fi + 4];
                    let alpha = a as f32 / 255.0;

                    dst[0] = ((1.0 - alpha) * dst[0] as f32 + alpha * colored_r as f32) as u8;
                    dst[1] = ((1.0 - alpha) * dst[1] as f32 + alpha * colored_g as f32) as u8;
                    dst[2] = ((1.0 - alpha) * dst[2] as f32 + alpha * colored_b as f32) as u8;
                    dst[3] = 255;
                }
            }
        }
    }

    fn set_property(&mut self, name: &str, value: ToolPropertyValue) {
        match (name, value) {
            ("size", ToolPropertyValue::Number(size)) => {
                self.size = size.max(1.0) as u32; // sizeが0以下にならないように
            }
            ("image", ToolPropertyValue::Image(image)) => {
                self.image = Some(image);
            }
            _ => {
                eprintln!("Brush: Unknown or invalid property: {}.", name);
            }
        }
    }
}
