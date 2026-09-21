struct ClipUniforms {
    inverse_transform: mat3x3<f32>,
    image_size: vec2<f32>,
    output_size: vec2<f32>,
};

@group(0) @binding(0) var clip_texture: texture_2d<f32>;
@group(0) @binding(1) var clip_sampler: sampler;
@group(0) @binding(2) var<uniform> uniforms: ClipUniforms;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
};

@vertex
fn vertex_main(@builtin(vertex_index) index: u32) -> VertexOutput {
    var positions = array<vec2<f32>, 3>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(3.0, -1.0),
        vec2<f32>(-1.0, 3.0),
    );
    return VertexOutput(vec4<f32>(positions[index], 0.0, 1.0));
}

@fragment
fn fragment_main(input: VertexOutput) -> @location(0) vec4<f32> {
    let output_pixel = vec3<f32>(input.position.xy, 1.0);
    let source_pixel = uniforms.inverse_transform * output_pixel;
    let source_uv = (source_pixel.xy + vec2<f32>(0.5, 0.5)) / uniforms.image_size;
    return textureSample(clip_texture, clip_sampler, source_uv);
}