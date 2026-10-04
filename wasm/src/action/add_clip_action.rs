use uuid::Uuid;

use crate::app::action::Action;
use crate::app::action::UndoableAction;
use crate::app::clip::Clip;
use crate::app::clip::ClipMetadata;
use crate::app::project::Project;
use crate::core::image::Image;
use crate::core::transform::Transform;

pub struct AddClipAction {
    start_frame: u32,
    layer_index: usize,
    clip_id: Option<Uuid>,
    name: Option<String>,
}

impl AddClipAction {
    pub fn new(start_frame: u32, layer_index: usize) -> Self {
        Self {
            start_frame,
            layer_index,
            clip_id: None,
            name: None,
        }
    }
}

impl Action for AddClipAction {
    fn apply(&mut self, project: &mut Project) {
        let name = self
            .name
            .get_or_insert_with(|| format!("Clip {}", project.composition.clips.len() + 1))
            .clone();
        let clip = Clip {
            metadata: ClipMetadata {
                id: Uuid::new_v4(),
                name,
                start: self.start_frame,
                layer_index: self.layer_index,
                duration: 1,
                hidden: false,
                alpha_locked: false,
                locked: false,
                opacity: 1.0,
                blend_mode: crate::app::clip::BlendMode::default(),
            },
            transform: Transform::default(),
            image: Image::new(project.settings.width, project.settings.height),
            image_revision: 0,
        };
        self.clip_id = Some(clip.metadata.id);
        project.composition.add_clip(clip);
    }
}

impl UndoableAction for AddClipAction {
    fn undo(&mut self, project: &mut Project) {
        if let Some(clip_id) = self.clip_id {
            project.composition.delete_clip(clip_id);
        }
    }
}
