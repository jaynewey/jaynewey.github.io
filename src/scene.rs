use three_d::*;

pub mod clouds;
pub mod skysphere;
pub mod utils;

use utils::{load_model, as_clear_state, move_towards, slide};
use crate::config;
use crate::effect::FogEffect;

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

pub struct Scene {
    pub models: Vec<Model<PhysicalMaterial>>,
    pub lights: Vec<Box<dyn Light>>,
}


pub async fn scene(receiver: mpsc::Receiver<SceneStateMessage>) {
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

    let mut ambient = AmbientLight::new(&context, 0.6, config::SUN);
    let mut directional = DirectionalLight::new(&context, 0.4, config::SUN, vec3(0.0, -1.0, 0.0));

    let asset_prefix = option_env!("ASSET_PREFIX").unwrap_or("");

    let mut loaded = three_d_asset::io::load_async(&[
        format!("{}assets/night_sky.png", asset_prefix).as_str(),
        format!("{}assets/day_sky.png", asset_prefix).as_str(),
    ])
    .await
    .unwrap();

    let mut skysphere = skysphere::get_skysphere(&context);

    slide(60);

    let mut fog_effect = FogEffect {
        color: config::BACKGROUND_LIGHT,
        near: 75.0,
        far: 125.0,
        ..Default::default()
    };

    let day_clouds = clouds::get_clouds(
        &context,
        &[
            format!("{}assets/day_cloud_1.png", asset_prefix).as_str(),
            format!("{}assets/day_cloud_2.png", asset_prefix).as_str(),
            format!("{}assets/day_cloud_2.png", asset_prefix).as_str(),
        ],
    )
    .await;
    let night_clouds = clouds::get_clouds(
        &context,
        &[
            format!("{}assets/night_cloud_1.png", asset_prefix).as_str(),
            format!("{}assets/night_cloud_2.png", asset_prefix).as_str(),
            format!("{}assets/night_cloud_3.png", asset_prefix).as_str(),
        ],
    )
    .await;

    slide(75);

    let island = load_model(
        &context,
        format!("{}assets/islands.glb", asset_prefix).as_str(),
    )
    .await
    .expect("to load island model");

    slide(100);

    // once we have loaded assets, remove the loader
    web_window = web_sys::window().expect("to have window");
    if let Some(document) = web_window.document() {
        if let Some(element) = document.get_element_by_id("loader") {
            element.set_class_name(
                format!(
                    "{} {}",
                    element.class_name(),
                    "opacity-0 pointer-events-none"
                )
                .as_str(),
            );
        }
    }

    // main loop
    let mut color_texture = Texture2D::new_empty::<[f16; 4]>(
        &context,
        camera.viewport().width,
        camera.viewport().height,
        Interpolation::Nearest,
        Interpolation::Nearest,
        None,
        Wrapping::ClampToEdge,
        Wrapping::ClampToEdge,
    );
    let mut depth_texture = DepthTexture2D::new::<f32>(
        &context,
        camera.viewport().width,
        camera.viewport().height,
        Wrapping::ClampToEdge,
        Wrapping::ClampToEdge,
    );

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
                            fog_effect.near = 75.0;
                            fog_effect.far = 125.0;
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
                        }
                        config::Theme::Dark => {
                            scene_state.clear_state = as_clear_state(config::BACKGROUND_DARK);
                            fog_effect.color = config::BACKGROUND_DARK;
                            fog_effect.near = 75.0;
                            fog_effect.far = 115.0;
                            ambient.color = config::MOON;
                            directional.color = config::MOON;
                            directional.intensity = 3.0;
                            skysphere.material.texture = Some(
                                std::sync::Arc::new(Texture2D::new(
                                    &context,
                                    &loaded.deserialize("night_sky").unwrap(),
                                ))
                                .into(),
                            );
                        }
                    }
                    change = true;
                }
                SceneStateMessage::SetCurrentPath(_) => {}
            }
        }

        let scroll = scroll.borrow_mut();
        let camera_position = camera.position();

        change |= (camera_position.y - *scroll).abs() > config::MIN_CHANGE;
        if change {

            let point = vec3(camera_position.x, *scroll, camera_position.z);
            let delta = (camera_position.y - (*scroll)).abs() * config::MOVE_SPEED;

            move_towards(
                &mut camera,
                &point,
                delta,
                0.0,
                1000.0,
            );
        }

        let lights: &[&dyn Light] = &[&ambient, &directional];

        let (x, y) = *position.borrow_mut();
        *(position.borrow_mut()) = (x * config::MOVE_RESISTANCE, y * config::MOVE_RESISTANCE);


        change |= x.abs() > config::MIN_CHANGE || y.abs() > config::MIN_CHANGE;

        let camera_position = camera.position();
        let target = camera.target();
        let camera_up = camera.up();

        camera.set_view(
            camera_position,
            vec3(
                target.x,
                target.y + ((y * -config::PAN_FREEDOM) - target.y) * config::PAN_SPEED,
                target.z + ((x * -config::PAN_FREEDOM) - target.z) * config::PAN_SPEED,
            ),
            camera_up,
        );

        if change {
            if camera.viewport().width != color_texture.width()
                || camera.viewport().height != color_texture.height()
            {
                color_texture = Texture2D::new_empty::<[f16; 4]>(
                    &context,
                    frame_input.viewport.width,
                    frame_input.viewport.height,
                    Interpolation::Nearest,
                    Interpolation::Nearest,
                    None,
                    Wrapping::ClampToEdge,
                    Wrapping::ClampToEdge,
                );
                depth_texture = DepthTexture2D::new::<f32>(
                    &context,
                    frame_input.viewport.width,
                    frame_input.viewport.height,
                    Wrapping::ClampToEdge,
                    Wrapping::ClampToEdge,
                );
            }
            let mut render_list: Vec<&dyn Object> = Vec::new();
            render_list.extend(island.iter().map(|m| m as &dyn Object));
            render_list.push(&skysphere);
            let clouds = match theme {
                config::Theme::Light => &day_clouds,
                config::Theme::Dark => &night_clouds,
            };
            render_list.extend(clouds.iter().map(|m| m as &dyn Object));

            camera.disable_tone_and_color_mapping();
            RenderTarget::new(
                color_texture.as_color_target(None),
                depth_texture.as_depth_target(),
            )
            .clear(scene_state.clear_state)
            .render(&camera, render_list, lights);

            camera.set_default_tone_and_color_mapping();
            frame_input
                .screen()
                .apply_screen_effect(
                    &fog_effect,
                    &camera,
                    &[],
                    Some(ColorTexture::Single(&color_texture)),
                    Some(DepthTexture::Single(&depth_texture)),
                );
        }

        FrameOutput {
            swap_buffers: change,
            ..Default::default()
        }
    });
}
