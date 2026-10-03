use cgmath::{Matrix3, Rad, SquareMatrix, Vector2, Vector3};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Transform {
    pub position: (f32, f32),
    pub rotation: f32,
    pub scale: (f32, f32),
}

impl Default for Transform {
    fn default() -> Self {
        Self {
            position: (0.0, 0.0),
            rotation: 0.0,
            scale: (1.0, 1.0),
        }
    }
}

impl Transform {
    pub fn to_matrix3(&self, center: (f32, f32)) -> Matrix3<f32> {
        let (cx, cy) = center;

        let scale = Matrix3::from_nonuniform_scale(self.scale.0, self.scale.1);
        let rotation = Matrix3::from_angle_z(Rad(self.rotation.to_radians()));
        let translation = Matrix3::from_translation(Vector2::new(self.position.0, self.position.1));

        let to_origin = Matrix3::from_translation(Vector2::new(-cx, -cy));
        let from_origin = Matrix3::from_translation(Vector2::new(cx, cy));

        from_origin * translation * rotation * scale * to_origin
    }

    pub fn to_inverse_matrix3(&self, center: (f32, f32)) -> Option<Matrix3<f32>> {
        self.to_matrix3(center).invert()
    }

    pub fn inverse_transform_point(
        &self,
        point: (f32, f32),
        center: (f32, f32),
    ) -> Option<(f32, f32)> {
        let inverse = self.to_inverse_matrix3(center)?;
        let transformed = inverse * Vector3::new(point.0, point.1, 1.0);
        Some((transformed.x, transformed.y))
    }
}

#[cfg(test)]
mod tests {
    use super::Transform;

    #[test]
    fn inverse_transform_point_accounts_for_translation_rotation_and_scale() {
        let transform = Transform {
            position: (10.0, -5.0),
            rotation: 90.0,
            scale: (2.0, 1.0),
        };

        let (x, y) = transform
            .inverse_transform_point((60.0, 65.0), (50.0, 50.0))
            .unwrap();

        assert!((x - 60.0).abs() < 0.001);
        assert!((y - 50.0).abs() < 0.001);
    }
}
