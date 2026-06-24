import {
	INNER_RIM_WIDTH_MAX,
	INNER_RIM_WIDTH_MIN,
	wheelDiameterOrder,
} from "./labels.js";
import { RIDE_STYLE, RIM_TYPE, SURFACE, TIRE_CASING } from "./tire-pressure.js";

export const SHARE_PARAM = "c";
export const SHARE_VERSION = "v1";

const VALID_RIDE_STYLES = new Set(Object.values(RIDE_STYLE));
const VALID_RIM_TYPES = new Set(Object.values(RIM_TYPE));
const VALID_TIRE_CASINGS = new Set(Object.values(TIRE_CASING));
const VALID_SURFACES = new Set(Object.values(SURFACE));
const VALID_WHEEL_DIAMETERS = new Set(wheelDiameterOrder);

function toBase64Url(text) {
	const bytes = new TextEncoder().encode(text);
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary)
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replace(/=+$/, "");
}

function fromBase64Url(encoded) {
	const base64 = encoded.replaceAll("-", "+").replaceAll("_", "/");
	const pad = base64.length % 4;
	const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return new TextDecoder().decode(bytes);
}

function isNonNegativeNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isPositiveNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function encodePayload(inputs, name) {
	const payload = {
		v: 1,
		rw: inputs.riderWeight,
		bw: inputs.bikeWeight,
		irw: inputs.innerRimWidth,
		wd: inputs.wheelDiameter,
		rt: inputs.rimType,
		rs: inputs.rideStyle,
		fw: inputs.frontWidthMm,
		rm: inputs.rearWidthMm,
		tc: inputs.tireCasing,
		sf: inputs.surface,
	};
	const trimmedName = String(name ?? "").trim();
	if (trimmedName) payload.n = trimmedName.slice(0, 80);
	return payload;
}

function decodePayload(raw) {
	if (!raw || typeof raw !== "object" || raw.v !== 1) return null;

	const riderWeight = Number(raw.rw);
	const bikeWeight = Number(raw.bw);
	const innerRimWidth = Number(raw.irw);
	const wheelDiameter = Number(raw.wd);
	const frontWidthMm = Number(raw.fw);
	const rearWidthMm = Number(raw.rm);
	const rimType = raw.rt;
	const rideStyle = raw.rs;
	const tireCasing = raw.tc;
	const surface = raw.sf;

	if (
		!isNonNegativeNumber(riderWeight) ||
		!isNonNegativeNumber(bikeWeight) ||
		!Number.isFinite(innerRimWidth) ||
		innerRimWidth < INNER_RIM_WIDTH_MIN ||
		innerRimWidth > INNER_RIM_WIDTH_MAX ||
		!VALID_WHEEL_DIAMETERS.has(wheelDiameter) ||
		!VALID_RIM_TYPES.has(rimType) ||
		!VALID_RIDE_STYLES.has(rideStyle) ||
		!isPositiveNumber(frontWidthMm) ||
		!isPositiveNumber(rearWidthMm) ||
		!VALID_TIRE_CASINGS.has(tireCasing) ||
		!VALID_SURFACES.has(surface)
	) {
		return null;
	}

	const result = {
		inputs: {
			riderWeight,
			bikeWeight,
			innerRimWidth: Math.round(innerRimWidth),
			wheelDiameter,
			rimType,
			rideStyle,
			frontWidthMm,
			rearWidthMm,
			tireCasing,
			surface,
		},
	};

	const name = String(raw.n ?? "").trim();
	if (name) result.name = name.slice(0, 80);
	return result;
}

/** @returns {string} значение параметра `c` без префикса версии */
export function encodeShareToken(inputs, name) {
	const json = JSON.stringify(encodePayload(inputs, name));
	return `${SHARE_VERSION}.${toBase64Url(json)}`;
}

/** @param {string} token значение `c` вида `v1.<base64url>` */
export function decodeShareToken(token) {
	if (typeof token !== "string") return null;
	const match = token.match(/^v1\.(.+)$/);
	if (!match) return null;
	try {
		const json = fromBase64Url(match[1]);
		return decodePayload(JSON.parse(json));
	} catch {
		return null;
	}
}

export function parseShareFromSearch(search = "") {
	const query = search.startsWith("?") ? search.slice(1) : search;
	const token = new URLSearchParams(query).get(SHARE_PARAM);
	if (!token) return null;
	return decodeShareToken(token);
}

export function buildShareUrl(inputs, { name, baseUrl } = {}) {
	const resolvedBase =
		baseUrl ??
		(typeof location !== "undefined"
			? `${location.origin}${location.pathname}`
			: "./");
	const url = new URL(resolvedBase);
	url.searchParams.set(SHARE_PARAM, encodeShareToken(inputs, name));
	return url.toString();
}
