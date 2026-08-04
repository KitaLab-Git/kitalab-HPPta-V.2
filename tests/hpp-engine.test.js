"use strict";

const assert = require("node:assert/strict");
require("../assets/js/hpp-engine.js");

const ingredient = {
  purchasePrice: 20000,
  purchaseQty: 1000,
  purchaseUnit: "g",
  usedQty: 250,
  usedUnit: "g",
  householdQty: 2,
  gramsPerHousehold: 15,
};

const base = {
  mode: "professional",
  product: { batchYield: 10, monthlyTarget: 100 },
  ingredients: [ingredient],
  costs: { labor: 10000, packaging: 5000, utilities: 0, overhead: 0, depreciation: 0, wastePercent: 10 },
  pricing: { marginPercent: 20, currentPrice: 0 },
};

const professional = HppEngine.calculate(base);
assert.equal(professional.ingredients, 5000);
assert.equal(professional.waste, 500);
assert.equal(professional.extras, 15000);
assert.equal(professional.batch, 20500);
assert.equal(professional.perUnit, 2050);
assert.equal(professional.recommendedPrice, 2562.5);

const easy = HppEngine.calculate({ ...base, mode: "easy" });
assert.equal(easy.extras, 0, "Mode Mudah tidak menghitung biaya profesional yang tersembunyi");
assert.equal(easy.waste, 0);
assert.equal(easy.perUnit, 500);

const simulation = HppEngine.calculate({ ...base, mode: "simulation" });
assert.equal(simulation.extras, 15000);
assert.equal(simulation.waste, 0);
assert.equal(simulation.monthlyCapital, 200000);
assert.equal(simulation.scenarios.length, 3);

const estimate = HppEngine.calculate({ ...base, mode: "estimate" });
assert.equal(estimate.ingredients, 600);
assert.equal(estimate.extras, 0);
assert.equal(estimate.perUnit, 60);

assert.equal(HppEngine.convert(1, "kg", "g"), 1000);
assert.equal(HppEngine.convert(1, "l", "ml"), 1000);
assert.equal(HppEngine.convert(1, "kg", "ml"), null);
assert.equal(HppEngine.baseUnitForPurchase("kg"), "g");
assert.equal(HppEngine.baseUnitForPurchase("g"), "g");
assert.equal(HppEngine.baseUnitForPurchase("l"), "ml");
assert.equal(HppEngine.baseUnitForPurchase("ml"), "ml");
assert.equal(HppEngine.baseUnitForPurchase("pcs"), "pcs");

const mismatchedSavedUnit = HppEngine.ingredientCost({
  purchasePrice: 20000,
  purchaseQty: 1,
  purchaseUnit: "kg",
  usedQty: 250,
  usedUnit: "ml",
}, "easy");
assert.equal(mismatchedSavedUnit.cost, 5000, "Mesin menormalkan pemakaian kg menjadi gram");

console.log("Semua pengujian mesin HPP lulus.");
