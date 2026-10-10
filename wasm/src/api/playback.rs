use super::FlippenCore;
use crate::gpu::GpuRenderer;
use js_sys::Uint8ClampedArray;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
impl FlippenCore {
    pub async fn render_frame(&mut self, frame_index: u32) -> Option<Uint8ClampedArray> {
        let (width, height) = match self.project.as_ref() {
            Some(project) => (project.settings.width, project.settings.height),
            None => return None,
        };
        if self.gpu_renderer.is_none() {
            match GpuRenderer::new().await {
                Ok(renderer) => {
                    self.gpu_renderer = Some(renderer);
                }
                Err(error) => {
                    web_sys::console::error_1(
                        &format!("GPU initialization failed: {error}").into(),
                    );
                    return None;
                }
            }
        }

        let renderer = self.gpu_renderer.as_mut()?;
        let project = self.project.as_ref()?;

        let image = match project
            .composition
            .render_frame_gpu(renderer, frame_index, width, height)
            .await
        {
            Ok(image) => image,
            Err(error) => {
                web_sys::console::error_1(&format!("GPU frame rendering failed: {error}").into());
                return None;
            }
        };

        Some(Uint8ClampedArray::from(&image.data[..]))
    }
}
