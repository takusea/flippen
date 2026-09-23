import { createContext, useEffect, useState } from "react";
import { useLayer } from "~/features/layer/useLayer";
import { usePlayback } from "~/features/playback/usePlayback";
import { useCore } from "~/infrastructure/core/useCore";
import type { ClipMetadata } from "~/shared/lib/clip";
import type { Transform } from "~/shared/lib/transform";

type ClipContextType = {
	clips: ClipMetadata[];
	selectedClipId: string | undefined;
	transform: any;
	refreshClips: () => void;
	selectClip: (id: string) => void;
	addClip: (start: number, layer: number) => void;
	deleteClip: (id: string) => void;
	moveClip: (id: string, start: number, layer: number) => void;
	changeClipDuration: (id: string, duration: number) => void;
	changeTransform: (id: string, transform: Transform) => void;
	syncTransform: () => void;
	ensureClipAt: (frame: number, layer: number) => string | undefined;
};

export const ClipContext = createContext<ClipContextType>({} as any);

export const ClipProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();
	const layerContext = useLayer();
	const playbackContext = usePlayback();

	const [clips, setClips] = useState<ClipMetadata[]>([]);
	const [selectedClipId, setSelectedClipId] = useState<string>();

	const [transform, setTransform] = useState<any>();

	const syncTransform = () => {
		if (selectedClipId == null) {
			setTransform(undefined);
			return Promise.resolve();
		}

		return playbackContext
			.runCoreOperation((currentCore) =>
				currentCore.get_clip_transform(selectedClipId),
			)
			.then((nextTransform) => setTransform(nextTransform));
	};

	const refreshClips = () => {
		if (core == null) return;
		const clips = core.get_clips();
		if (clips == null) return;
		setClips(clips);
	};

	const selectClip = (id: string) => {
		setSelectedClipId(id);
		const clip = clips.find((candidate) => candidate.id === id);
		if (clip != null) layerContext.selectLayer(clip.layer_index);
	};

	const addClip = (start: number, layer: number) => {
		core?.add_clip(start, layer);
		const nextClips = core?.get_clips() as ClipMetadata[] | undefined;
		if (nextClips == null) return;
		setClips(nextClips);
		const clip = nextClips.find(
			(candidate) =>
				candidate.start === start && candidate.layer_index === layer,
		);
		if (clip != null) {
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
			setSelectedClipId(existingClip.id);
			return existingClip.id;
		}

		core.add_clip(frame, layer);
		const nextClips = core.get_clips() as ClipMetadata[] | undefined;
		if (nextClips == null) return undefined;
		setClips(nextClips);
		const newClip = nextClips.find(
			(clip) =>
				clip.start === frame &&
				clip.layer_index === layer &&
				!clips.some((existing) => existing.id === clip.id),
		);
		if (newClip == null) return undefined;
		setSelectedClipId(newClip.id);
		return newClip.id;
	};

	const deleteClip = (id: string) => {
		core?.delete_clip(id);
		refreshClips();
	};

	const moveClip = (id: string, start: number, layer: number) => {
		core?.move_clip(id, start, layer);
		refreshClips();
	};

	const changeClipDuration = (id: string, duration: number) => {
		core?.change_clip_duration(id, duration);
		refreshClips();
	};

	const changeTransform = (id: string, transform: Transform) => {
		void playbackContext
			.runCoreOperation((currentCore) => {
				currentCore.set_clip_transform(id, transform);
				return currentCore.get_clip_transform(id);
			})
			.then((nextTransform) => setTransform(nextTransform));
	};

	useEffect(() => {
		refreshClips();
	}, [core]);

	useEffect(() => {
		const clip = clips.find(
			(candidate) =>
				candidate.layer_index === layerContext.selectedLayer &&
				candidate.start <= playbackContext.currentFrame &&
				playbackContext.currentFrame < candidate.start + candidate.duration,
		);
		setSelectedClipId(clip?.id);
	}, [clips, layerContext.selectedLayer, playbackContext.currentFrame]);

	useEffect(() => {
		syncTransform();
	}, [selectedClipId]);

	return (
		<ClipContext
			value={{
				clips,
				selectedClipId,
				transform,
				refreshClips,
				selectClip,
				addClip,
				deleteClip,
				moveClip,
				changeClipDuration,
				changeTransform,
				syncTransform,
				ensureClipAt,
			}}
		>
			{children}
		</ClipContext>
	);
};
