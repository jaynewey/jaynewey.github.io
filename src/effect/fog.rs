use three_d::renderer::*;
use three_d::EffectMaterialId;

///
/// An effect that simulates fog, ie. the area where it is applied gets hazy when objects are far away.
/// Adjusted from https://github.com/asny/three-d/blob/43dac28b24b2a13a3f4c65ea7ef48780a93aae63/src/renderer/effect/fog.rs
///
#[derive(Clone, Debug)]
pub struct FogEffect {
    /// The color of the fog.
    pub color: Srgba,
    pub near: f32,
    pub far: f32,
}

impl Default for FogEffect {
    fn default() -> Self {
        Self {
            color: Srgba::WHITE,
            near: 50.0,
            far: 200.0,
        }
    }
}

impl Effect for FogEffect {
    fn fragment_shader_source(
        &self,
        _lights: &[&dyn Light],
        color_texture: Option<ColorTexture>,
        depth_texture: Option<DepthTexture>,
    ) -> String {
        format!(
            "{}\n{}\n{}\n{}\n{}",
            color_texture
                .expect("Must supply a depth texture to apply a fog effect")
                .fragment_shader_source(),
            depth_texture
                .expect("Must supply a depth texture to apply a fog effect")
                .fragment_shader_source(),
            ToneMapping::fragment_shader_source(),
            ColorMapping::fragment_shader_source(),
            include_str!("shaders/fog_effect.frag")
        )
    }

    fn id(
        &self,
        color_texture: Option<ColorTexture>,
        depth_texture: Option<DepthTexture>,
    ) -> EffectMaterialId {
        let _ = color_texture.unwrap();
        let _ = depth_texture.unwrap();
        EffectMaterialId(0b11u16)
    }

    fn use_uniforms(
        &self,
        program: &Program,
        viewer: &dyn Viewer,
        _lights: &[&dyn Light],
        color_texture: Option<ColorTexture>,
        depth_texture: Option<DepthTexture>,
    ) {
        color_texture
            .expect("Must supply a color texture to apply a fog effect")
            .use_uniforms(program);
        depth_texture
            .expect("Must supply a depth texture to apply a fog effect")
            .use_uniforms(program);
        program.use_uniform(
            "viewProjectionInverse",
            (viewer.projection() * viewer.view()).invert().unwrap(),
        );
        program.use_uniform("fogColor", Vec4::from(self.color));
        program.use_uniform("fogNear", self.near);
        program.use_uniform("fogFar", self.far);
        program.use_uniform("eyePosition", viewer.position());
    }

    fn render_states(&self) -> RenderStates {
        RenderStates {
            depth_test: DepthTest::Always,
            cull: Cull::Back,
            ..Default::default()
        }
    }
}
