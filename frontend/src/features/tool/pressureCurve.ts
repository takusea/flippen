export type PressurePoint = [number, number];

const evaluateBezier = (points: PressurePoint[], t: number): PressurePoint => {
	const work = points.map(([x, y]) => [x, y] as PressurePoint);
	for (let length = work.length - 1; length > 0; length--) {
		for (let i = 0; i < length; i++) {
			work[i] = [
				work[i][0] + (work[i + 1][0] - work[i][0]) * t,
				work[i][1] + (work[i + 1][1] - work[i][1]) * t,
			];
		}
	}
	return work[0];
};

export const getPressureCurvePath = (points: PressurePoint[], size: number) => {
	const samples = Math.max(32, points.length * 8);
	return Array.from({ length: samples + 1 }, (_, index) => {
		const [x, y] = evaluateBezier(points, index / samples);
		return `${index === 0 ? "M" : "L"} ${x * size} ${(1 - y) * size}`;
	}).join(" ");
};

export const applyPressureCurve = (points: PressurePoint[], input: number) => {
	const pressure = Math.max(0, Math.min(1, input));
	let low = 0;
	let high = 1;
	for (let iteration = 0; iteration < 16; iteration++) {
		const t = (low + high) / 2;
		if (evaluateBezier(points, t)[0] < pressure) low = t;
		else high = t;
	}
	return evaluateBezier(points, (low + high) / 2)[1];
};
