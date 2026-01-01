use three_d::*;


pub async fn load_model(
    context: &Context,
    path: impl AsRef<std::path::Path>,
) -> Option<Model<PhysicalMaterial>> {
    let loaded = three_d_asset::io::load_and_deserialize_async(path)
        .await
        .ok()?;
    let model = Model::<PhysicalMaterial>::new(context, &loaded).ok()?;

    Some(model)
}

pub fn as_clear_state(Srgba { r, g, b, a }: Srgba) -> ClearState {
    ClearState::color_and_depth(
        (r as f32) / 255.0,
        (g as f32) / 255.0,
        (b as f32) / 255.0,
        (a as f32) / 255.0,
        1.0,
    )
}

//
// Moves the camera towards the given point by the amount delta while keeping the given minimum and maximum distance to the point.
//
pub fn move_towards(
    camera: &mut Camera,
    point: &Vec3,
    delta: f32,
    minimum_distance: f32,
    maximum_distance: f32,
) {
    let minimum_distance = minimum_distance.max(0.0);
    assert!(
        minimum_distance < maximum_distance,
        "minimum_distance larger than maximum_distance"
    );

    let target = camera.target();
    let camera_position = camera.position();
    let distance = point.distance(camera_position);
    let direction = (point - camera_position).normalize();
    let up = camera.up();
    let new_distance = (distance - delta).clamp(minimum_distance, maximum_distance);
    let new_position = point - direction * new_distance;

    camera.set_view(new_position, new_position + (target - camera_position), up);
}


pub fn slide(percentage: u32) {
    let web_window = web_sys::window().expect("to have window");
    if let Some(document) = web_window.document() {
        if let Some(element) = document.get_element_by_id("loader-bar") {
            let _ = element.set_attribute("style", format!("width: {}%;", percentage).as_str());
        }
    }
}
