export type ProjectSettings = {
	title: string;
	width: number;
	height: number;
	frameRate: number;
	startFrame: number;
	endFrame: number;
};

export const DEFAULT_START_FRAME = 0;
export const DEFAULT_END_FRAME = 255;
export const MAX_FRAME_INDEX = 10000;
