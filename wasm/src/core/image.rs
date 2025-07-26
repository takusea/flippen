use cgmath::{Point2, Transform};
use serde::{Deserialize, Serialize};

use crate::core::{pixel::Pixel, transform};

#[derive(Clone, Serialize, Deserialize)]
pub struct Image {
    #[serde(with = "serde_bytes")]
    pub data: Vec<u8>,
    pub width: u32,
    pub height: u32,
}

impl Image {
    pub fn new(width: u32, height: u32) -> Self {
        Image {
            data: vec![0; (width * height * 4) as usize],
            width,
            height,
        }
    }

    fn get_pixel(&self, x: u32, y: u32) -> Pixel {
        let idx = ((y * self.width + x) * 4) as usize;
        Pixel {
            r: self.data[idx],
            g: self.data[idx + 1],
            b: self.data[idx + 2],
            a: self.data[idx + 3],
        }
    }

    fn blend_pixel(&mut self, x: u32, y: u32, src: Pixel) {
        let idx = ((y * self.width + x) * 4) as usize;

        if src.is_transparent() {
            return;
        }

        if src.is_opaque() {
            self.data[idx] = src.r;
            self.data[idx + 1] = src.g;
            self.data[idx + 2] = src.b;
            self.data[idx + 3] = 255;
            return;
        }

        let dst_r = self.data[idx] as u16;
        let dst_g = self.data[idx + 1] as u16;
        let dst_b = self.data[idx + 2] as u16;
        let dst_a = self.data[idx + 3] as u16;

        let src_r = src.r as u16;
        let src_g = src.g as u16;
        let src_b = src.b as u16;
        let src_a = src.a as u16;

        let alpha = src_a;
        let inv_alpha = 255 - alpha;

        self.data[idx] = ((src_r * alpha + dst_r * inv_alpha) / 255) as u8;
        self.data[idx + 1] = ((src_g * alpha + dst_g * inv_alpha) / 255) as u8;
        self.data[idx + 2] = ((src_b * alpha + dst_b * inv_alpha) / 255) as u8;
        self.data[idx + 3] = ((src_a + dst_a * inv_alpha / 255).min(255)) as u8;
    }

    pub fn composite(&mut self, src: &Image, offset_x: u32, offset_y: u32) {
        for y in 0..src.height {
            for x in 0..src.width {
                let bx = x + offset_x;
                let by = y + offset_y;

                if bx >= self.width || by >= self.height {
                    continue;
                }

                let src_pixel = src.get_pixel(x, y);

                self.blend_pixel(bx, by, src_pixel);
            }
        }
    }

    pub fn transform(&self, transform: &transform::Transform) -> Image {
        let cx = self.width as f32 / 2.0;
        let cy = self.height as f32 / 2.0;

        let inverse = transform.to_inverse_matrix3((cx, cy)).unwrap();

        let mut output = Image {
            width: self.width,
            height: self.height,
            data: vec![0; (self.width * self.height * 4) as usize],
        };

        for y_out in 0..self.height {
            for x_out in 0..self.width {
                let dst = Point2::new(x_out as f32, y_out as f32);
                let src = inverse.transform_point(dst);

                let rgba = if src.x >= 0.0
                    && src.y >= 0.0
                    && src.x < self.width as f32
                    && src.y < self.height as f32
                {
                    self.sample_bilinear(src.x, src.y)
                } else {
                    [0, 0, 0, 0]
                };

                let i = ((y_out * self.width + x_out) << 2) as usize;
                output.data[i..i + 4].copy_from_slice(&rgba);
            }
        }

        output
    }

    pub fn sample_bilinear(&self, x: f32, y: f32) -> [u8; 4] {
        let x0 = x.floor() as i32;
        let y0 = y.floor() as i32;
        let x1 = x0 + 1;
        let y1 = y0 + 1;

        let fx = x - x0 as f32;
        let fy = y - y0 as f32;

        let c00 = self.get_pixel_clamped(x0, y0);
        let c10 = self.get_pixel_clamped(x1, y0);
        let c01 = self.get_pixel_clamped(x0, y1);
        let c11 = self.get_pixel_clamped(x1, y1);

        let mut result = [0u8; 4];
        for i in 0..4 {
            let top = c00[i] as f32 * (1.0 - fx) + c10[i] as f32 * fx;
            let bottom = c01[i] as f32 * (1.0 - fx) + c11[i] as f32 * fx;
            result[i] = (top * (1.0 - fy) + bottom * fy).round() as u8;
        }
        result
    }

    pub fn get_pixel_clamped(&self, x: i32, y: i32) -> [u8; 4] {
        let x = x.clamp(0, self.width as i32 - 1);
        let y = y.clamp(0, self.height as i32 - 1);
        let i = ((y as u32 * self.width + x as u32) * 4) as usize;
        let mut rgba = [0; 4];
        rgba.copy_from_slice(&self.data[i..i + 4]);
        rgba
    }
}
