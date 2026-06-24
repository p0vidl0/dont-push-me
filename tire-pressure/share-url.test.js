import assert from "node:assert/strict";
import test from "node:test";
import { INNER_RIM_WIDTH_MAX, INNER_RIM_WIDTH_MIN } from "./labels.js";
import {
	buildShareUrl,
	decodeShareToken,
	encodeShareToken,
	parseShareFromSearch,
	SHARE_PARAM,
} from "./share-url.js";
import { RIDE_STYLE, RIM_TYPE, SURFACE, TIRE_CASING } from "./tire-pressure.js";

const roadInputs = {
	riderWeight: 75,
	bikeWeight: 7.7,
	innerRimWidth: 25,
	wheelDiameter: 622,
	rimType: RIM_TYPE.TUBES,
	rideStyle: RIDE_STYLE.ROAD,
	frontWidthMm: 28,
	rearWidthMm: 28,
	tireCasing: TIRE_CASING.STANDARD,
	surface: SURFACE.DRY,
};

const mtbInputs = {
	riderWeight: 80,
	bikeWeight: 12,
	innerRimWidth: 30,
	wheelDiameter: 622,
	rimType: RIM_TYPE.TUBELESS_STRAIGHT_SIDE,
	rideStyle: RIDE_STYLE.TRAIL_MTB,
	frontWidthMm: 60,
	rearWidthMm: 64,
	tireCasing: TIRE_CASING.REINFORCED,
	surface: SURFACE.WET,
};

test("encodeShareToken / decodeShareToken: round-trip для шоссе", () => {
	const token = encodeShareToken(roadInputs, "Шоссе 28");
	const decoded = decodeShareToken(token);
	assert.deepEqual(decoded?.inputs, roadInputs);
	assert.equal(decoded?.name, "Шоссе 28");
});

test("encodeShareToken / decodeShareToken: round-trip для MTB", () => {
	const token = encodeShareToken(mtbInputs);
	const decoded = decodeShareToken(token);
	assert.deepEqual(decoded?.inputs, mtbInputs);
	assert.equal(decoded?.name, undefined);
});

test("buildShareUrl: содержит параметр c", () => {
	const url = buildShareUrl(roadInputs, {
		name: "Test",
		baseUrl: "https://example.test/app/",
	});
	const parsed = new URL(url);
	assert.equal(parsed.searchParams.has(SHARE_PARAM), true);
	assert.deepEqual(
		decodeShareToken(parsed.searchParams.get(SHARE_PARAM))?.inputs,
		roadInputs,
	);
});

test("parseShareFromSearch: читает query string", () => {
	const url = buildShareUrl(roadInputs, {
		baseUrl: "https://example.test/",
	});
	const decoded = parseShareFromSearch(new URL(url).search);
	assert.deepEqual(decoded?.inputs, roadInputs);
});

test("decodeShareToken: битый токен и неизвестная версия", () => {
	assert.equal(decodeShareToken(""), null);
	assert.equal(decodeShareToken("v2.x"), null);
	assert.equal(decodeShareToken("v1.not-base64!!!"), null);
});

test("decodeShareToken: невалидные значения отклоняются", () => {
	const token = encodeShareToken(roadInputs);
	const [, payload] = token.split(".");
	const corrupt = (patch) => {
		const raw = JSON.parse(
			Buffer.from(
				payload.replaceAll("-", "+").replaceAll("_", "/"),
				"base64",
			).toString("utf8"),
		);
		return `v1.${Buffer.from(JSON.stringify({ ...raw, ...patch })).toString("base64url")}`;
	};

	assert.equal(decodeShareToken(corrupt({ rs: "UNKNOWN" })), null);
	assert.equal(
		decodeShareToken(corrupt({ irw: INNER_RIM_WIDTH_MIN - 1 })),
		null,
	);
	assert.equal(
		decodeShareToken(corrupt({ irw: INNER_RIM_WIDTH_MAX + 1 })),
		null,
	);
	assert.equal(decodeShareToken(corrupt({ fw: 0 })), null);
	assert.equal(decodeShareToken(corrupt({ wd: 999 })), null);
});
