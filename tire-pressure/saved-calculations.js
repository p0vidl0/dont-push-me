export const STORAGE_KEY = "tire-pressure-saved-v1";

export function parseSavedCalculations(raw) {
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function serializeSavedCalculations(list) {
	return JSON.stringify(list);
}

export function createCalculationId() {
	if (typeof crypto !== "undefined" && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** @param {object} inputs — параметры формы */
export function createSavedCalculation(list, name, inputs, results) {
	const trimmed = String(name ?? "").trim();
	if (!trimmed) {
		throw new Error("Название расчёта не может быть пустым");
	}
	const now = new Date().toISOString();
	const entry = {
		id: createCalculationId(),
		name: trimmed,
		createdAt: now,
		updatedAt: now,
		inputs,
		results,
	};
	return [...list, entry];
}

export function updateSavedCalculation(list, id, name, inputs, results) {
	const trimmed = String(name ?? "").trim();
	if (!trimmed) {
		throw new Error("Название расчёта не может быть пустым");
	}
	const index = list.findIndex((entry) => entry.id === id);
	if (index < 0) {
		throw new Error("Расчёт не найден");
	}
	const now = new Date().toISOString();
	const next = list.slice();
	next[index] = {
		...next[index],
		name: trimmed,
		updatedAt: now,
		inputs,
		results,
	};
	return next;
}

export function deleteSavedCalculation(list, id) {
	return list.filter((entry) => entry.id !== id);
}

export function findSavedCalculation(list, id) {
	return list.find((entry) => entry.id === id) ?? null;
}

/**
 * Автоматическое название по параметрам расчёта.
 * @param {object} inputs
 * @param {object} labels
 * @param {Record<string, string>} labels.rideStyle
 * @param {Record<string, string>} labels.surface
 * @param {(widthMm: number, rideStyle: string) => string} labels.formatTireWidthPrimary
 */
export function suggestCalculationName(inputs, labels) {
	const style = labels.rideStyle[inputs.rideStyle] ?? inputs.rideStyle;
	const surfaceLabel = labels.surface[inputs.surface] ?? inputs.surface;
	const front = labels.formatTireWidthPrimary(
		inputs.frontWidthMm,
		inputs.rideStyle,
	);
	const rear = labels.formatTireWidthPrimary(
		inputs.rearWidthMm,
		inputs.rideStyle,
	);
	const width = front === rear ? front : `${front} / ${rear}`;
	return `${style} · ${width} · ${surfaceLabel}`;
}
