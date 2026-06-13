import assert from "node:assert/strict";
import test from "node:test";
import {
  MBAR_PER_PSI,
  calculateTirePressureMbar,
  inchesWidthToMm,
  tireWidthFromFormToMm,
  formatTireWidth,
  snapTireWidthMm,
  tireWidthSliderIndex,
  tireWidthSliderSteps,
  tireWidthStepToMm,
  tireWidthUsesMillimeters,
  mbarToBar,
  mbarToPsi,
  RIDE_STYLE,
  RIM_TYPE,
  SURFACE,
  TIRE_CASING,
  WHEEL,
  tireBandPressureWarningMbar,
  shouldUsePressureBandWarning,
} from "./tire-pressure.js";

function assertApprox(actual, expected, epsilon, message) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `${message ?? "approx"}: expected ${expected} ± ${epsilon}, got ${actual}`,
  );
}

const roadBase = {
  rideStyle: RIDE_STYLE.ROAD,
  rimType: RIM_TYPE.TUBELESS_STRAIGHT_SIDE,
  tireCasing: TIRE_CASING.STANDARD,
  rearTireCasing: TIRE_CASING.STANDARD,
  surface: SURFACE.DRY,
  bikeWeight: 8,
  riderWeight: 75,
  innerRimWidth: 21,
  wheelDiameter: 622,
};

test("MBAR_PER_PSI: psi и бар согласованы с мбар", () => {
  const mbar = 4053.71;
  assertApprox(mbarToPsi(mbar) * MBAR_PER_PSI, mbar, 1e-6, "psi round-trip");
  assertApprox(mbarToBar(mbar) * 1000, mbar, 1e-6, "bar round-trip");
});

test("inchesWidthToMm: round(x * 25.4)", () => {
  assert.equal(inchesWidthToMm(2.5), 64);
  assert.equal(inchesWidthToMm(2.25), 57);
});

test("tireWidthFromFormToMm: MTB — дюймы, крупные числа как мм", () => {
  assert.equal(
    tireWidthFromFormToMm("2.5", RIDE_STYLE.XCOUNTRY_MTB),
    64,
    "2.5 дюйма",
  );
  assert.equal(
    tireWidthFromFormToMm("60", RIDE_STYLE.XCOUNTRY_MTB),
    60,
    "60 мм, не 60 дюймов",
  );
  assert.equal(tireWidthFromFormToMm("28", RIDE_STYLE.ROAD), 28, "шоссе — мм");
  assert.equal(
    tireWidthFromFormToMm("15", RIDE_STYLE.TRAIL_MTB),
    inchesWidthToMm(15),
    "ровно порог — ещё дюймы",
  );
  assert.equal(tireWidthFromFormToMm("16", RIDE_STYLE.TRAIL_MTB), 16, ">15 — мм");
});

test("tireWidthSliderSteps: шоссе — мм с шагом 1", () => {
  const steps = tireWidthSliderSteps(RIDE_STYLE.ROAD);
  assert.equal(steps[0], 23);
  assert.equal(steps.at(-1), 50);
  assert.equal(steps.length, 28);
  assert.ok(tireWidthUsesMillimeters(RIDE_STYLE.ROAD));
  assert.ok(tireWidthUsesMillimeters(RIDE_STYLE.CROSS));
  assert.ok(tireWidthUsesMillimeters(RIDE_STYLE.GRAVEL));
});

test("tireWidthSliderSteps: MTB — дюймы с шагом 0.05", () => {
  const steps = tireWidthSliderSteps(RIDE_STYLE.XCOUNTRY_MTB);
  assert.equal(steps[0], 1.95);
  assert.equal(steps[1], 2);
  assert.equal(tireWidthStepToMm(2.5, RIDE_STYLE.TRAIL_MTB), 64);
});

test("snapTireWidthMm: привязка к сетке и смена стиля", () => {
  assert.equal(snapTireWidthMm(28.4, RIDE_STYLE.ROAD), 28);
  assert.equal(snapTireWidthMm(28.6, RIDE_STYLE.ROAD), 29);
  assert.equal(
    snapTireWidthMm(tireWidthStepToMm(2.5, RIDE_STYLE.XCOUNTRY_MTB), RIDE_STYLE.XCOUNTRY_MTB),
    64,
  );
  assert.equal(
    tireWidthSliderIndex(64, RIDE_STYLE.TRAIL_MTB),
    tireWidthSliderSteps(RIDE_STYLE.TRAIL_MTB).indexOf(2.5),
  );
});

test("formatTireWidth: основная единица и альтернативная в скобках", () => {
  assert.equal(formatTireWidth(28, RIDE_STYLE.ROAD), "28мм (1.10″)");
  assert.equal(formatTireWidth(64, RIDE_STYLE.TRAIL_MTB), "2.50″ (64мм)");
});

test("calculateTirePressureMbar: шоссе 28 мм, эталонный сценарий", () => {
  const front = calculateTirePressureMbar({
    ...roadBase,
    tireWidth: 28,
    wheelPosition: WHEEL.FRONT,
  });
  const rear = calculateTirePressureMbar({
    ...roadBase,
    tireWidth: 28,
    wheelPosition: WHEEL.REAR,
  });
  assertApprox(mbarToPsi(front), 58.8, 0.06, "front psi");
  assertApprox(mbarToPsi(rear), 62.5, 0.06, "rear psi");
  assert.ok(rear > front, "зад выше передa");
});

test("calculateTirePressureMbar: XC MTB, обод 30 мм hookless tubeless, покрышки 60 мм", () => {
  /** Ширина покрышки в мм, как в ядре после перевода с дюймов; BSD 622 (29"). */
  const xcMtb = {
    rideStyle: RIDE_STYLE.XCOUNTRY_MTB,
    rimType: RIM_TYPE.TUBELESS_STRAIGHT_SIDE,
    tireCasing: TIRE_CASING.STANDARD,
    rearTireCasing: TIRE_CASING.STANDARD,
    surface: SURFACE.DRY,
    bikeWeight: 12,
    riderWeight: 75,
    innerRimWidth: 30,
    wheelDiameter: 622,
    tireWidth: 60,
  };
  const front = calculateTirePressureMbar({
    ...xcMtb,
    wheelPosition: WHEEL.FRONT,
  });
  const rear = calculateTirePressureMbar({
    ...xcMtb,
    wheelPosition: WHEEL.REAR,
  });
  assertApprox(mbarToPsi(front), 19.53, 0.05, "перед psi");
  assertApprox(mbarToPsi(rear), 20.77, 0.05, "зад psi");
  assert.ok(rear > front, "зад выше передa");
  assert.equal(
    shouldUsePressureBandWarning(
      RIM_TYPE.TUBELESS_STRAIGHT_SIDE,
      TIRE_CASING.STANDARD,
      TIRE_CASING.STANDARD,
    ),
    true,
    "прямой борт — проверка полосы давления включена",
  );
  assert.equal(
    tireBandPressureWarningMbar(60, rear),
    false,
    "60 мм в полосе 55–64: расчёт ниже порога 2500 мбар",
  );
});

test("calculateTirePressureMbar: гравий снижает давление относительно шоссе", () => {
  const input = {
    ...roadBase,
    tireWidth: 40,
    wheelPosition: WHEEL.REAR,
  };
  const roadPsi = mbarToPsi(
    calculateTirePressureMbar({ ...input, rideStyle: RIDE_STYLE.ROAD }),
  );
  const gravelPsi = mbarToPsi(
    calculateTirePressureMbar({ ...input, rideStyle: RIDE_STYLE.GRAVEL }),
  );
  assertApprox(gravelPsi / roadPsi, 0.9, 1e-9, "множитель гравия 0.9");
});

test("calculateTirePressureMbar: циклокросс + тубуляр ≠ шоссе + тубуляр", () => {
  const input = {
    ...roadBase,
    rimType: RIM_TYPE.TUBULAR,
    tireWidth: 33,
    wheelPosition: WHEEL.FRONT,
  };
  const roadPsi = mbarToPsi(
    calculateTirePressureMbar({ ...input, rideStyle: RIDE_STYLE.ROAD }),
  );
  const crossPsi = mbarToPsi(
    calculateTirePressureMbar({ ...input, rideStyle: RIDE_STYLE.CROSS }),
  );
  assert.ok(crossPsi < roadPsi, "циклокросс ниже шоссе при том же ободе");
  assertApprox(crossPsi / roadPsi, (0.6 * 0.9) / 1.1, 0.02, "roughly style * rim ratio");
});

test("calculateTirePressureMbar: мокрая поверхность ×0.9", () => {
  const wheel = {
    ...roadBase,
    tireWidth: 28,
    wheelPosition: WHEEL.FRONT,
  };
  const dry = calculateTirePressureMbar({ ...wheel, surface: SURFACE.DRY });
  const wet = calculateTirePressureMbar({ ...wheel, surface: SURFACE.WET });
  assertApprox(wet / dry, 0.9, 1e-9);
});

test("tireBandPressureWarningMbar: полоса 25–29 мм и порог 5000 мбар", () => {
  assert.equal(tireBandPressureWarningMbar(28, 4999), false);
  assert.equal(tireBandPressureWarningMbar(28, 5001), true);
});

test("tireBandPressureWarningMbar: вне полос — без предупреждения", () => {
  assert.equal(tireBandPressureWarningMbar(17, 999999), false);
});

test("shouldUsePressureBandWarning: прямой борт или Goodyear-корпус", () => {
  assert.equal(
    shouldUsePressureBandWarning(RIM_TYPE.TUBELESS_STRAIGHT_SIDE, "", ""),
    true,
  );
  assert.equal(
    shouldUsePressureBandWarning(
      RIM_TYPE.TUBELESS_CROCHET,
      TIRE_CASING.STANDARD,
      TIRE_CASING.STANDARD,
    ),
    false,
  );
  assert.equal(
    shouldUsePressureBandWarning(
      RIM_TYPE.TUBELESS_CROCHET,
      "",
      TIRE_CASING.GY_SW,
    ),
    true,
  );
});

test("GY_XPLR_VECTOR: только номинальная ширина, без поправки обода", () => {
  const common = {
    rideStyle: RIDE_STYLE.ROAD,
    rimType: RIM_TYPE.TUBELESS_STRAIGHT_SIDE,
    rearTireCasing: TIRE_CASING.GY_XPLR_VECTOR,
    surface: SURFACE.DRY,
    bikeWeight: 10,
    riderWeight: 80,
    wheelDiameter: 622,
    tireWidth: 40,
    wheelPosition: WHEEL.FRONT,
  };
  const vector = calculateTirePressureMbar({
    ...common,
    tireCasing: TIRE_CASING.GY_XPLR_VECTOR,
    innerRimWidth: 22,
  });
  const vectorWideRim = calculateTirePressureMbar({
    ...common,
    tireCasing: TIRE_CASING.GY_XPLR_VECTOR,
    innerRimWidth: 35,
  });
  assert.equal(vector, vectorWideRim, "ширина обода не влияет на Vector");

  const standard = calculateTirePressureMbar({
    ...common,
    tireCasing: TIRE_CASING.STANDARD,
    rearTireCasing: TIRE_CASING.STANDARD,
    innerRimWidth: 22,
  });
  const standardWideRim = calculateTirePressureMbar({
    ...common,
    tireCasing: TIRE_CASING.STANDARD,
    rearTireCasing: TIRE_CASING.STANDARD,
    innerRimWidth: 35,
  });
  assert.ok(
    standardWideRim !== standard,
    "у стандартного корпуса давление зависит от обода",
  );
});
