use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ProjectSettings {
    pub title: String,
    pub width: u32,
    pub height: u32,
    pub frame_rate: u32,
    #[serde(default)]
    pub start_frame: u32,
    #[serde(default = "default_end_frame")]
    pub end_frame: u32,
}

fn default_end_frame() -> u32 {
    255
}

#[cfg(test)]
mod tests {
    use super::ProjectSettings;
    use serde::Serialize;

    #[derive(Serialize)]
    struct LegacyProjectSettings {
        title: String,
        width: u32,
        height: u32,
        frame_rate: u32,
    }

    #[test]
    fn legacy_settings_default_to_the_original_frame_range() {
        let legacy_settings = LegacyProjectSettings {
            title: "Legacy".to_string(),
            width: 1280,
            height: 720,
            frame_rate: 8,
        };
        let data = rmp_serde::to_vec(&legacy_settings).unwrap();

        let settings: ProjectSettings = rmp_serde::from_slice(&data).unwrap();

        assert_eq!(settings.start_frame, 0);
        assert_eq!(settings.end_frame, 255);
    }
}
