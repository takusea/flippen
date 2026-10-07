import { useState } from "react";
import { useCore } from "~/infrastructure/core/useCore";
import type { ClipMetadata } from "~/shared/lib/clip";
import type { LayerId } from "~/shared/lib/layer";

type ProjectSettings = {
	width: number;
	height: number;
} | null;

type ClipboardImage = {
	x: number;
	y: number;
	width: number;
	height: number;
	pixels: Uint8ClampedArray;
};

type Options = {
	currentClip: ClipMetadata | undefined;
	selection:
		| { x: number; y: number; width: number; height: number }
		| undefined;
	selectedLayerId: LayerId | null;
	currentFrame: number;
	projectSettings: ProjectSettings | undefined;
	isLayerLocked: (layerId: LayerId) => boolean;
	onClipSelected: (
		id: string,
		layerId: LayerId,
		shouldSelectLayer?: boolean,
	) => void;
};

export const useClipboard = ({
	currentClip,
	selection,
	selectedLayerId,
	currentFrame,
	projectSettings,
	isLayerLocked,
	onClipSelected,
}: Options) => {
	const core = useCore();
	const [clipboard, setClipboard] = useState<ClipboardImage>();

	const getClipboardImage = async () => {
		const clip = currentClip;
		const settings = projectSettings;
		if (clip == null || settings == null) return undefined;

		const pixels = await core.getClipPixels(clip.id);
		if (pixels == null) {
			throw new Error(`Clip pixel data is unavailable for clip ${clip.id}.`);
		}
		if (pixels.length !== settings.width * settings.height * 4) {
			throw new Error("Clip pixel dimensions do not match project settings.");
		}

		const bounds = selection ?? {
			x: 0,
			y: 0,
			width: settings.width,
			height: settings.height,
		};
		const x = Math.max(0, Math.min(settings.width, bounds.x));
		const y = Math.max(0, Math.min(settings.height, bounds.y));
		const right = Math.max(
			x,
			Math.min(settings.width, bounds.x + bounds.width),
		);
		const bottom = Math.max(
			y,
			Math.min(settings.height, bounds.y + bounds.height),
		);
		const width = right - x;
		const height = bottom - y;
		if (width === 0 || height === 0) return undefined;

		const copiedPixels = new Uint8ClampedArray(width * height * 4);
		for (let row = 0; row < height; row++) {
			const sourceStart = ((y + row) * settings.width + x) * 4;
			const destinationStart = row * width * 4;
			copiedPixels.set(
				pixels.subarray(sourceStart, sourceStart + width * 4),
				destinationStart,
			);
		}

		return { clip, x, y, width, height, pixels: copiedPixels };
	};

	const copy = async () => {
		const image = await getClipboardImage();
		if (image == null) return;
		const { clip: _clip, ...copiedImage } = image;
		setClipboard(copiedImage);
	};

	const cut = async () => {
		const image = await getClipboardImage();
		if (
			image == null ||
			isLayerLocked(image.clip.layer_id) ||
			image.clip.locked
		) {
			return;
		}

		const { clip, ...copiedImage } = image;
		setClipboard(copiedImage);

		const pixels = await core.getClipPixels(clip.id);
		if (pixels == null) {
			throw new Error(`Clip pixel data is unavailable for clip ${clip.id}.`);
		}
		const settings = projectSettings;
		if (settings == null) return;
		for (let row = 0; row < image.height; row++) {
			const start = ((image.y + row) * settings.width + image.x) * 4;
			pixels.fill(0, start, start + image.width * 4);
		}
		await core.replaceClipPixels(clip.id, pixels);
	};

	const paste = async () => {
		const settings = projectSettings;
		if (clipboard == null || settings == null || selectedLayerId == null)
			return;
		if (isLayerLocked(selectedLayerId)) return;

		let clip = currentClip;
		if (clip == null) {
			const nextClips = await core.addClip(currentFrame, selectedLayerId);
			clip = nextClips.find(
				(candidate) =>
					candidate.layer_id === selectedLayerId &&
					candidate.start === currentFrame,
			);
			if (clip != null) onClipSelected(clip.id, selectedLayerId);
		}
		if (clip == null || clip.locked) return;

		const pixels = await core.getClipPixels(clip.id);
		if (pixels == null) {
			throw new Error(`Clip pixel data is unavailable for clip ${clip.id}.`);
		}
		if (pixels.length !== settings.width * settings.height * 4) {
			throw new Error("Clip pixel dimensions do not match project settings.");
		}

		for (let row = 0; row < clipboard.height; row++) {
			const targetY = clipboard.y + row;
			if (targetY < 0 || targetY >= settings.height) continue;
			for (let column = 0; column < clipboard.width; column++) {
				const targetX = clipboard.x + column;
				if (targetX < 0 || targetX >= settings.width) continue;
				const sourceIndex = (row * clipboard.width + column) * 4;
				const targetIndex = (targetY * settings.width + targetX) * 4;
				const sourceAlpha = clipboard.pixels[sourceIndex + 3] / 255;
				if (sourceAlpha === 0) continue;
				const targetAlpha = pixels[targetIndex + 3] / 255;
				const outputAlpha = sourceAlpha + targetAlpha * (1 - sourceAlpha);
				for (let channel = 0; channel < 3; channel++) {
					pixels[targetIndex + channel] = Math.round(
						(clipboard.pixels[sourceIndex + channel] * sourceAlpha +
							pixels[targetIndex + channel] * targetAlpha * (1 - sourceAlpha)) /
							outputAlpha,
					);
				}
				pixels[targetIndex + 3] = Math.round(outputAlpha * 255);
			}
		}

		await core.replaceClipPixels(clip.id, pixels);
	};

	return { copy, cut, paste };
};
