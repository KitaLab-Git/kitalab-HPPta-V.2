(function (root) {
  "use strict";

  const units = {
    g: { family: "mass", factor: 1 },
    kg: { family: "mass", factor: 1000 },
    ml: { family: "volume", factor: 1 },
    l: { family: "volume", factor: 1000 },
    pcs: { family: "count", factor: 1 },
  };

  const number = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  };

  const convert = (quantity, fromUnit, toUnit) => {
    const from = units[fromUnit];
    const to = units[toUnit];
    if (!from || !to || from.family !== to.family) return null;
    return number(quantity) * from.factor / to.factor;
  };

  const ingredientCost = (ingredient, mode) => {
    const purchasePrice = number(ingredient.purchasePrice);
    const purchaseQty = number(ingredient.purchaseQty);
    if (!purchasePrice || !purchaseQty) return { cost: 0, compatible: true, usedInPurchaseUnit: 0 };

    let usedQty = number(ingredient.usedQty);
    let usedUnit = ingredient.usedUnit || "g";

    if (mode === "estimate" || mode === "idea") {
      usedQty = number(ingredient.householdQty) * number(ingredient.gramsPerHousehold);
      const purchaseFamily = units[ingredient.purchaseUnit]?.family;
      usedUnit = purchaseFamily === "volume" ? "ml" : purchaseFamily === "count" ? "pcs" : "g";
    }

    const converted = convert(usedQty, usedUnit, ingredient.purchaseUnit || "g");
    if (converted === null) return { cost: 0, compatible: false, usedInPurchaseUnit: 0 };
    return { cost: purchasePrice * converted / purchaseQty, compatible: true, usedInPurchaseUnit: converted };
  };

  const packagingCost = (item) => {
    const purchasePrice = number(item.purchasePrice);
    const purchaseQty = number(item.purchaseQty);
    const usedQty = number(item.usedQty);
    const material = purchasePrice && purchaseQty && usedQty ? purchasePrice * usedQty / purchaseQty : 0;
    const packing = item.packingCostUnit === "piece"
      ? number(item.packingCost) * usedQty
      : number(item.packingCost);
    return material + packing;
  };

  const laborCost = (labor = {}) => {
    const total = number(labor.workerCount) * number(labor.costPerWorker);
    if (!total) return 0;
    if (labor.period === "production") return total;
    const productions = number(labor.productionsPerPeriod);
    return productions ? total / productions : 0;
  };

  const durationInHours = (value, unit) => {
    const factors = { hour: 1, day: 24, week: 168, month: 720 };
    return number(value) * (factors[unit] || 1);
  };

  const gasCost = (gas = {}) => {
    if (gas.method !== "usage") return number(gas.directCost);
    const lifespan = durationInHours(gas.lifespan, gas.lifespanUnit);
    const usage = durationInHours(gas.usagePerProduction, gas.usageUnit);
    return lifespan ? number(gas.cylinderPrice) * usage / lifespan : 0;
  };

  const electricityCost = (electricity = {}) => {
    const coveredHours = durationInHours(electricity.duration, electricity.durationUnit);
    const productionUnitHours = durationInHours(1, electricity.productionUnit);
    const productions = productionUnitHours
      ? number(electricity.productionCount) * coveredHours / productionUnitHours
      : 0;
    return productions ? number(electricity.cost) / productions : 0;
  };

  const waterCost = (water = {}) => {
    if (water.method !== "allocation") return number(water.directCost);
    const productions = number(water.productionsPerPeriod);
    return productions ? number(water.billAmount) / productions : 0;
  };

  const operationalCosts = (operations = {}) => {
    const otherItems = Array.isArray(operations.otherItems) ? operations.otherItems : [];
    const breakdown = {
      labor: laborCost(operations.labor),
      gas: gasCost(operations.gas),
      electricity: electricityCost(operations.electricity),
      water: waterCost(operations.water),
      other: otherItems.length
        ? otherItems.reduce((sum, item) => sum + number(item.amount), 0)
        : number(operations.other),
    };
    return { ...breakdown, total: Object.values(breakdown).reduce((sum, value) => sum + value, 0) };
  };

  const calculate = (state) => {
    const ingredientResults = (state.ingredients || []).map((item) => ingredientCost(item, state.mode));
    const ingredients = ingredientResults.reduce((sum, item) => sum + item.cost, 0);
    const packagingResults = (state.packaging?.items || []).map((item) => packagingCost(item));
    const packaging = packagingResults.reduce((sum, value) => sum + value, 0) + number(state.packaging?.additionalCost);
    const operationalBreakdown = operationalCosts(state.operations);
    const operations = operationalBreakdown.total;
    const waste = state.mode === "professional" ? ingredients * Math.min(number(state.costs?.wastePercent), 100) / 100 : 0;
    const legacyExtras = state.mode === "professional" ? number(state.costs?.depreciation) : 0;
    const extras = packaging + operations + legacyExtras;
    const batch = ingredients + waste + extras;
    const batchYield = number(state.product?.batchYield);
    const perUnit = batchYield ? batch / batchYield : 0;
    const margin = Math.min(number(state.pricing?.marginPercent), 95);
    const recommendedPrice = perUnit && margin < 100 ? perUnit / (1 - margin / 100) : 0;
    const currentPrice = number(state.pricing?.currentPrice);
    const currentMargin = currentPrice ? ((currentPrice - perUnit) / currentPrice) * 100 : 0;
    const monthlyTarget = number(state.product?.monthlyTarget);
    const batchesPerMonth = batchYield ? monthlyTarget / batchYield : 0;

    return {
      ingredientResults,
      ingredients,
      packagingResults,
      packaging,
      operationalBreakdown,
      operations,
      waste,
      extras,
      batch,
      perUnit,
      recommendedPrice,
      currentMargin,
      monthlyCapital: batch * batchesPerMonth,
      scenarios: [20, 30, 40].map((value) => ({ margin: value, price: perUnit ? perUnit / (1 - value / 100) : 0 })),
    };
  };

  root.HppEngine = { calculate, convert, ingredientCost, packagingCost, laborCost, gasCost, electricityCost, waterCost, operationalCosts };
})(typeof window !== "undefined" ? window : globalThis);
