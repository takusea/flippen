use crate::app::frame_list::FrameList;
use crate::core::color::Color;
use crate::core::image::Image;
use crate::core::tool::Tool;
use crate::tool::circle_brush_tool::CircleBrushTool;
use crate::tool::eraser_tool::EraserTool;
use crate::tool::fill_tool::FillTool;

pub struct Context {
    pub frames: FrameList,
    pub tools: Vec<Box<dyn Tool>>,
    pub width: u32,
    pub height: u32,
}

impl Context {
    pub fn new(width: u32, height: u32) -> Self {
        Self {
            frames: FrameList::new(
                vec![Image {
                    data: vec![0; (width * height * 4) as usize],
                    width,
                    height,
                }],
                0,
            ),
            tools: vec![
                Box::new(CircleBrushTool { size: 5 }),
                Box::new(EraserTool { size: 5 }),
                Box::new(FillTool { tolerance: 500 }),
            ],
            width,
            height,
        }
    }
    pub fn apply_tool(
        &mut self,
        index: usize,
        x: u32,
        y: u32,
        color: Color,
        pressure: Option<f32>,
    ) {
        let frame = &mut self.frames.frames[self.frames.current_index];

        if let Some(tool) = self.tools.get_mut(index) {
            tool.apply(frame, x, y, color, pressure);
        }
    }
}
