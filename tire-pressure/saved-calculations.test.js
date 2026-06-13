import assert from "node:assert/strict";
import test from "node:test";
import {
	createSavedCalculation,
	deleteSavedCalculation,
	findSavedCalculation,
	parseSavedCalculations,
	serializeSavedCalculations,
	suggestCalculationName,
	updateSavedCalculation,
} from "./saved-calculations.js";
import {
	formatTireWidthPrimary,
	RIDE_STYLE,
	SURFACE,
} from "./tire-pressure.js";

const sampleInputs = {
	riderWeight: 75,
	bikeWeight: 8,
	innerRimWidth: 21,
	wheelDiameter: 622,
	rimType: "RIM_TYPE_TUBES",
	rideStyle: "RIDE_STYLE_ROAD",
	frontWidthMm: 28,
	rearWidthMm: 28,
	tireCasing: "TIRE_CASING_STANDARD",
	surface: "SURFACE_DRY",
};

const sampleResults = {
	frontPsi: 58.8,
	rearPsi: 62.5,
	frontBar: 4.05,
	rearBar: 4.31,
};

test("parseSavedCalculations: пусто и битый JSON", () => {
	assert.deepEqual(parseSavedCalculations(""), []);
	assert.deepEqual(parseSavedCalculations("{"), []);
	assert.deepEqual(parseSavedCalculations('{"x":1}'), []);
});

test("createSavedCalculation: добавляет запись с названием", () => {
	const list = createSavedCalculation(
		[],
		"Шоссе 28",
		sampleInputs,
		sampleResults,
	);
	assert.equal(list.length, 1);
	assert.equal(list[0].name, "Шоссе 28");
	assert.deepEqual(list[0].inputs, sampleInputs);
	assert.equal(list[0].id.length > 0, true);
});

test("createSavedCalculation: пустое название — ошибка", () => {
	assert.throws(
		() => createSavedCalculation([], "  ", sampleInputs, sampleResults),
		/пустым/,
	);
});

test("updateSavedCalculation: меняет название и параметры", () => {
	const created = createSavedCalculation([], "A", sampleInputs, sampleResults);
	const id = created[0].id;
	const updated = updateSavedCalculation(
		created,
		id,
		"B",
		{ ...sampleInputs, frontWidthMm: 30 },
		{ ...sampleResults, frontPsi: 55 },
	);
	assert.equal(updated.length, 1);
	assert.equal(updated[0].name, "B");
	assert.equal(updated[0].inputs.frontWidthMm, 30);
	assert.equal(updated[0].createdAt, created[0].createdAt);
	assert.ok(updated[0].updatedAt >= created[0].updatedAt);
});

test("deleteSavedCalculation: удаляет по id", () => {
	const list = createSavedCalculation([], "A", sampleInputs, sampleResults);
	const id = list[0].id;
	const next = deleteSavedCalculation(list, id);
	assert.equal(next.length, 0);
	assert.equal(findSavedCalculation(list, id)?.name, "A");
});

test("serializeSavedCalculations: round-trip", () => {
	const list = createSavedCalculation([], "Test", sampleInputs, sampleResults);
	const restored = parseSavedCalculations(serializeSavedCalculations(list));
	assert.deepEqual(restored[0].inputs, sampleInputs);
});

test("suggestCalculationName: стиль, ширина и покрытие", () => {
	const labels = {
		rideStyle: { RIDE_STYLE_ROAD: "Шоссе" },
		surface: { SURFACE_DRY: "Сухо" },
		formatTireWidthPrimary: (mm) => `${mm}мм`,
	};
	assert.equal(
		suggestCalculationName(sampleInputs, labels),
		"Шоссе · 28мм · Сухо",
	);
	assert.equal(
		suggestCalculationName(
			{ ...sampleInputs, frontWidthMm: 28, rearWidthMm: 30 },
			labels,
		),
		"Шоссе · 28мм / 30мм · Сухо",
	);
});

test("suggestCalculationName: интеграция с tire-pressure", () => {
	const labels = {
		rideStyle: { [RIDE_STYLE.ROAD]: "Шоссе" },
		surface: { [SURFACE.WET]: "Мокро" },
		formatTireWidthPrimary,
	};
	assert.equal(
		suggestCalculationName({ ...sampleInputs, surface: SURFACE.WET }, labels),
		"Шоссе · 28мм · Мокро",
	);
});
