import { createContext, useEffect, useState } from "react";
import type { ClipMetadata } from "~/util/clip";
import { useCore } from "../Core/useCore";
import type { Transform } from "~/util/transform";

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
};

export const ClipContext = createContext<ClipContextType>({} as any);

export const ClipProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();

	const [clips, setClips] = useState<ClipMetadata[]>([]);
	const [selectedClipId, setSelectedClipId] = useState<string>();

	const [transform, setTransform] = useState<any>();

	const syncTransform = () => {
		if (selectedClipId == null) return;
		setTransform(core.get_clip_transform(selectedClipId));
	};

	const refreshClips = () => {
		if (core == null) return;
		const clips = core.get_clips();
		if (clips == null) return;
		setClips(clips);
	};

	const selectClip = (id: string) => {
		setSelectedClipId(id);
	};

	const addClip = (start: number, layer: number) => {
		core?.add_clip(start, layer);
		refreshClips();
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
		core.set_clip_transform(id, transform);
		syncTransform();
	};

	useEffect(() => {
		refreshClips();
	}, [core]);

	useEffect(() => {
		syncTransform();
	}, [selectedClipId]);

	return (
		<ClipContext.Provider
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
			}}
		>
			{children}
		</ClipContext.Provider>
	);
};
