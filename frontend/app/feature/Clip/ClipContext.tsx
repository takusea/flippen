import { createContext, useEffect, useState } from "react";
import type { ClipMetadata } from "~/util/clip";
import { useCore } from "../Core/useCore";

type ClipContextType = {
	clips: ClipMetadata[];
	selectedClipId: string | undefined;
	refreshClips: () => void;
	selectClip: (id: string) => void;
	addClip: (start: number, layer: number) => void;
	deleteClip: (id: string) => void;
	moveClip: (id: string, start: number, layer: number) => void;
	changeClipDuration: (id: string, duration: number) => void;
};

export const ClipContext = createContext<ClipContextType>({} as any);

export const ClipProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();

	const [clips, setClips] = useState<ClipMetadata[]>([]);
	const [selectedClipId, setSelectedClipId] = useState<string>();

	const refreshClips = () => {
		if (core) setClips(core.get_clips());
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

	useEffect(() => {
		refreshClips();
	}, [core]);

	return (
		<ClipContext.Provider
			value={{
				clips,
				selectedClipId,
				refreshClips,
				selectClip,
				addClip,
				deleteClip,
				moveClip,
				changeClipDuration,
			}}
		>
			{children}
		</ClipContext.Provider>
	);
};
