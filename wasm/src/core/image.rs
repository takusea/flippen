use serde::{Deserialize, Serialize};

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

    pub fn composite(&mut self, overlay: &Image, x_offset: u32, y_offset: u32) {
        for y in 0..overlay.height {
            for x in 0..overlay.width {
                let bx = x + x_offset;
                let by = y + y_offset;
                if bx >= self.width || by >= self.height {
                    continue; // 範囲外
                }

                let base_idx = ((by * self.width + bx) * 4) as usize;
                let overlay_idx = ((y * overlay.width + x) * 4) as usize;

                let src_r = overlay.data[overlay_idx + 0] as f32;
                let src_g = overlay.data[overlay_idx + 1] as f32;
                let src_b = overlay.data[overlay_idx + 2] as f32;
                let src_a = overlay.data[overlay_idx + 3] as f32 / 255.0;

                let dst_r = self.data[base_idx + 0] as f32;
                let dst_g = self.data[base_idx + 1] as f32;
                let dst_b = self.data[base_idx + 2] as f32;
                let dst_a = self.data[base_idx + 3] as f32 / 255.0;

                let out_a = src_a + dst_a * (1.0 - src_a);
                if out_a > 0.0 {
                    self.data[base_idx + 0] =
                        (((src_r * src_a) + (dst_r * dst_a * (1.0 - src_a))) / out_a) as u8;
                    self.data[base_idx + 1] =
                        (((src_g * src_a) + (dst_g * dst_a * (1.0 - src_a))) / out_a) as u8;
                    self.data[base_idx + 2] =
                        (((src_b * src_a) + (dst_b * dst_a * (1.0 - src_a))) / out_a) as u8;
                    self.data[base_idx + 3] = (out_a * 255.0) as u8;
                }
            }
        }
    }
}
