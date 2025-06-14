// WebAssemblyのモジュールをロード
import init, { FlippenWasm } from "../pkg/flippen_wasm";

export async function runWasm(width: number, height: number) {
	await init();
	const app = new FlippenWasm(width, height);

	return app;
}
