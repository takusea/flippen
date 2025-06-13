use crate::app::frame_list::FrameList;
use crate::core::color::Color;
use crate::core::image::Image;
use crate::core::tool::Tool;
use crate::tool::circle_brush_tool::CircleBrushTool;
use crate::tool::eraser_tool::EraserTool;
use crate::tool::fill_tool::FillTool;

pub struct App {
    pub frames: FrameList,
    pub tools: Vec<Box<dyn Tool>>,
    pub current_color: Color,
    pub width: u32,
    pub height: u32,
    undo_stack: Vec<Vec<u8>>,
    redo_stack: Vec<Vec<u8>>,
}

impl App {
    pub fn new(width: u32, height: u32) -> Self {
        Self {
            frames: FrameList::new(
                vec![Image {
                    data: vec![255; (width * height * 4) as usize],
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
            current_color: [0, 0, 0, 255],
            width,
            height,
            undo_stack: Vec::new(),
            redo_stack: Vec::new(),
        }
    }

    pub fn push_undo(&mut self) {
        let current = &self.frames.current_frame().data;
        self.undo_stack.push(current.clone());
        self.redo_stack.clear(); // 新しい操作が入ったのでやり直し履歴は無効
    }

    pub fn undo(&mut self) {
        if let Some(previous) = self.undo_stack.pop() {
            let current = &self.frames.current_frame().data;
            self.redo_stack.push(current.clone());
            self.frames.current_frame_mut().data = previous;
        }
    }

    pub fn redo(&mut self) {
        if let Some(next) = self.redo_stack.pop() {
            let current = &self.frames.current_frame().data;
            self.undo_stack.push(current.clone());
            self.frames.current_frame_mut().data = next;
        }
    }

    pub fn apply_tool(&mut self, index: usize, x: u32, y: u32, pressure: Option<f32>) {
        let frame = self.frames.current_frame_mut();

        if let Some(tool) = self.tools.get_mut(index) {
            tool.apply(frame, x, y, self.current_color, pressure);
        }
    }
}
