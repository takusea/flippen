import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";

import { useLayer } from "~/features/layer/useLayer";
import { usePlayback } from "~/features/playback/usePlayback";
import { useProject } from "~/features/project/useProject";
import { useCore } from "~/infrastructure/core/useCore";
import type { ClipProperties } from "~/shared/lib/clip";
import type { Transform } from "~/shared/lib/transform";
import { ClipContext } from "./ClipContextValue";

export const ClipProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();
	const layerContext = useLayer();
	const playbackContext = usePlayback();
	const projectContext = useProject();

	const { clips } = useSyncExternalStore(
		core.subscribe,
		() => core.getSnapshot(),
		() => core.getSnapshot(),
	);
	const [selectedClipId, setSelectedClipId] = useState<string>();
	const [selection, setSelection] = useState<
		{ x: number; y: number; width: number; height: number } | undefined
	>();
	const [clipboard, setClipboard] = useState<
		| {
				x: number;
				y: number;
				width: number;
				height: number;
				pixels: Uint8ClampedArray;
		  }
		| undefined
	>();
	const selectionContext = useRef({
		layer: layerContext.selectedLayer,
		frame: playbackContext.currentFrame,
	});

	const [transform, setTransform] = useState<Transform>();

	const getCurrentLayerClip = () =>
		clips.find(
			(clip) =>
				clip.layer_index === layerContext.selectedLayer &&
				clip.start <= playbackContext.currentFrame &&
				playbackContext.currentFrame < clip.start + clip.duration,
		);

	const getClipboardImage = () => {
		const clip = getCurrentLayerClip();
		const settings = projectContext.settings;
		if (clip == null || settings == null) return undefined;

		const pixels = core.getClipPixels(clip.id);
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

		return {
			clip,
			x,
			y,
			width,
			height,
			pixels: copiedPixels,
		};
	};

	const copy = () => {
		const image = getClipboardImage();
		if (image == null) return;
		const { clip: _clip, ...copiedImage } = image;
		setClipboard(copiedImage);
	};

	const cut = () => {
		const image = getClipboardImage();
		if (
			image == null ||
			layerContext.lockedLayers.includes(image.clip.layer_index) ||
			image.clip.locked
		) {
			return;
		}

		const { clip, ...copiedImage } = image;
		setClipboard(copiedImage);

		const pixels = core.getClipPixels(clip.id);
		const settings = projectContext.settings;
		if (pixels == null) {
			throw new Error(`Clip pixel data is unavailable for clip ${clip.id}.`);
		}
		if (settings == null) return;
		for (let row = 0; row < image.height; row++) {
			const start = ((image.y + row) * settings.width + image.x) * 4;
			pixels.fill(0, start, start + image.width * 4);
		}
		core.replaceClipPixels(clip.id, pixels);
	};

	const paste = () => {
		const settings = projectContext.settings;
		if (clipboard == null || settings == null) return;
		if (layerContext.lockedLayers.includes(layerContext.selectedLayer)) return;

		let clip = getCurrentLayerClip();
		if (clip == null) {
			core.addClip(playbackContext.currentFrame, layerContext.selectedLayer);
			clip = core
				.getClips()
				?.find(
					(candidate) =>
						candidate.layer_index === layerContext.selectedLayer &&
						candidate.start === playbackContext.currentFrame,
				);
			if (clip != null) {
				selectionContext.current = {
					layer: layerContext.selectedLayer,
					frame: playbackContext.currentFrame,
				};
				setSelectedClipId(clip.id);
			}
		}
		if (clip == null || clip.locked) return;

		const pixels = core.getClipPixels(clip.id);
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

		core.replaceClipPixels(clip.id, pixels);
	};

	const selectAll = () => {
		const settings = projectContext.settings;
		if (settings != null) {
			setSelection({
				x: 0,
				y: 0,
				width: settings.width,
				height: settings.height,
			});
		}
	};

	const syncTransform = useCallback(() => {
		if (selectedClipId == null) {
			setTransform(undefined);
			return Promise.resolve();
		}

		return core
			.runOperation((currentCore) =>
				currentCore.getClipTransform(selectedClipId),
			)
			.then((nextTransform) => setTransform(nextTransform));
	}, [core, selectedClipId]);

	const selectClip = (id: string) => {
		setSelectedClipId(id);
		const clip = clips.find((candidate) => candidate.id === id);
		if (clip != null) {
			selectionContext.current = {
				layer: clip.layer_index,
				frame: playbackContext.currentFrame,
			};
			layerContext.selectLayer(clip.layer_index);
		}
	};

	const addClip = (start: number, layer: number) => {
		if (layerContext.lockedLayers.includes(layer)) return;
		core.addClip(start, layer);
		const nextClips = core.getClips();
		if (nextClips == null) return;
		const clip = nextClips.find(
			(candidate) =>
				candidate.start === start && candidate.layer_index === layer,
		);
		if (clip != null) {
			selectionContext.current = {
				layer,
				frame: playbackContext.currentFrame,
			};
			layerContext.selectLayer(layer);
			setSelectedClipId(clip.id);
		}
	};

	const ensureClipAt = (frame: number, layer: number) => {
		if (layerContext.lockedLayers.includes(layer)) return undefined;

		const existingClip = clips.find(
			(clip) =>
				clip.layer_index === layer &&
				clip.start <= frame &&
				frame < clip.start + clip.duration,
		);
		if (existingClip != null) {
			selectionContext.current = {
				layer,
				frame: playbackContext.currentFrame,
			};
			setSelectedClipId(existingClip.id);
			return existingClip.id;
		}

		core.addClip(frame, layer);
		const nextClips = core.getClips();
		if (nextClips == null) return undefined;
		const newClip = nextClips.find(
			(clip) =>
				clip.start === frame &&
				clip.layer_index === layer &&
				!clips.some((existing) => existing.id === clip.id),
		);
		if (newClip == null) return undefined;
		selectionContext.current = {
			layer,
			frame: playbackContext.currentFrame,
		};
		setSelectedClipId(newClip.id);
		return newClip.id;
	};

	const deleteClip = (id: string) => {
		const clip = clips.find((candidate) => candidate.id === id);
		if (clip == null || layerContext.lockedLayers.includes(clip.layer_index)) {
			return;
		}
		core.deleteClip(id);
	};

	const moveClip = (id: string, start: number, layer: number) => {
		const clip = clips.find((candidate) => candidate.id === id);
		if (
			clip == null ||
			layerContext.lockedLayers.includes(clip.layer_index) ||
			layerContext.lockedLayers.includes(layer) ||
			clips.some(
				(candidate) =>
					candidate.id !== id &&
					candidate.layer_index === layer &&
					start < candidate.start + candidate.duration &&
					candidate.start < start + clip.duration,
			)
		) {
			return;
		}
		core.moveClip(id, start, layer);
	};

	const changeClipDuration = (id: string, duration: number) => {
		const clip = clips.find((candidate) => candidate.id === id);
		if (clip == null || layerContext.lockedLayers.includes(clip.layer_index)) {
			return;
		}
		core.changeClipDuration(id, duration);
	};

	const changeClipProperties = (id: string, properties: ClipProperties) => {
		const clip = clips.find((candidate) => candidate.id === id);
		if (clip == null || layerContext.lockedLayers.includes(clip.layer_index)) {
			return;
		}
		core.changeClipProperties(id, properties);
	};

	const changeTransform = (id: string, transform: Transform) => {
		const clip = clips.find((candidate) => candidate.id === id);
		if (clip == null || layerContext.lockedLayers.includes(clip.layer_index)) {
			return;
		}
		void core
			.runOperation((currentCore) => {
				currentCore.setClipTransform(id, transform);
				return currentCore.getClipTransform(id);
			})
			.then((nextTransform) => setTransform(nextTransform));
	};

	useEffect(() => {
		const playheadChanged =
			selectionContext.current.layer !== layerContext.selectedLayer ||
			selectionContext.current.frame !== playbackContext.currentFrame;
		if (playheadChanged) setSelection(undefined);
		selectionContext.current = {
			layer: layerContext.selectedLayer,
			frame: playbackContext.currentFrame,
		};
		if (
			!playheadChanged &&
			selectedClipId != null &&
			clips.some((clip) => clip.id === selectedClipId)
		) {
			return;
		}
		const clip = clips.find(
			(candidate) =>
				candidate.layer_index === layerContext.selectedLayer &&
				candidate.start <= playbackContext.currentFrame &&
				playbackContext.currentFrame < candidate.start + candidate.duration,
		);
		setSelectedClipId(clip?.id);
	}, [
		clips,
		layerContext.selectedLayer,
		playbackContext.currentFrame,
		selectedClipId,
	]);

	useEffect(() => {
		syncTransform();
	}, [syncTransform]);

	return (
		<ClipContext
			value={{
				clips,
				selectedClipId,
				transform,
				selection,
				selectClip,
				setSelection,
				copy,
				cut,
				paste,
				selectAll,
				addClip,
				deleteClip,
				moveClip,
				changeClipDuration,
				changeClipProperties,
				changeTransform,
				syncTransform,
				ensureClipAt,
			}}
		>
			{children}
		</ClipContext>
	);
};
