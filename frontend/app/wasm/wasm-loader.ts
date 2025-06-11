// WebAssemblyのモジュールをロード
import init, { FlippenWasm } from "../pkg/flippen_wasm";

export async function runWasm(width: number, height: number) {
	await init();
	const app = new FlippenWasm(width, height);
	// 初期値を反映
	app.set_brush_size(5);
	app.set_current_color(0, 0, 0, 255); // 黒

	return app;
}
