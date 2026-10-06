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
        let clip_id = *self.clip_id.get_or_insert_with(Uuid::new_v4);
        let name = self
            .name
            .get_or_insert_with(|| format!("Clip {}", project.composition.clips.len() + 1))
            .clone();
        let clip = Clip {
            metadata: ClipMetadata {
                id: clip_id,
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
        project.composition.add_clip(clip);
    }
}

#[cfg(test)]
mod tests {
    use super::AddClipAction;
    use crate::action::move_clip_action::MoveClipAction;
    use crate::app::action_manager::ActionManager;
    use crate::app::project::Project;
    use crate::app::project_settings::ProjectSettings;

    #[test]
    fn redo_preserves_clip_id_for_later_action_redo() {
        let mut manager = ActionManager::new();
        let mut project = Project::new(ProjectSettings {
            title: "Test".to_string(),
            width: 1,
            height: 1,
            frame_rate: 1,
            start_frame: 0,
            end_frame: 1,
        });

        manager.do_action(Box::new(AddClipAction::new(0, 0)), &mut project);
        let clip_id = project.composition.clips[0].metadata.id;
        manager.do_action(
            Box::new(MoveClipAction::new(clip_id, 5, 0)),
            &mut project,
        );

        manager.undo(&mut project);
        manager.undo(&mut project);
        assert!(project.composition.clips.is_empty());

        manager.redo(&mut project);
        assert_eq!(project.composition.clips[0].metadata.id, clip_id);
        assert_eq!(project.composition.clips[0].metadata.start, 0);

        manager.redo(&mut project);
        assert_eq!(project.composition.clips[0].metadata.id, clip_id);
        assert_eq!(project.composition.clips[0].metadata.start, 5);
    }
}

impl UndoableAction for AddClipAction {
    fn undo(&mut self, project: &mut Project) {
        if let Some(clip_id) = self.clip_id {
            project.composition.delete_clip(clip_id);
        }
    }
}
