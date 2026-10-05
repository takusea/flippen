import { useCore } from "~/infrastructure/core/useCore";
import type { ClipMetadata, ClipProperties } from "~/shared/lib/clip";

type Options = {
	clips: ClipMetadata[];
	isLayerLocked: (layer: number) => boolean;
	onClipSelected: (
		id: string,
		layer: number,
		shouldSelectLayer?: boolean,
	) => void;
};

export const useClipCommands = ({
	clips,
	isLayerLocked,
	onClipSelected,
}: Options) => {
	const core = useCore();

	const addClip = async (start: number, layer: number) => {
		if (isLayerLocked(layer)) return;
		const nextClips = await core.addClip(start, layer);
		const clip = nextClips.find(
			(candidate) =>
				candidate.start === start && candidate.layer_index === layer,
		);
		if (clip != null) onClipSelected(clip.id, layer, true);
	};

	const ensureClipAt = async (frame: number, layer: number) => {
		if (isLayerLocked(layer)) return undefined;

		const existingClip = clips.find(
			(clip) =>
				clip.layer_index === layer &&
				clip.start <= frame &&
				frame < clip.start + clip.duration,
		);
		if (existingClip != null) {
			onClipSelected(existingClip.id, layer);
			return existingClip.id;
		}

		const nextClips = await core.addClip(frame, layer);
		const newClip = nextClips.find(
			(clip) =>
				clip.start === frame &&
				clip.layer_index === layer &&
				!clips.some((existing) => existing.id === clip.id),
		);
		if (newClip == null) return undefined;
		onClipSelected(newClip.id, layer);
		return newClip.id;
	};

	const deleteClip = async (id: string) => {
		const clip = clips.find((candidate) => candidate.id === id);
		if (clip == null || isLayerLocked(clip.layer_index)) return;
		await core.deleteClip(id);
	};

	const moveClip = async (id: string, start: number, layer: number) => {
		const clip = clips.find((candidate) => candidate.id === id);
		if (
			clip == null ||
			isLayerLocked(clip.layer_index) ||
			isLayerLocked(layer)
		) {
			return;
		}

		const otherLayerClips = clips.filter(
			(candidate) => candidate.id !== id && candidate.layer_index === layer,
		);
		const candidateStarts = [
			start,
			0,
			...otherLayerClips.flatMap((candidate) => [
				candidate.start - clip.duration,
				candidate.start + candidate.duration,
			]),
		].filter(
			(candidateStart) =>
				candidateStart >= 0 &&
				!otherLayerClips.some(
					(candidate) =>
						candidateStart < candidate.start + candidate.duration &&
						candidate.start < candidateStart + clip.duration,
				),
		);
		const direction = Math.sign(start - clip.start);
		const adjustedStart = candidateStarts.reduce((closest, candidateStart) => {
			const distanceDifference =
				Math.abs(candidateStart - start) - Math.abs(closest - start);
			if (distanceDifference !== 0)
				return distanceDifference < 0 ? candidateStart : closest;
			return direction * (candidateStart - closest) > 0
				? candidateStart
				: closest;
		});

		await core.moveClip(id, adjustedStart, layer);
	};

	const changeClipDuration = async (id: string, duration: number) => {
		const clip = clips.find((candidate) => candidate.id === id);
		if (clip == null || isLayerLocked(clip.layer_index)) return;

		const nextClipStart = clips.reduce(
			(earliest, candidate) =>
				candidate.id !== id &&
				candidate.layer_index === clip.layer_index &&
				candidate.start >= clip.start
					? Math.min(earliest, candidate.start)
					: earliest,
			Number.POSITIVE_INFINITY,
		);
		const adjustedDuration = Math.max(
			1,
			Math.min(duration, nextClipStart - clip.start),
		);

		await core.changeClipDuration(id, adjustedDuration);
	};

	const changeClipName = async (id: string, name: string) => {
		if (!clips.some((clip) => clip.id === id) || name.trim().length === 0) {
			return;
		}
		await core.changeClipName(id, name.trim());
	};

	const changeClipProperties = async (
		id: string,
		properties: ClipProperties,
	) => {
		const clip = clips.find((candidate) => candidate.id === id);
		if (clip == null || isLayerLocked(clip.layer_index)) return;
		await core.changeClipProperties(id, properties);
	};

	return {
		addClip,
		deleteClip,
		moveClip,
		changeClipDuration,
		changeClipName,
		changeClipProperties,
		ensureClipAt,
	};
};
