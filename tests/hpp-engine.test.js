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
assert.equal(professional.extras, 0);
assert.equal(professional.batch, 5500);
assert.equal(professional.perUnit, 550);
assert.equal(professional.recommendedPrice, 687.5);

const easy = HppEngine.calculate({ ...base, mode: "easy" });
assert.equal(easy.extras, 0);
assert.equal(easy.waste, 0);
assert.equal(easy.perUnit, 500);

const easyWithoutOperations = HppEngine.calculate({ ...base, mode: "easy", costs: {} });
assert.equal(easyWithoutOperations.extras, 0, "Biaya operasional boleh dikosongkan");
assert.equal(easyWithoutOperations.perUnit, 500);

const simulation = HppEngine.calculate({ ...base, mode: "simulation" });
assert.equal(simulation.extras, 0);
assert.equal(simulation.waste, 0);
assert.equal(simulation.monthlyCapital, 50000);
assert.equal(simulation.scenarios.length, 3);

const estimate = HppEngine.calculate({ ...base, mode: "estimate" });
assert.equal(estimate.ingredients, 600);
assert.equal(estimate.extras, 0);
assert.equal(estimate.perUnit, 60);

assert.equal(HppEngine.convert(1, "kg", "g"), 1000);
assert.equal(HppEngine.convert(1, "l", "ml"), 1000);
assert.equal(HppEngine.convert(1, "kg", "ml"), null);
assert.equal(HppEngine.sellingPrice(10000, 20, "profit"), 12000);
assert.equal(HppEngine.sellingPrice(10000, 20, "revenue"), 12500);
assert.equal(HppEngine.sellingPrice(10000, 9999, "profit"), 1009900);
assert.equal(HppEngine.sellingPrice(10000, 100, "revenue"), null);

assert.equal(HppEngine.ingredientCost({
  purchasePrice: 35000,
  purchaseQty: 350,
  purchaseUnit: "ml",
  usedQty: 80,
  usedUnit: "ml",
}, "easy").cost, 8000);

assert.ok(Math.abs(HppEngine.ingredientCost({
  purchasePrice: 17000,
  purchaseQty: 550,
  purchaseUnit: "g",
  usedQty: 15,
  usedUnit: "g",
}, "easy").cost - 463.6363636363636) < 0.0001);

assert.equal(HppEngine.packagingCost({ purchasePrice: 80000, purchaseQty: 100, usedQty: 10, packingCost: 200, packingCostUnit: "piece" }), 10000);
assert.equal(HppEngine.packagingCost({ purchasePrice: 80000, purchaseQty: 100, usedQty: 10, packingCost: 2000, packingCostUnit: "production" }), 10000);
assert.equal(HppEngine.laborCost({ workerCount: 2, costPerWorker: 1500000, period: "month", productionsPerPeriod: 100 }), 30000);
assert.equal(HppEngine.laborCost({ workerCount: 2, costPerWorker: 1500000, period: "month", productionsPerPeriod: 20, productionUnit: "day" }), 5000);
assert.equal(HppEngine.laborCost({ workerCount: 2, costPerWorker: 50000, period: "production" }), 100000);
assert.equal(HppEngine.laborCost({ workerCount: 2, costPerWorker: 1500000, period: "month", productionsPerPeriod: 0 }), 0);
assert.equal(HppEngine.gasCost({ method: "usage", cylinderPrice: 25000, lifespan: 20, lifespanUnit: "hour", usagePerProduction: 2, usageUnit: "hour" }), 2500);
assert.equal(HppEngine.gasCost({ method: "usage", cylinderPrice: 24000, lifespan: 4, lifespanUnit: "day", usagePerProduction: 8, usageUnit: "hour" }), 2000);
assert.equal(HppEngine.electricityCost({ cost: 600000, duration: 1, durationUnit: "month", productionCount: 100, productionUnit: "month" }), 6000);
assert.equal(HppEngine.electricityCost({ cost: 70000, duration: 1, durationUnit: "week", productionCount: 10, productionUnit: "day" }), 1000);
assert.equal(HppEngine.waterCost({ method: "allocation", billAmount: 300000, productionsPerPeriod: 100 }), 3000);
assert.equal(HppEngine.waterCost({ method: "allocation", billAmount: 300000, period: "month", productionsPerPeriod: 10, productionUnit: "day" }), 1000);
assert.equal(HppEngine.otherCost({ amount: 70000, amountUnit: "week", productionCount: 10, productionUnit: "day" }), 1000);

const complete = HppEngine.calculate({
  mode: "easy",
  product: { batchYield: 10 },
  ingredients: [ingredient],
  packaging: { items: [{ purchasePrice: 80000, purchaseQty: 100, usedQty: 10, packingCost: 200, packingCostUnit: "piece" }] },
  operations: {
    labor: { workerCount: 2, costPerWorker: 1500000, period: "month", productionsPerPeriod: 100 },
    gas: { method: "usage", cylinderPrice: 25000, lifespan: 20, lifespanUnit: "hour", usagePerProduction: 2, usageUnit: "hour" },
    electricity: { cost: 600000, duration: 1, durationUnit: "month", productionCount: 100, productionUnit: "month" },
    water: { method: "allocation", billAmount: 300000, productionsPerPeriod: 100 },
    otherItems: [{ name: "Transport", amount: 1000 }],
  },
  costs: {},
  pricing: {},
});
assert.equal(complete.ingredients, 5000);
assert.equal(complete.packaging, 10000);
assert.equal(complete.operations, 42500);
assert.equal(complete.batch, 57500);
assert.equal(complete.perUnit, 5750);

console.log("Semua pengujian mesin HPP lulus.");
