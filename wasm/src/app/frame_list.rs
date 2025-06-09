use crate::core::image::Image;

pub struct FrameList {
    pub frames: Vec<Image>,
    pub current_index: usize,
}

impl FrameList {
    pub fn new(frames: Vec<Image>, current_index: usize) -> Self {
        Self {
            frames,
            current_index,
        }
    }

    pub fn get_frame(&self, index: usize) -> &Image {
        &self.frames[index]
    }

    pub fn current_frame(&self) -> &Image {
        &self.frames[self.current_index]
    }

    pub fn current_frame_mut(&mut self) -> &mut Image {
        &mut self.frames[self.current_index]
    }

    pub fn prev(&mut self) {
        if self.current_index > 0 {
            self.current_index -= 1;
        }
    }

    pub fn next(&mut self) {
        if self.current_index < self.frames.len() - 1 {
            self.current_index += 1;
        }
    }

    pub fn first(&mut self) {
        self.current_index = 0;
    }

    pub fn last(&mut self) {
        self.current_index = self.frames.len() - 1;
    }

    pub fn insert(&mut self, index: usize, new_frame: Image) {
        self.frames.insert(index + 1, new_frame);
    }

    pub fn delete(&mut self, index: usize) {
        if self.frames.len() <= 1 {
            return;
        }
        self.frames.remove(index);
        if index >= self.frames.len() {
            self.current_index = self.frames.len() - 1;
        }
    }

    pub fn len(&self) -> usize {
        self.frames.len()
    }
}
