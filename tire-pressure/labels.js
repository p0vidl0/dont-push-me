import {
	formatTireWidthPrimary,
	RIDE_STYLE,
	RIM_TYPE,
	SURFACE,
	TIRE_CASING,
} from "./tire-pressure.js";

export const rideLabels = {
	[RIDE_STYLE.ROAD]: "Шоссе",
	[RIDE_STYLE.CROSS]: "Циклокросс",
	[RIDE_STYLE.GRAVEL]: "Гравий",
	[RIDE_STYLE.XCOUNTRY_MTB]: "XC MTB",
	[RIDE_STYLE.TRAIL_MTB]: "Trail MTB",
	[RIDE_STYLE.ENDURO_MTB]: "Enduro MTB",
	[RIDE_STYLE.DOWNHILL_MTB]: "Downhill MTB",
	[RIDE_STYLE.FAT]: "Fatbike",
};

export const rimLabels = {
	[RIM_TYPE.TUBES]: "Камера (Tubes)",
	[RIM_TYPE.TUBULAR]: "Трубка",
	[RIM_TYPE.TUBELESS_CROCHET]: "Бескамерный, с крючком",
	[RIM_TYPE.TUBELESS_STRAIGHT_SIDE]: "Бескамерный, прямой борт",
};

export const casingLabels = {
	[TIRE_CASING.THIN]: "Тонкий",
	[TIRE_CASING.STANDARD]: "Стандарт",
	[TIRE_CASING.REINFORCED]: "Усиленный",
	[TIRE_CASING.DOUBLE]: "Двойной",
};

export const surfaceLabels = {
	[SURFACE.DRY]: "Сухо",
	[SURFACE.WET]: "Мокро",
	[SURFACE.SNOW]: "Снег",
};

/** BSD, мм → подпись в дропдауне */
export const wheelDiameterLabels = {
	622: "700c",
	584: "650b",
	571: "650c",
};

export const wheelDiameterOrder = [622, 584, 571];

export const rideStyleOrder = Object.keys(rideLabels);
export const surfaceOrder = Object.keys(surfaceLabels);

export const INNER_RIM_WIDTH_MIN = 15;
export const INNER_RIM_WIDTH_MAX = 50;
export const INNER_RIM_WIDTH_DEFAULT = 25;

export function nameLabelMaps() {
	return {
		rideStyle: rideLabels,
		surface: surfaceLabels,
		formatTireWidthPrimary,
	};
}
