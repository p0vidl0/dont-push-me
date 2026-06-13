import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateWheelPressures,
  PRESSURE_BAND_WARNING_MESSAGES,
} from "./calculation.js";
import { RIDE_STYLE, RIM_TYPE, SURFACE, TIRE_CASING } from "./tire-pressure.js";

function assertApprox(actual, expected, epsilon, message) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `${message ?? "approx"}: expected ${expected} ± ${epsilon}, got ${actual}`,
  );
}

const roadInputs = {
  riderWeight: 75,
  bikeWeight: 8,
  innerRimWidth: 21,
  wheelDiameter: 622,
  rimType: RIM_TYPE.TUBELESS_STRAIGHT_SIDE,
  rideStyle: RIDE_STYLE.ROAD,
  frontWidthMm: 28,
  rearWidthMm: 28,
  tireCasing: TIRE_CASING.STANDARD,
  surface: SURFACE.DRY,
};

test("calculateWheelPressures: шоссе 28 мм, перед и зад", () => {
  const result = calculateWheelPressures(roadInputs);
  assertApprox(result.frontPsi, 58.8, 0.06, "front psi");
  assertApprox(result.rearPsi, 62.5, 0.06, "rear psi");
  assert.ok(result.rearPsi > result.frontPsi, "зад выше передa");
  assert.deepEqual(result.warnings, [], "без предупреждений при нормальном давлении");
});

test("calculateWheelPressures: округляет массу велосипеда и райдера", () => {
  const result = calculateWheelPressures({
    ...roadInputs,
    bikeWeight: 7.7,
    riderWeight: 75.4,
  });
  const rounded = calculateWheelPressures({
    ...roadInputs,
    bikeWeight: 8,
    riderWeight: 75,
  });
  assert.equal(result.frontPsi, rounded.frontPsi);
  assert.equal(result.rearPsi, rounded.rearPsi);
});

test("calculateWheelPressures: при одинаковой ширине зад выше передa", () => {
  const result = calculateWheelPressures(roadInputs);
  assert.ok(result.rearPsi > result.frontPsi, "нагрузка на заднее колесо выше");
});

test("calculateWheelPressures: более узкая покрышка — выше давление", () => {
  const narrow = calculateWheelPressures({ ...roadInputs, frontWidthMm: 25, rearWidthMm: 25 });
  const wide = calculateWheelPressures({ ...roadInputs, frontWidthMm: 35, rearWidthMm: 35 });
  assert.ok(narrow.frontPsi > wide.frontPsi, "25 мм > 35 мм");
  assert.ok(narrow.rearPsi > wide.rearPsi, "25 мм > 35 мм");
});

test("calculateWheelPressures: предупреждение при превышении порога полосы", () => {
  const result = calculateWheelPressures({
    ...roadInputs,
    frontWidthMm: 28,
    rearWidthMm: 28,
    rimType: RIM_TYPE.TUBELESS_STRAIGHT_SIDE,
  });
  assert.equal(result.warnings.length, 0, "нормальное давление — без предупреждений");

  const highPressure = calculateWheelPressures({
    ...roadInputs,
    riderWeight: 150,
    bikeWeight: 20,
    frontWidthMm: 22,
    rearWidthMm: 22,
    rimType: RIM_TYPE.TUBELESS_STRAIGHT_SIDE,
  });
  assert.ok(
    highPressure.warnings.includes(PRESSURE_BAND_WARNING_MESSAGES.front),
    "перед: предупреждение при высоком давлении на узкой покрышке",
  );
});

test("calculateWheelPressures: без предупреждений для крючкового борта и стандартного корпуса", () => {
  const result = calculateWheelPressures({
    ...roadInputs,
    rimType: RIM_TYPE.TUBELESS_CROCHET,
    tireCasing: TIRE_CASING.STANDARD,
    riderWeight: 150,
    bikeWeight: 20,
  });
  assert.deepEqual(result.warnings, []);
});

test("calculateWheelPressures: XC MTB 60 мм", () => {
  const result = calculateWheelPressures({
    riderWeight: 75,
    bikeWeight: 12,
    innerRimWidth: 30,
    wheelDiameter: 622,
    rimType: RIM_TYPE.TUBELESS_STRAIGHT_SIDE,
    rideStyle: RIDE_STYLE.XCOUNTRY_MTB,
    frontWidthMm: 60,
    rearWidthMm: 60,
    tireCasing: TIRE_CASING.STANDARD,
    surface: SURFACE.DRY,
  });
  assertApprox(result.frontPsi, 19.53, 0.05, "перед psi");
  assertApprox(result.rearPsi, 20.77, 0.05, "зад psi");
});
