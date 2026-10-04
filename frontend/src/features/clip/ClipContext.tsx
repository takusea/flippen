import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";

import { useLayer } from "~/features/layer/useLayer";
import { usePlayback } from "~/features/playback/usePlayback";
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

	const { clips } = useSyncExternalStore(
		core.subscribe,
		() => core.getSnapshot(),
		() => core.getSnapshot(),
	);
	const [selectedClipId, setSelectedClipId] = useState<string>();
	const selectionContext = useRef({
		layer: layerContext.selectedLayer,
		frame: playbackContext.currentFrame,
	});

	const [transform, setTransform] = useState<Transform>();

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
		core.deleteClip(id);
	};

	const moveClip = (id: string, start: number, layer: number) => {
		core.moveClip(id, start, layer);
	};

	const changeClipDuration = (id: string, duration: number) => {
		core.changeClipDuration(id, duration);
	};

	const changeClipProperties = (id: string, properties: ClipProperties) => {
		core.changeClipProperties(id, properties);
	};

	const changeTransform = (id: string, transform: Transform) => {
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
				selectClip,
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
