use serde::{Deserialize, Serialize};

use crate::core::pixel::Pixel;

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
}
