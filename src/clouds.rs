use three_d::*;
use three_d_asset::io::load_async;
use rand::Rng;

pub async fn get_clouds(context: &Context, paths: &[&str]) -> Vec<Gm<Sprites, ColorMaterial>> {
    let mut cloud_assets = load_async(paths)
    .await
    .unwrap();

    paths 
        .iter()
        .map(|path| {
            let name = std::path::Path::new(&path).file_name().unwrap().to_str().unwrap();
            let cloud = cloud_assets.deserialize(name).unwrap();
            let material = ColorMaterial {
                color: Color::WHITE,
                texture: Some(std::sync::Arc::new(Texture2D::new(context, &cloud)).into()),
                is_transparent: true,
                render_states: RenderStates {
                    blend: Blend::TRANSPARENCY,
                    depth_test: DepthTest::Less,
                    write_mask: WriteMask::COLOR,
                    ..Default::default()
                },
            };

            let mut rng = rand::thread_rng();
            let cloud_positions: Vec<Vec3> = (0..15)
                .map(|_| {
                    vec3(
                        rng.gen_range(-300.0..30.0),
                        rng.gen_range(-500.0..500.0),
                        rng.gen_range(-150.0..150.0),
                    )
                })
                .collect();
            let mut sprites = Sprites::new(context, &cloud_positions, None);
            sprites.set_transformation(Matrix4::from_scale(30.0));

            Gm {
                geometry: sprites,
                material,
            }
        })
        .collect()
}
