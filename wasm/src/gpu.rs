use crate::app::clip::Clip;
use crate::core::image::Image;
use bytemuck::{Pod, Zeroable};
use std::collections::{HashMap, HashSet};
use wgpu::util::DeviceExt;

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
struct ClipUniforms {
    inverse_transform: [[f32; 4]; 3],
    image_size: [f32; 2],
    output_size: [f32; 2],
}

struct CachedClipTexture {
    texture: wgpu::Texture,
    width: u32,
    height: u32,
    revision: u64,
}

pub struct GpuRenderer {
    device: wgpu::Device,
    queue: wgpu::Queue,
    pipeline: wgpu::RenderPipeline,
    bind_group_layout: wgpu::BindGroupLayout,
    sampler: wgpu::Sampler,
    clip_textures: HashMap<uuid::Uuid, CachedClipTexture>,
}

impl GpuRenderer {
    pub async fn new() -> Result<Self, String> {
        let instance = wgpu::Instance::new(&wgpu::InstanceDescriptor::default());
        let adapter = instance
            .request_adapter(&wgpu::RequestAdapterOptions::default())
            .await
            .map_err(|error| format!("Could not acquire a GPU adapter: {error}"))?;

        let (device, queue) = adapter
            .request_device(&wgpu::DeviceDescriptor {
                label: Some("flippen-render-device"),
                required_features: wgpu::Features::empty(),
                required_limits: wgpu::Limits::default(),
                memory_hints: wgpu::MemoryHints::Performance,
                trace: wgpu::Trace::Off,
            })
            .await
            .map_err(|error| format!("Could not create a GPU device: {error}"))?;

        let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
            label: Some("flippen-clip-shader"),
            source: wgpu::ShaderSource::Wgsl(include_str!("gpu.wgsl").into()),
        });
        let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
            label: Some("flippen-clip-bind-group-layout"),
            entries: &[
                wgpu::BindGroupLayoutEntry {
                    binding: 0,
                    visibility: wgpu::ShaderStages::FRAGMENT,
                    ty: wgpu::BindingType::Texture {
                        sample_type: wgpu::TextureSampleType::Float { filterable: true },
                        view_dimension: wgpu::TextureViewDimension::D2,
                        multisampled: false,
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: 1,
                    visibility: wgpu::ShaderStages::FRAGMENT,
                    ty: wgpu::BindingType::Sampler(wgpu::SamplerBindingType::Filtering),
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: 2,
                    visibility: wgpu::ShaderStages::FRAGMENT,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Uniform,
                        has_dynamic_offset: false,
                        min_binding_size: Some(
                            std::num::NonZeroU64::new(std::mem::size_of::<ClipUniforms>() as u64)
                                .unwrap(),
                        ),
                    },
                    count: None,
                },
            ],
        });
        let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
            label: Some("flippen-render-pipeline-layout"),
            bind_group_layouts: &[&bind_group_layout],
            push_constant_ranges: &[],
        });
        let pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("flippen-render-pipeline"),
            layout: Some(&pipeline_layout),
            vertex: wgpu::VertexState {
                module: &shader,
                entry_point: Some("vertex_main"),
                buffers: &[],
                compilation_options: wgpu::PipelineCompilationOptions::default(),
            },
            fragment: Some(wgpu::FragmentState {
                module: &shader,
                entry_point: Some("fragment_main"),
                targets: &[Some(wgpu::ColorTargetState {
                    format: wgpu::TextureFormat::Rgba8Unorm,
                    blend: Some(wgpu::BlendState::ALPHA_BLENDING),
                    write_mask: wgpu::ColorWrites::ALL,
                })],
                compilation_options: wgpu::PipelineCompilationOptions::default(),
            }),
            primitive: wgpu::PrimitiveState::default(),
            depth_stencil: None,
            multisample: wgpu::MultisampleState::default(),
            multiview: None,
            cache: None,
        });
        let sampler = device.create_sampler(&wgpu::SamplerDescriptor {
            label: Some("flippen-clip-sampler"),
            address_mode_u: wgpu::AddressMode::ClampToEdge,
            address_mode_v: wgpu::AddressMode::ClampToEdge,
            mag_filter: wgpu::FilterMode::Nearest,
            min_filter: wgpu::FilterMode::Nearest,
            ..Default::default()
        });

        Ok(Self {
            device,
            queue,
            pipeline,
            bind_group_layout,
            sampler,
            clip_textures: HashMap::new(),
        })
    }

    pub async fn render_frame(
        &mut self,
        clips: &[&Clip],
        width: u32,
        height: u32,
    ) -> Result<Image, String> {
        let output_texture = self.device.create_texture(&wgpu::TextureDescriptor {
            label: Some("flippen-frame-texture"),
            size: wgpu::Extent3d {
                width,
                height,
                depth_or_array_layers: 1,
            },
            mip_level_count: 1,
            sample_count: 1,
            dimension: wgpu::TextureDimension::D2,
            format: wgpu::TextureFormat::Rgba8Unorm,
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::COPY_SRC,
            view_formats: &[],
        });
        let output_view = output_texture.create_view(&wgpu::TextureViewDescriptor::default());
        let bytes_per_row = width * 4;
        let padded_bytes_per_row = bytes_per_row.div_ceil(wgpu::COPY_BYTES_PER_ROW_ALIGNMENT)
            * wgpu::COPY_BYTES_PER_ROW_ALIGNMENT;
        let readback = self.device.create_buffer(&wgpu::BufferDescriptor {
            label: Some("flippen-frame-readback"),
            size: (padded_bytes_per_row * height) as u64,
            usage: wgpu::BufferUsages::COPY_DST | wgpu::BufferUsages::MAP_READ,
            mapped_at_creation: false,
        });

        let active_clip_ids: HashSet<_> = clips.iter().map(|clip| clip.metadata.id).collect();
        self.clip_textures
            .retain(|clip_id, _| active_clip_ids.contains(clip_id));

        for clip in clips {
            let image = &clip.image;
            let cached = self
                .clip_textures
                .entry(clip.metadata.id)
                .or_insert_with(|| {
                    let texture = self.device.create_texture(&wgpu::TextureDescriptor {
                        label: Some("flippen-clip-texture"),
                        size: wgpu::Extent3d {
                            width: image.width,
                            height: image.height,
                            depth_or_array_layers: 1,
                        },
                        mip_level_count: 1,
                        sample_count: 1,
                        dimension: wgpu::TextureDimension::D2,
                        format: wgpu::TextureFormat::Rgba8Unorm,
                        usage: wgpu::TextureUsages::TEXTURE_BINDING | wgpu::TextureUsages::COPY_DST,
                        view_formats: &[],
                    });
                    CachedClipTexture {
                        texture,
                        width: image.width,
                        height: image.height,
                        revision: u64::MAX,
                    }
                });

            if cached.width != image.width || cached.height != image.height {
                *cached = CachedClipTexture {
                    texture: self.device.create_texture(&wgpu::TextureDescriptor {
                        label: Some("flippen-clip-texture"),
                        size: wgpu::Extent3d {
                            width: image.width,
                            height: image.height,
                            depth_or_array_layers: 1,
                        },
                        mip_level_count: 1,
                        sample_count: 1,
                        dimension: wgpu::TextureDimension::D2,
                        format: wgpu::TextureFormat::Rgba8Unorm,
                        usage: wgpu::TextureUsages::TEXTURE_BINDING | wgpu::TextureUsages::COPY_DST,
                        view_formats: &[],
                    }),
                    width: image.width,
                    height: image.height,
                    revision: u64::MAX,
                };
            }

            if cached.revision != clip.image_revision {
                let clip_bytes_per_row = image.width * 4;
                let padded_clip_bytes_per_row = clip_bytes_per_row
                    .div_ceil(wgpu::COPY_BYTES_PER_ROW_ALIGNMENT)
                    * wgpu::COPY_BYTES_PER_ROW_ALIGNMENT;
                let mut upload_data = vec![0; (padded_clip_bytes_per_row * image.height) as usize];
                for row in 0..image.height as usize {
                    let source_start = row * clip_bytes_per_row as usize;
                    let target_start = row * padded_clip_bytes_per_row as usize;
                    upload_data[target_start..target_start + clip_bytes_per_row as usize]
                        .copy_from_slice(
                            &image.data[source_start..source_start + clip_bytes_per_row as usize],
                        );
                }
                self.queue.write_texture(
                    cached.texture.as_image_copy(),
                    &upload_data,
                    wgpu::TexelCopyBufferLayout {
                        offset: 0,
                        bytes_per_row: Some(padded_clip_bytes_per_row),
                        rows_per_image: Some(image.height),
                    },
                    wgpu::Extent3d {
                        width: image.width,
                        height: image.height,
                        depth_or_array_layers: 1,
                    },
                );
                cached.revision = clip.image_revision;
            }
        }

        let mut encoder = self
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("flippen-frame-encoder"),
            });
        {
            let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("flippen-frame-pass"),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &output_view,
                    resolve_target: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(wgpu::Color::TRANSPARENT),
                        store: wgpu::StoreOp::Store,
                    },
                })],
                depth_stencil_attachment: None,
                timestamp_writes: None,
                occlusion_query_set: None,
            });
            pass.set_pipeline(&self.pipeline);

            for clip in clips {
                let image = &clip.image;
                let cached = self.clip_textures.get(&clip.metadata.id).unwrap();

                let inverse = clip
                    .transform
                    .to_inverse_matrix3((image.width as f32 / 2.0, image.height as f32 / 2.0))
                    .ok_or_else(|| "Clip transform is not invertible".to_string())?;
                let uniforms = ClipUniforms {
                    inverse_transform: [
                        [inverse.x.x, inverse.y.x, inverse.z.x, 0.0],
                        [inverse.x.y, inverse.y.y, inverse.z.y, 0.0],
                        [0.0, 0.0, 1.0, 0.0],
                    ],
                    image_size: [image.width as f32, image.height as f32],
                    output_size: [width as f32, height as f32],
                };
                let uniform_buffer =
                    self.device
                        .create_buffer_init(&wgpu::util::BufferInitDescriptor {
                            label: Some("flippen-clip-uniforms"),
                            contents: bytemuck::bytes_of(&uniforms),
                            usage: wgpu::BufferUsages::UNIFORM,
                        });
                let bind_group = self.device.create_bind_group(&wgpu::BindGroupDescriptor {
                    label: Some("flippen-clip-bind-group"),
                    layout: &self.bind_group_layout,
                    entries: &[
                        wgpu::BindGroupEntry {
                            binding: 0,
                            resource: wgpu::BindingResource::TextureView(
                                &cached
                                    .texture
                                    .create_view(&wgpu::TextureViewDescriptor::default()),
                            ),
                        },
                        wgpu::BindGroupEntry {
                            binding: 1,
                            resource: wgpu::BindingResource::Sampler(&self.sampler),
                        },
                        wgpu::BindGroupEntry {
                            binding: 2,
                            resource: uniform_buffer.as_entire_binding(),
                        },
                    ],
                });
                pass.set_bind_group(0, &bind_group, &[]);
                pass.draw(0..3, 0..1);
            }
        }
        encoder.copy_texture_to_buffer(
            output_texture.as_image_copy(),
            wgpu::TexelCopyBufferInfo {
                buffer: &readback,
                layout: wgpu::TexelCopyBufferLayout {
                    offset: 0,
                    bytes_per_row: Some(padded_bytes_per_row),
                    rows_per_image: Some(height),
                },
            },
            wgpu::Extent3d {
                width,
                height,
                depth_or_array_layers: 1,
            },
        );
        self.queue.submit(Some(encoder.finish()));

        let slice = readback.slice(..);
        let (sender, receiver) = futures_channel::oneshot::channel();
        slice.map_async(wgpu::MapMode::Read, move |result| {
            let _ = sender.send(result);
        });
        self.device
            .poll(wgpu::PollType::Wait)
            .map_err(|error| format!("Could not wait for GPU frame: {error}"))?;
        receiver
            .await
            .map_err(|_| "GPU mapping callback was dropped".to_string())?
            .map_err(|error| format!("Could not map GPU frame: {error}"))?;
        let mapped = slice.get_mapped_range();
        let mut data = vec![0; (width * height * 4) as usize];
        for row in 0..height as usize {
            let source_start = row * padded_bytes_per_row as usize;
            let target_start = row * bytes_per_row as usize;
            data[target_start..target_start + bytes_per_row as usize]
                .copy_from_slice(&mapped[source_start..source_start + bytes_per_row as usize]);
        }
        drop(mapped);
        readback.unmap();

        Ok(Image {
            data,
            width,
            height,
        })
    }
}
