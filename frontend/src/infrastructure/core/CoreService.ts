import init, { FlippenCore } from "~/infrastructure/wasm/flippen_wasm";
import type { ClipMetadata } from "~/shared/lib/clip";
import type { Transform } from "~/shared/lib/transform";

type CoreOperation<T> = (core: CoreService) => T | PromiseLike<T>;
type WasmOperation<T> = (core: FlippenCore) => T | PromiseLike<T>;

export type CoreSnapshot = {
	clips: ClipMetadata[];
	hiddenLayers: number[];
	canUndo: boolean;
	canRedo: boolean;
	revision: number;
};

export class CoreService {
	private constructor(private readonly core: FlippenCore) {}

	private readonly listeners = new Set<() => void>();
	private operationQueue = Promise.resolve();
	private revision = 0;
	private snapshot: CoreSnapshot | undefined;

	static async create() {
		await init();
		return new CoreService(new FlippenCore());
	}

	subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};

	private notify() {
		this.revision += 1;
		this.snapshot = undefined;
		for (const listener of this.listeners) listener();
	}

	getSnapshot(): CoreSnapshot {
		if (this.snapshot == null) {
			this.snapshot = {
				clips: this.getClips() ?? [],
				hiddenLayers: this.getHiddenLayers(),
				canUndo: this.canUndo(),
				canRedo: this.canRedo(),
				revision: this.revision,
			};
		}
		return this.snapshot;
	}

	private enqueue<T>(operation: WasmOperation<T>) {
		const result = this.operationQueue.then(() => operation(this.core));
		this.operationQueue = result.then(
			() => undefined,
			() => undefined,
		);
		return result;
	}

	createProject(settings: unknown) {
		this.core.create_project(settings);
		this.notify();
	}

	importProject(data: Uint8Array) {
		this.core.import(data);
		this.notify();
	}

	exportProject() {
		return this.core.export();
	}

	getClips() {
		return this.core.get_clips() as ClipMetadata[] | undefined;
	}

	addClip(start: number, layer: number) {
		this.core.add_clip(start, layer);
		this.notify();
	}

	deleteClip(id: string) {
		this.core.delete_clip(id);
		this.notify();
	}

	moveClip(id: string, start: number, layer: number) {
		this.core.move_clip(id, start, layer);
		this.notify();
	}

	changeClipDuration(id: string, duration: number) {
		this.core.change_clip_duration(id, duration);
		this.notify();
	}

	getHiddenLayers() {
		return Array.from(this.core.get_hidden_layers());
	}

	showLayer(layer: number) {
		this.core.show_layer(layer);
		this.notify();
	}

	hideLayer(layer: number) {
		this.core.hide_layer(layer);
		this.notify();
	}

	undo() {
		this.core.undo();
		this.notify();
	}

	redo() {
		this.core.redo();
		this.notify();
	}

	canUndo() {
		return this.core.can_undo();
	}

	canRedo() {
		return this.core.can_redo();
	}

	beginDraw(clipId: string) {
		this.core.begin_draw(clipId);
	}

	applyTool(
		clipId: string,
		tool: string,
		x: number,
		y: number,
		color: Uint8Array,
		pressure: number,
	) {
		this.core.apply_tool(clipId, tool, x, y, color, pressure);
	}

	getToolProperties(tool: string) {
		return this.core.get_tool_properties(tool) as Record<string, unknown>;
	}

	setToolProperty(tool: string, key: string, value: unknown) {
		this.core.set_tool_property(tool, key, value);
		this.notify();
	}

	getClipTransform(id: string) {
		return this.core.get_clip_transform(id) as Transform | undefined;
	}

	setClipTransform(id: string, transform: Transform) {
		this.core.set_clip_transform(id, transform);
		this.notify();
	}

	renderFrame(frame: number) {
		return this.enqueue((core) => core.render_frame(frame));
	}

	runOperation<T>(operation: CoreOperation<T>) {
		return this.enqueue(() => operation(this));
	}
}
