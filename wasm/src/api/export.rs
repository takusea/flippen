use super::FlippenCore;
use crate::app::project::Project;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
impl FlippenCore {
    pub fn export(&self) -> Vec<u8> {
        rmp_serde::to_vec(&self.project).unwrap()
    }

    pub fn import(&mut self, data: &[u8]) {
        match rmp_serde::from_slice::<Project>(data) {
            Ok(mut project) => {
                project.composition.ensure_layers();
                self.project = Some(project);
            }
            Err(e) => {
                eprintln!("Failed to import composition: {:?}", e);
            }
        }
    }
}
