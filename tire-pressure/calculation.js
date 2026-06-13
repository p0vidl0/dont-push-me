import {
  WHEEL,
  calculateTirePressureMbar,
  mbarToPsi,
  mbarToBar,
  tireBandPressureWarningMbar,
  shouldUsePressureBandWarning,
} from "./tire-pressure.js";

export const PRESSURE_BAND_WARNING_MESSAGES = {
  front:
    "Перед: давление по расчёту выше порога для выбранной полосы ширины покрышки (прямой борт или выбранный корпус покрышки).",
  rear: "Зад: давление выше порога для полосы ширины покрышки.",
};

/**
 * @param {object} inputs — параметры формы
 * @param {number} inputs.riderWeight
 * @param {number} inputs.bikeWeight
 * @param {number} inputs.innerRimWidth
 * @param {number} inputs.wheelDiameter
 * @param {string} inputs.rimType
 * @param {string} inputs.rideStyle
 * @param {number} inputs.frontWidthMm
 * @param {number} inputs.rearWidthMm
 * @param {string} inputs.tireCasing
 * @param {string} inputs.surface
 */
export function calculateWheelPressures(inputs) {
  const {
    rideStyle,
    rimType,
    tireCasing,
    surface,
    bikeWeight,
    riderWeight,
    innerRimWidth,
    wheelDiameter,
    frontWidthMm,
    rearWidthMm,
  } = inputs;

  const base = {
    rideStyle,
    rimType,
    rearTireCasing: tireCasing,
    surface,
    bikeWeight: Math.round(bikeWeight),
    riderWeight: Math.round(riderWeight),
    innerRimWidth,
    wheelDiameter,
  };

  const frontMbar = calculateTirePressureMbar({
    ...base,
    tireCasing,
    tireWidth: frontWidthMm,
    wheelPosition: WHEEL.FRONT,
  });
  const rearMbar = calculateTirePressureMbar({
    ...base,
    tireCasing,
    tireWidth: rearWidthMm,
    wheelPosition: WHEEL.REAR,
  });

  const warnings = [];
  if (shouldUsePressureBandWarning(rimType, tireCasing, tireCasing)) {
    if (tireBandPressureWarningMbar(frontWidthMm, frontMbar)) {
      warnings.push(PRESSURE_BAND_WARNING_MESSAGES.front);
    }
    if (tireBandPressureWarningMbar(rearWidthMm, rearMbar)) {
      warnings.push(PRESSURE_BAND_WARNING_MESSAGES.rear);
    }
  }

  return {
    frontMbar,
    rearMbar,
    frontPsi: mbarToPsi(frontMbar),
    rearPsi: mbarToPsi(rearMbar),
    frontBar: mbarToBar(frontMbar),
    rearBar: mbarToBar(rearMbar),
    warnings,
  };
}
