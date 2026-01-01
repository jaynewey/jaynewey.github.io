use three_d::*;


pub fn get_skysphere(context: &Context) -> Gm<Mesh, ColorMaterial> {
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

    let _ = sphere.transform(Matrix4::from_scale(750.0));

    Gm::new(
        Mesh::new(context, &sphere),
        ColorMaterial {
            texture: None,
            ..Default::default()
        },
    )
}
