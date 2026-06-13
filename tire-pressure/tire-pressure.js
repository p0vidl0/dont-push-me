/**
 * Модель рекомендуемого давления в велосипедных покрышках.
 * Результат — миллибары (мбар): бар = мбар/1000, psi = мбар/MBAR_PER_PSI.
 */

/** Связь мбар и psi в этой модели (68.9476 × 14.5038 ≈ 1000 мбар/бар) */
export const MBAR_PER_PSI = 68.9476;

/** База степенной модели */
const PRESSURE_MODEL_BASE = 10 ** 8.684670773;

/** Показатель степени по «площади» сечения шины/обода */
const PRESSURE_MODEL_SECTION_EXPONENT = -1.304556655;

/** Вес системы в формуле: коэфф. при (велосипед + райдер), кг */
const SYSTEM_WEIGHT_MULTIPLIER = 2.2;

/** Смещение веса в линейной поправке, кг */
const SYSTEM_WEIGHT_OFFSET_KG = 180;

/** Масштаб линейной поправки по весу */
const SYSTEM_WEIGHT_LINEAR_SCALE = 0.0025;

/** Доля вклада внутренней ширины обода в эффективную ширину сечения */
const INNER_RIM_BLEND = 0.4;

export const RIDE_STYLE = {
  ROAD: "RIDE_STYLE_ROAD",
  CROSS: "RIDE_STYLE_CROSS",
  GRAVEL: "RIDE_STYLE_GRAVEL",
  XCOUNTRY_MTB: "RIDE_STYLE_XCOUNTRY_MTB",
  TRAIL_MTB: "RIDE_STYLE_TRAIL_MTB",
  ENDURO_MTB: "RIDE_STYLE_ENDURO_MTB",
  DOWNHILL_MTB: "RIDE_STYLE_DOWNHILL_MTB",
  FAT: "RIDE_STYLE_FAT",
};

/** Множитель давления по стилю езды */
const RIDE_STYLE_PRESSURE_MULTIPLIER = {
  RIDE_STYLE_CROSS: 0.6,
  RIDE_STYLE_DOWNHILL_MTB: 1.1,
  RIDE_STYLE_ENDURO_MTB: 1.05,
  RIDE_STYLE_FAT: 1,
  RIDE_STYLE_GRAVEL: 0.9,
  RIDE_STYLE_ROAD: 1,
  RIDE_STYLE_TRAIL_MTB: 1.05,
  RIDE_STYLE_XCOUNTRY_MTB: 0.9,
};

export const RIM_TYPE = {
  TUBES: "RIM_TYPE_TUBES",
  TUBULAR: "RIM_TYPE_TUBULAR",
  TUBELESS_CROCHET: "RIM_TYPE_TUBELESS_CROCHET",
  TUBELESS_STRAIGHT_SIDE: "RIM_TYPE_TUBELESS_STRAIGHT_SIDE",
  XPLR_303: "RIM_TYPE_303_XPLR",
};

/** Множитель по типу обода для шоссе / MTB / гравия и т.д., не циклокросс */
const RIM_TYPE_PRESSURE_MULTIPLIER_DEFAULT = {
  RIM_TYPE_303_XPLR: 0.9675,
  RIM_TYPE_TUBELESS_CROCHET: 1.03,
  RIM_TYPE_TUBELESS_STRAIGHT_SIDE: 0.955,
  RIM_TYPE_TUBES: 1.05,
  RIM_TYPE_TUBULAR: 1.1,
};

/** Множитель по типу обода для циклокросса */
const RIM_TYPE_PRESSURE_MULTIPLIER_CROSS = {
  RIM_TYPE_TUBELESS_CROCHET: 1.03,
  RIM_TYPE_TUBELESS_STRAIGHT_SIDE: 0.955,
  RIM_TYPE_TUBES: 1.05,
  RIM_TYPE_TUBULAR: 0.9,
};

export const TIRE_CASING = {
  THIN: "TIRE_CASING_THIN",
  STANDARD: "TIRE_CASING_STANDARD",
  REINFORCED: "TIRE_CASING_REINFORCED",
  DOUBLE: "TIRE_CASING_DOUBLE",
  GY_SW: "TIRE_CASING_GY_SW",
  GY_NSW: "TIRE_CASING_GY_NSW",
  GY_XPLR_SLICKS: "TIRE_CASING_GY_XPLR_SLICKS",
  GY_XPLR_VECTOR: "TIRE_CASING_GY_XPLR_VECTOR",
  GY_INTER: "TIRE_CASING_GY_INTER",
};

/** Множитель по корпусу покрышки */
const TIRE_CASING_PRESSURE_MULTIPLIER = {
  TIRE_CASING_DOUBLE: 0.9,
  TIRE_CASING_GY_INTER: 1,
  TIRE_CASING_GY_NSW: 1.025,
  TIRE_CASING_REINFORCED: 0.95,
  TIRE_CASING_STANDARD: 1,
  TIRE_CASING_THIN: 1.025,
  TIRE_CASING_GY_XPLR_SLICKS: 1,
};

export const SURFACE = {
  DRY: "SURFACE_DRY",
  WET: "SURFACE_WET",
  SNOW: "SURFACE_SNOW",
};

/** Множитель по состоянию покрытия */
const SURFACE_PRESSURE_MULTIPLIER = {
  SURFACE_DRY: 1,
  SURFACE_SNOW: 0.5,
  SURFACE_WET: 0.9,
};

export const WHEEL = {
  FRONT: "WHEEL_FRONT",
  REAR: "WHEEL_REAR",
};

/** Перед/зад: доля нагрузки на колесо в формуле */
const WHEEL_POSITION_LOAD_FACTOR = {
  WHEEL_FRONT: 0.94,
  WHEEL_REAR: 1,
};

/**
 * Полосы ширины покрышки (мм) → эталонная внутренняя ширина обода для поправки сечения.
 */
const TIRE_WIDTH_MM_TO_REFERENCE_INNER_RIM_MM = [
  { minTireWidthMm: 18, maxTireWidthMm: 22, referenceInnerRimMm: 15 },
  { minTireWidthMm: 22, maxTireWidthMm: 25, referenceInnerRimMm: 17 },
  { minTireWidthMm: 25, maxTireWidthMm: 29, referenceInnerRimMm: 19 },
  { minTireWidthMm: 29, maxTireWidthMm: 35, referenceInnerRimMm: 21 },
  { minTireWidthMm: 35, maxTireWidthMm: 47, referenceInnerRimMm: 23 },
  { minTireWidthMm: 47, maxTireWidthMm: 58, referenceInnerRimMm: 25 },
  { minTireWidthMm: 58, maxTireWidthMm: 66, referenceInnerRimMm: 30 },
  { minTireWidthMm: 66, maxTireWidthMm: 72, referenceInnerRimMm: 35 },
  { minTireWidthMm: 72, maxTireWidthMm: 84, referenceInnerRimMm: 45 },
  { minTireWidthMm: 84, maxTireWidthMm: 96, referenceInnerRimMm: 55 },
  { minTireWidthMm: 96, maxTireWidthMm: 113, referenceInnerRimMm: 76 },
  { minTireWidthMm: 114, maxTireWidthMm: 133, referenceInnerRimMm: 94 },
];

/** Корпуса Goodyear и др., участвующие в правиле «оба колеса → фикс. эталон 25 мм» */
function isPairedGoodyearWidthRuleCasing(casing) {
  return [
    TIRE_CASING.GY_NSW,
    TIRE_CASING.GY_SW,
    TIRE_CASING.GY_INTER,
    TIRE_CASING.GY_XPLR_SLICKS,
    TIRE_CASING.GY_XPLR_VECTOR,
  ].includes(casing);
}

/** Для XPLR Vector в формуле берётся только номинальная ширина покрышки */
function casingUsesLabeledTreadWidthMmOnly(casing) {
  return casing === TIRE_CASING.GY_XPLR_VECTOR;
}

/**
 * Эталонная внутренняя ширина обода (мм) для поправки сечения по ширине покрышки.
 */
function referenceInnerRimWidthMm(tireWidthMm, bothTiresPairedGoodyearCasings) {
  if (bothTiresPairedGoodyearCasings) return 25;
  const row = TIRE_WIDTH_MM_TO_REFERENCE_INNER_RIM_MM.find(
    ({ minTireWidthMm, maxTireWidthMm }) =>
      tireWidthMm >= minTireWidthMm && tireWidthMm < maxTireWidthMm,
  );
  return row ? row.referenceInnerRimMm : 0;
}

/**
 * @param {object} e
 * @param {number} e.tireWidth — ширина покрышки, мм (уже переведённая с дюймов при MTB)
 * @param {number} e.innerRimWidth — внутренняя ширина обода, мм
 * @param {number} e.wheelDiameter — диаметр обода BSD, мм (622 для 700c)
 * @param {number} e.bikeWeight — масса велосипеда, кг
 * @param {number} e.riderWeight — масса райдера, кг
 * @param {string} e.rideStyle
 * @param {string} e.rimType
 * @param {string} e.tireCasing — корпус покрышки для этого колеса
 * @param {string} e.rearTireCasing — корпус задней (для правила пары Goodyear при поправке ширины)
 * @param {string} e.surface
 * @param {string} e.wheelPosition — WHEEL_FRONT | WHEEL_REAR
 * @returns {number} давление, мбар
 */
export function calculateTirePressureMbar(e) {
  const rideStyleMultiplier =
    RIDE_STYLE_PRESSURE_MULTIPLIER[e.rideStyle] || 0;
  const bothTiresPairedGoodyear =
    isPairedGoodyearWidthRuleCasing(e.tireCasing || "") &&
    isPairedGoodyearWidthRuleCasing(e.rearTireCasing || "");
  const wheelLoadFactor =
    WHEEL_POSITION_LOAD_FACTOR[e.wheelPosition] || 0.5;
  let rimTypeMultiplier =
    e.rideStyle === RIDE_STYLE.CROSS
      ? RIM_TYPE_PRESSURE_MULTIPLIER_CROSS[e.rimType]
      : RIM_TYPE_PRESSURE_MULTIPLIER_DEFAULT[e.rimType];
  if (!rimTypeMultiplier) rimTypeMultiplier = 1;
  const casingMultiplier =
    TIRE_CASING_PRESSURE_MULTIPLIER[e.tireCasing] || 1;
  const surfaceMultiplier = SURFACE_PRESSURE_MULTIPLIER[e.surface] || 1;
  let effectiveSectionWidthMm =
    e.tireWidth +
    INNER_RIM_BLEND *
      (e.innerRimWidth -
        referenceInnerRimWidthMm(e.tireWidth, bothTiresPairedGoodyear));
  if (casingUsesLabeledTreadWidthMmOnly(e.tireCasing || "")) {
    effectiveSectionWidthMm = e.tireWidth;
  }
  const sectionGeometryTerm =
    4 *
    Math.PI ** 2 *
    (e.wheelDiameter / 2 + effectiveSectionWidthMm / 2) *
    (effectiveSectionWidthMm / 2);
  const systemWeightKg = (e.bikeWeight ?? 0) + e.riderWeight;
  const weightCorrectionFactor =
    1 +
    (SYSTEM_WEIGHT_MULTIPLIER * systemWeightKg - SYSTEM_WEIGHT_OFFSET_KG) *
      SYSTEM_WEIGHT_LINEAR_SCALE;
  let pressureCore =
    PRESSURE_MODEL_BASE *
    sectionGeometryTerm ** PRESSURE_MODEL_SECTION_EXPONENT *
    weightCorrectionFactor *
    wheelLoadFactor;
  pressureCore *=
    rimTypeMultiplier *
    rideStyleMultiplier *
    surfaceMultiplier *
    casingMultiplier;
  return pressureCore * MBAR_PER_PSI;
}

export function mbarToPsi(mbar) {
  return mbar / MBAR_PER_PSI;
}

export function mbarToBar(mbar) {
  return mbar / 1000;
}

/** Дюймы → мм (Math.round(x * 25.4)) */
export function inchesWidthToMm(inches) {
  return Math.round(Number(inches) * 25.4);
}

/** Шаг и диапазон слайдера ширины покрышки по стилю езды */
export const TIRE_WIDTH_SLIDER_CONFIG = {
  [RIDE_STYLE.ROAD]: { unit: "mm", min: 23, max: 50, step: 1 },
  [RIDE_STYLE.CROSS]: { unit: "mm", min: 28, max: 45, step: 1 },
  [RIDE_STYLE.GRAVEL]: { unit: "mm", min: 28, max: 61, step: 1 },
  [RIDE_STYLE.XCOUNTRY_MTB]: { unit: "in", min: 1.95, max: 3.5, step: 0.05 },
  [RIDE_STYLE.TRAIL_MTB]: { unit: "in", min: 2.1, max: 3.8, step: 0.05 },
  [RIDE_STYLE.ENDURO_MTB]: { unit: "in", min: 2.35, max: 3.8, step: 0.05 },
  [RIDE_STYLE.DOWNHILL_MTB]: { unit: "in", min: 2.4, max: 3.8, step: 0.05 },
  [RIDE_STYLE.FAT]: { unit: "in", min: 3.8, max: 5.0, step: 0.05 },
};

/** Шоссе и циклокросс — слайдер в миллиметрах, остальные — в дюймах */
export function tireWidthUsesMillimeters(rideStyle) {
  return TIRE_WIDTH_SLIDER_CONFIG[rideStyle]?.unit === "mm";
}

function tireWidthSliderConfig(rideStyle) {
  return (
    TIRE_WIDTH_SLIDER_CONFIG[rideStyle] ?? TIRE_WIDTH_SLIDER_CONFIG[RIDE_STYLE.ROAD]
  );
}

/** Дискретные значения слайдера в единицах отображения (мм или дюймы) */
export function tireWidthSliderSteps(rideStyle) {
  const { unit, min, max, step } = tireWidthSliderConfig(rideStyle);
  const count = Math.round((max - min) / step);
  const steps = [];
  for (let i = 0; i <= count; i++) {
    const value = min + i * step;
    steps.push(
      unit === "mm" ? Math.round(value) : Math.round(value * 100) / 100,
    );
  }
  return steps;
}

/** Значение слайдера → ширина покрышки, мм */
export function tireWidthStepToMm(stepValue, rideStyle) {
  if (tireWidthUsesMillimeters(rideStyle)) return stepValue;
  return inchesWidthToMm(stepValue);
}

/** Ширина покрышки, мм → значение на сетке слайдера в единицах отображения */
export function mmToTireWidthStepValue(mm, rideStyle) {
  if (tireWidthUsesMillimeters(rideStyle)) return mm;
  return Math.round((mm / 25.4) * 100) / 100;
}

/** Ближайшее к сетке значение ширины, мм */
export function snapTireWidthMm(widthMm, rideStyle) {
  const steps = tireWidthSliderSteps(rideStyle);
  let bestMm = tireWidthStepToMm(steps[0], rideStyle);
  let bestDist = Math.abs(widthMm - bestMm);
  for (const stepValue of steps) {
    const mm = tireWidthStepToMm(stepValue, rideStyle);
    const dist = Math.abs(widthMm - mm);
    if (dist < bestDist) {
      bestDist = dist;
      bestMm = mm;
    }
  }
  return bestMm;
}

/** Индекс шага слайдера для ширины в мм */
export function tireWidthSliderIndex(widthMm, rideStyle) {
  const snapped = snapTireWidthMm(widthMm, rideStyle);
  const steps = tireWidthSliderSteps(rideStyle);
  const index = steps.findIndex(
    (stepValue) => tireWidthStepToMm(stepValue, rideStyle) === snapped,
  );
  return index >= 0 ? index : 0;
}

/** Подпись ширины: только основная единица (мм или дюймы) */
export function formatTireWidthPrimary(widthMm, rideStyle) {
  const snappedMm = snapTireWidthMm(widthMm, rideStyle);
  if (tireWidthUsesMillimeters(rideStyle)) {
    return `${snappedMm}мм`;
  }
  const steps = tireWidthSliderSteps(rideStyle);
  const index = tireWidthSliderIndex(widthMm, rideStyle);
  return `${steps[index].toFixed(2)}″`;
}

/** Подпись ширины для UI: основная единица и альтернативная в скобках */
export function formatTireWidth(widthMm, rideStyle) {
  const snappedMm = snapTireWidthMm(widthMm, rideStyle);
  if (tireWidthUsesMillimeters(rideStyle)) {
    const inches = Math.round((snappedMm / 25.4) * 100) / 100;
    return `${formatTireWidthPrimary(widthMm, rideStyle)} (${inches.toFixed(2)}″)`;
  }
  const steps = tireWidthSliderSteps(rideStyle);
  const index = tireWidthSliderIndex(widthMm, rideStyle);
  const inches = steps[index];
  return `${inches.toFixed(2)}″ (${snappedMm}мм)`;
}

/**
 * Ширина покрышки из поля формы → мм для расчёта.
 * Для MTB по умолчанию ввод в дюймах; крупное целое (например 60) чаще означает миллиметры,
 * иначе оно было бы прочитано как дюймы и давление стало бы заниженным.
 * Значения строго больше порога считаем миллиметрами.
 */
export const MTB_TIRE_WIDTH_TREAT_AS_MM_IF_ABOVE_INCHES = 15;

export function tireWidthFromFormToMm(rawWidth, rideStyle) {
  const n = Number(rawWidth);
  if (!Number.isFinite(n)) return NaN;
  const mtbUsesInches = ![
    RIDE_STYLE.ROAD,
    RIDE_STYLE.CROSS,
    RIDE_STYLE.GRAVEL,
  ].includes(rideStyle);
  if (!mtbUsesInches) return n;
  if (n > MTB_TIRE_WIDTH_TREAT_AS_MM_IF_ABOVE_INCHES) return n;
  return inchesWidthToMm(n);
}

/** Пороги предупреждения «давление выше допустимого для ширины» (мбар) */
export const PRESSURE_THRESHOLDS_MM = [
  { minTireWidthMm: 18, maxTireWidthMm: 24, maxPressureMbar: 5500 },
  { minTireWidthMm: 25, maxTireWidthMm: 29, maxPressureMbar: 5000 },
  { minTireWidthMm: 30, maxTireWidthMm: 34, maxPressureMbar: 4500 },
  { minTireWidthMm: 35, maxTireWidthMm: 39, maxPressureMbar: 4000 },
  { minTireWidthMm: 40, maxTireWidthMm: 44, maxPressureMbar: 3500 },
  { minTireWidthMm: 45, maxTireWidthMm: 54, maxPressureMbar: 3000 },
  { minTireWidthMm: 55, maxTireWidthMm: 64, maxPressureMbar: 2500 },
  { minTireWidthMm: 65, maxTireWidthMm: 74, maxPressureMbar: 2000 },
  { minTireWidthMm: 75, maxTireWidthMm: 84, maxPressureMbar: 1500 },
];

export function tireBandPressureWarningMbar(tireWidthMm, pressureMbar) {
  const band = PRESSURE_THRESHOLDS_MM.find(
    (b) =>
      tireWidthMm >= b.minTireWidthMm && tireWidthMm <= b.maxTireWidthMm,
  );
  if (!band) return false;
  return pressureMbar > band.maxPressureMbar;
}

/** Учитывать пороги по полосе ширины только для прямого борта или парных Goodyear-корпусов */
export function shouldUsePressureBandWarning(rimType, frontCasing, rearCasing) {
  const isHooklessStraightSide =
    rimType === RIM_TYPE.TUBELESS_STRAIGHT_SIDE;
  return (
    isHooklessStraightSide ||
    isPairedGoodyearWidthRuleCasing(frontCasing || "") ||
    isPairedGoodyearWidthRuleCasing(rearCasing || "")
  );
}
