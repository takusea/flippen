use crate::core::{image::Image, transform::Transform};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

fn default_opacity() -> f32 {
    1.0
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum BlendMode {
    Normal,
    Multiply,
    Screen,
    Add,
}

impl Default for BlendMode {
    fn default() -> Self {
        Self::Normal
    }
}

#[derive(Serialize, Deserialize, Clone, Copy)]
pub struct ClipProperties {
    #[serde(default)]
    pub hidden: bool,
    #[serde(default)]
    pub alpha_locked: bool,
    #[serde(default)]
    pub locked: bool,
    #[serde(default = "default_opacity")]
    pub opacity: f32,
    #[serde(default)]
    pub blend_mode: BlendMode,
}

impl Default for ClipProperties {
    fn default() -> Self {
        Self {
            hidden: false,
            alpha_locked: false,
            locked: false,
            opacity: default_opacity(),
            blend_mode: BlendMode::default(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ClipMetadata {
    pub id: Uuid,
    pub start: u32,
    pub layer_index: usize,
    pub duration: u32,
    #[serde(default)]
    pub hidden: bool,
    #[serde(default)]
    pub alpha_locked: bool,
    #[serde(default)]
    pub locked: bool,
    #[serde(default = "default_opacity")]
    pub opacity: f32,
    #[serde(default)]
    pub blend_mode: BlendMode,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Clip {
    pub metadata: ClipMetadata,
    pub transform: Transform,
    pub image: Image,
    #[serde(skip)]
    pub image_revision: u64,
}

impl Clip {
    pub fn properties(&self) -> ClipProperties {
        ClipProperties {
            hidden: self.metadata.hidden,
            alpha_locked: self.metadata.alpha_locked,
            locked: self.metadata.locked,
            opacity: self.metadata.opacity,
            blend_mode: self.metadata.blend_mode,
        }
    }

    pub fn set_properties(&mut self, properties: ClipProperties) {
        self.metadata.hidden = properties.hidden;
        self.metadata.alpha_locked = properties.alpha_locked;
        self.metadata.locked = properties.locked;
        self.metadata.opacity = if properties.opacity.is_finite() {
            properties.opacity.clamp(0.0, 1.0)
        } else {
            1.0
        };
        self.metadata.blend_mode = properties.blend_mode;
    }

    pub fn contains_frame(&self, frame_index: u32) -> bool {
        let is_after_start = self.metadata.start <= frame_index;
        let is_before_end = frame_index < self.metadata.start + self.metadata.duration;
        is_after_start && is_before_end
    }

    pub fn get_image(&self) -> &Image {
        &self.image
    }

    pub fn get_image_mut(&mut self) -> &mut Image {
        &mut self.image
    }

    pub fn set_image(&mut self, image: Image) {
        self.image = image;
        self.image_revision = self.image_revision.wrapping_add(1);
    }

    pub fn mark_image_changed(&mut self) {
        self.image_revision = self.image_revision.wrapping_add(1);
    }
}

#[cfg(test)]
mod tests {
    use super::{BlendMode, Clip, ClipMetadata};
    use crate::core::{image::Image, transform::Transform};
    use uuid::Uuid;

    #[test]
    fn clip_properties_and_anchor_survive_serialization() {
        let mut clip = Clip {
            metadata: ClipMetadata {
                id: Uuid::new_v4(),
                start: 3,
                layer_index: 2,
                duration: 4,
                hidden: false,
                alpha_locked: false,
                locked: false,
                opacity: 1.0,
                blend_mode: BlendMode::Normal,
            },
            transform: Transform::default(),
            image: Image::new(1, 1),
            image_revision: 0,
        };
        clip.set_properties(super::ClipProperties {
            hidden: true,
            alpha_locked: true,
            locked: true,
            opacity: 0.4,
            blend_mode: BlendMode::Multiply,
        });
        clip.transform.anchor = (0.25, 0.75);

        let bytes = rmp_serde::to_vec(&clip).unwrap();
        let restored: Clip = rmp_serde::from_slice(&bytes).unwrap();

        assert!(restored.metadata.hidden);
        assert!(restored.metadata.alpha_locked);
        assert!(restored.metadata.locked);
        assert!((restored.metadata.opacity - 0.4).abs() < f32::EPSILON);
        assert_eq!(restored.metadata.blend_mode, BlendMode::Multiply);
        assert_eq!(restored.transform.anchor, (0.25, 0.75));
    }
}
