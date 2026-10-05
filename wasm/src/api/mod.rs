mod clip;
mod drawing;
mod export;
mod playback;
mod project;

use crate::app::action_manager::ActionManager;
use crate::app::project::Project;
use crate::core::tool::Tool;
use crate::gpu::GpuRenderer;
use crate::tool;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub struct FlippenCore {
    project: Option<Project>,
    tools: Vec<Box<dyn Tool>>,
    action_manager: ActionManager,
    gpu_renderer: Option<GpuRenderer>,
}

#[wasm_bindgen]
impl FlippenCore {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        console_error_panic_hook::set_once();
        Self {
            project: None,
            tools: vec![
                Box::new(tool::circle_brush_tool::CircleBrushTool { size: 5 }),
                Box::new(tool::eraser_tool::EraserTool { size: 5 }),
                Box::new(tool::fill_tool::FillTool { tolerance: 500 }),
            ],
            action_manager: ActionManager::new(),
            gpu_renderer: None,
        }
    }
}
