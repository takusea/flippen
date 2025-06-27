// WebAssemblyのモジュールをロード
import init, { FlippenCore } from "../pkg/flippen_wasm";

export async function run(width: number, height: number) {
	await init();
	const app = new FlippenCore(width, height);

	return app;
}
