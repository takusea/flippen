import { use } from "react";
import { PlaybackContext } from "./PlaybackContext";

export const usePlayback = () => {
	const playback = use(PlaybackContext);

	if (playback == null) throw new Error("Playback is null");

	return playback;
};
