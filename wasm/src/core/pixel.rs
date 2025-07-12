pub struct Pixel {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8,
}

impl Pixel {
    pub fn is_transparent(&self) -> bool {
        self.a == 0
    }

    pub fn is_opaque(&self) -> bool {
        self.a == 255
    }
}
