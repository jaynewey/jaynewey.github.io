use three_d::*;

use crate::config;
use crate::clouds;

use std::sync::mpsc;

use wasm_bindgen::prelude::*;

use std::cell::RefCell;
use std::rc::Rc;

pub struct SceneState {
    clear_state: ClearState,
}

pub enum SceneStateMessage {
    SetTheme(config::Theme),
    SetCurrentPath(String),
}

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

pub struct Scene {
    pub models: Vec<Model<PhysicalMaterial>>,
    pub lights: Vec<Box<dyn Light>>,
}

fn as_clear_state(Color { r, g, b, a }: Color) -> ClearState {
    ClearState::color_and_depth(
        (r as f32) / 255.0,
        (g as f32) / 255.0,
        (b as f32) / 255.0,
        (a as f32) / 255.0,
        1.0,
    )
}

fn slide(percentage: u32) {
    let web_window = web_sys::window().expect("to have window");
    if let Some(document) = web_window.document() {
       if let Some(element) = document.get_element_by_id("loader-bar") {
         let _ = element.set_attribute("style", format!("width: {}%;", percentage).as_str());
       } 
    }
}

pub async fn scene(
    receiver: mpsc::Receiver<SceneStateMessage>,
) {
    let mut theme = config::Theme::Light;
    let mut scene_state = SceneState {
        clear_state: as_clear_state(config::BACKGROUND_LIGHT),
    };

    let window = Window::new(WindowSettings {
        title: "portfolio".to_string(),
        ..Default::default()
    })
    .unwrap();
    let context = window.gl();

    let scroll: Rc<RefCell<f32>> = Rc::new(RefCell::new(0.0));
    let scroll_copy = Rc::clone(&scroll);
    let mut web_window = web_sys::window().expect("to have window");
    let document = web_window.document().expect("to have document");
    let scroll_action = Closure::<dyn FnMut()>::new(move || {
        let mut scroll = scroll_copy.borrow_mut();
        *scroll = 80.0 - (web_window.scroll_y().unwrap_or(0.0) as f32 / 5.0);
    });
    let _ =
        document.add_event_listener_with_callback("scroll", scroll_action.as_ref().unchecked_ref());
    scroll_action.forget();

    web_window = web_sys::window().expect("to have window");
    let position: Rc<RefCell<(f32, f32)>> = Rc::new(RefCell::new((0.0, 0.0)));
    let position_copy = Rc::clone(&position);
    let mousemove_action = Closure::<dyn FnMut(JsValue)>::new(move |event: JsValue| {
        if let Some(event) = event.as_ref().dyn_ref::<web_sys::MouseEvent>() {
            let mut position = position_copy.borrow_mut();
            if let (Some(width), Some(height)) = (
                web_window
                    .inner_width()
                    .as_ref()
                    .unwrap()
                    .dyn_ref::<js_sys::Number>(),
                web_window
                    .inner_height()
                    .as_ref()
                    .unwrap()
                    .dyn_ref::<js_sys::Number>(),
            ) {
                let (x, y) = *position;
                *position = (
                    x + (event.movement_x() as f32 / width.value_of() as f32),
                    y + (event.movement_y() as f32 / height.value_of() as f32),
                );
            }
        }
    });
    document.set_onmousemove(Some(mousemove_action.as_ref().unchecked_ref()));
    mousemove_action.forget();

    let mut camera = Camera::new_perspective(
        window.viewport(),
        vec3(125.0, 750.0, 0.0),
        vec3(-3000.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        degrees(45.0),
        0.1,
        1000.0,
    );

    let mut ambient = AmbientLight::new(&context, 0.4, config::SUN);
    let mut directional = DirectionalLight::new(&context, 1.0, config::SUN, &vec3(0.0, -1.0, 0.0));

    let asset_prefix = option_env!("ASSET_PREFIX").unwrap_or("");

    let mut loaded =
        three_d_asset::io::load_async(
            &[format!("{}assets/night_sky.png", asset_prefix).as_str(),
              format!("{}assets/day_sky.png", asset_prefix).as_str()])
            .await
            .unwrap();
    let mut sphere = CpuMesh::sphere(32);
    let uvs: Vec<Vector2<f32>> = sphere
        .normals
        .iter()
        .flatten()
        .map(|n| {
            let u = n.x.atan2(n.z) / (2.0 * std::f32::consts::PI) + 0.5;
            let v = n.y * 0.5 + 0.5;
            Vector2::new(u, v)
        })
        .collect();
    sphere.uvs = Some(uvs);
    let _ = sphere.transform(&Matrix4::from_scale(750.0));
    let mut skysphere = Gm::new(
        Mesh::new(&context, &sphere),
        ColorMaterial {
            texture: None,
            ..Default::default()
        },
    );

    slide(60);

    let mut fog_effect = FogEffect {
        color: config::BACKGROUND_LIGHT,
        density: 0.006,
        animation: 0.0,
    };

    let day_clouds = clouds::get_clouds(&context, &[
        format!("{}assets/day_cloud_1.png", asset_prefix).as_str(),
        format!("{}assets/day_cloud_2.png", asset_prefix).as_str(),
        format!("{}assets/day_cloud_2.png", asset_prefix).as_str()
    ]).await;
    let night_clouds = clouds::get_clouds(&context, &[
        format!("{}assets/night_cloud_1.png", asset_prefix).as_str(),
        format!("{}assets/night_cloud_2.png", asset_prefix).as_str(),
        format!("{}assets/night_cloud_3.png", asset_prefix).as_str()
    ]).await;

    slide(75);

    let island = load_model(&context, format!("{}assets/islands.glb", asset_prefix).as_str())
        .await
        .expect("to load island model");

    slide(100);

    // once we have loaded assets, remove the loader
    web_window = web_sys::window().expect("to have window");
    if let Some(document) = web_window.document() {
       if let Some(element) = document.get_element_by_id("loader") {
         element.set_class_name(format!("{} {}", element.class_name(), "opacity-0 pointer-events-none").as_str());
       } 
    }


    window.render_loop(move |frame_input| {
        let mut change = frame_input.first_frame;
        change |= camera.set_viewport(frame_input.viewport);

        if let Ok(msg) = receiver.try_recv() {
            match msg {
                SceneStateMessage::SetTheme(new_theme) => {
                    theme = new_theme;
                    match theme {
                        config::Theme::Light => {
                            scene_state.clear_state = as_clear_state(config::BACKGROUND_LIGHT);
                            fog_effect.color = config::BACKGROUND_LIGHT;
                            ambient.color = config::SUN;
                            directional.color = config::SUN;
                            directional.intensity = 4.0;
                            skysphere.material.texture = Some(
                                std::sync::Arc::new(Texture2D::new(
                                    &context,
                                    &loaded.deserialize("day_sky").unwrap(),
                                ))
                                .into(),
                            );
                        },
                        config::Theme::Dark => {
                            scene_state.clear_state = as_clear_state(config::BACKGROUND_DARK);
                            fog_effect.color = config::BACKGROUND_DARK;
                            ambient.color = config::MOON;
                            directional.color = config::MOON;
                            directional.intensity = 2.0;
                            skysphere.material.texture = Some(
                                std::sync::Arc::new(Texture2D::new(
                                    &context,
                                    &loaded.deserialize("night_sky").unwrap(),
                                ))
                                .into(),
                            );
                        },
                    }
                    change = true;
                }
                SceneStateMessage::SetCurrentPath(_) => {}
            }
        }

        let scroll = scroll.borrow_mut();
        let camera_position = camera.position();
        change |= (camera_position.y - *scroll).abs() > config::MIN_CHANGE;
        if change {camera.zoom_towards(
            &vec3(camera_position.x, *scroll, camera_position.z),
            (camera_position.y - (*scroll)).abs() * config::MOVE_SPEED,
            0.0,
            1000.0,
        );}

        let lights: &[&dyn Light] = &[&ambient, &directional];

        let (x, y) = *position.borrow_mut();
        *(position.borrow_mut()) = (x * config::MOVE_RESISTANCE, y * config::MOVE_RESISTANCE);
        change |= x.abs() > config::MIN_CHANGE || y.abs() > config::MIN_CHANGE;
        let target = camera.target();
        camera.set_view(
            *camera.position(),
            vec3(
                target.x,
                target.y + ((y * -config::PAN_FREEDOM) - target.y) * config::PAN_SPEED,
                target.z + ((x * -config::PAN_FREEDOM) - target.z) * config::PAN_SPEED,
            ),
            *camera.up(),
        );

        if change {
            let mut color_texture = Texture2D::new_empty::<[u8; 4]>(
                &context,
                frame_input.viewport.width,
                frame_input.viewport.height,
                Interpolation::Nearest,
                Interpolation::Nearest,
                None,
                Wrapping::ClampToEdge,
                Wrapping::ClampToEdge,
            );
            let mut depth_texture = DepthTexture2D::new::<f32>(
                &context,
                frame_input.viewport.width,
                frame_input.viewport.height,
                Wrapping::ClampToEdge,
                Wrapping::ClampToEdge,
            );
            let mut render_list: Vec<&dyn Object> = Vec::new();
            render_list.extend(island.iter().map(|m| m as &dyn Object));
            render_list.push(&skysphere);
            let clouds = match theme {
                config::Theme::Light => &day_clouds,
                config::Theme::Dark => &night_clouds
            };
            render_list.extend(clouds.iter().map(|m| m as &dyn Object));
            RenderTarget::new(
                color_texture.as_color_target(None),
                depth_texture.as_depth_target(),
            )
            .clear(scene_state.clear_state)
            .render(&camera, render_list, lights);

            frame_input
                .screen()
                .copy_from(
                    ColorTexture::Single(&color_texture),
                    DepthTexture::Single(&depth_texture),
                    frame_input.viewport,
                    WriteMask::default(),
                )
                .write(|| {
                    fog_effect.apply(
                        &context,
                        frame_input.accumulated_time,
                        &camera,
                        DepthTexture::Single(&depth_texture),
                    )
                });
        }

        FrameOutput {
            swap_buffers: change,
            ..Default::default()
        }
    });
}
