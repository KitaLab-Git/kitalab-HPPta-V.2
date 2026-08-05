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

  const calculate = (state) => {
    const ingredientResults = (state.ingredients || []).map((item) => ingredientCost(item, state.mode));
    const ingredients = ingredientResults.reduce((sum, item) => sum + item.cost, 0);
    const waste = state.mode === "professional" ? ingredients * Math.min(number(state.costs?.wastePercent), 100) / 100 : 0;
    const operationalKeys = ["labor", "packaging", "utilities", "overhead"];
    const extraKeys = state.mode === "professional"
      ? [...operationalKeys, "depreciation"]
      : ["easy", "simulation"].includes(state.mode) ? operationalKeys : [];
    const extras = extraKeys
      .reduce((sum, key) => sum + number(state.costs?.[key]), 0);
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

  root.HppEngine = { calculate, convert, ingredientCost };
})(typeof window !== "undefined" ? window : globalThis);
