use serde::{Deserialize, Serialize};

use crate::app::composition::Composition;
use crate::app::project_settings::ProjectSettings;

#[derive(Serialize, Deserialize)]
pub struct Project {
    pub composition: Composition,
    pub settings: ProjectSettings,
}
