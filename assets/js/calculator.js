(function () {
  "use strict";

  const STORAGE_KEY = "hppta-v2-calculator";
  const byId = (id) => document.getElementById(id);
  const digits = (value) => Number(String(value || "").replace(/\D/g, "")) || 0;
  const rupiah = (value) => `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`;
  const rupiahInput = (value) => value ? Number(value).toLocaleString("id-ID") : "";

  const defaultIngredient = () => ({ id: Date.now() + Math.random(), name: "", purchasePrice: 0, purchaseQty: 0, purchaseUnit: "g", usedQty: 0, usedUnit: "g" });
  const defaultPackaging = () => ({ id: Date.now() + Math.random(), name: "", purchasePrice: 0, purchaseQty: 0, usedQty: 0 });
  const defaultState = () => ({
    version: 3,
    mode: "easy",
    product: { name: "", batchYield: 1, yieldUnit: "produk", monthlyTarget: 0 },
    ingredients: [defaultIngredient()],
    packaging: { items: [], additionalCost: 0 },
    operations: {
      labor: { workerCount: 0, costPerWorker: 0, period: "production", productionsPerPeriod: 0 },
      gas: { method: "direct", directCost: 0, cylinderPrice: 0, lifespan: 0, lifespanUnit: "hour", usagePerProduction: 0, usageUnit: "hour" },
      electricity: { method: "direct", directCost: 0, billAmount: 0, period: "month", totalUsageHours: 0, hoursPerProduction: 0 },
      water: { method: "direct", directCost: 0, billAmount: 0, period: "month", productionsPerPeriod: 0 },
      other: 0,
    },
    costs: {},
    pricing: {},
  });

  const getPath = (object, path) => path.split(".").reduce((value, key) => value?.[key], object);
  const setPath = (object, path, value) => {
    const keys = path.split(".");
    const last = keys.pop();
    const target = keys.reduce((current, key) => current[key], object);
    target[last] = value;
  };

  let state = defaultState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved) {
      if (Array.isArray(saved.ingredients)) state.ingredients = saved.ingredients;
      if (saved.product) state.product = { ...state.product, ...saved.product };
      if (Number(saved.version) >= 3) {
        state.packaging = { ...state.packaging, ...(saved.packaging || {}), items: Array.isArray(saved.packaging?.items) ? saved.packaging.items : [] };
        state.operations = {
          ...state.operations,
          ...(saved.operations || {}),
          labor: { ...state.operations.labor, ...(saved.operations?.labor || {}) },
          gas: { ...state.operations.gas, ...(saved.operations?.gas || {}) },
          electricity: { ...state.operations.electricity, ...(saved.operations?.electricity || {}) },
          water: { ...state.operations.water, ...(saved.operations?.water || {}) },
        };
      } else if (Number(saved.version) >= 2 && saved.costs) {
        state.packaging.additionalCost = Number(saved.costs.packaging) || 0;
        state.operations.labor.costPerWorker = Number(saved.costs.labor) || 0;
        state.operations.labor.workerCount = state.operations.labor.costPerWorker ? 1 : 0;
        state.operations.other = (Number(saved.costs.utilities) || 0) + (Number(saved.costs.overhead) || 0);
      }
    }
  } catch (_) {}

  const ingredientList = byId("ingredient-list");
  const ingredientTemplate = byId("ingredient-template");
  const emptyIngredients = byId("empty-ingredients");
  const packagingList = byId("packaging-list");
  const packagingTemplate = byId("packaging-template");
  const emptyPackaging = byId("empty-packaging");
  const productName = byId("product-name");
  const batchYield = byId("batch-yield");

  const fieldBindings = [
    ["labor-worker-count", "operations.labor.workerCount", "number"],
    ["labor-cost-per-worker", "operations.labor.costPerWorker", "currency"],
    ["labor-period", "operations.labor.period", "select"],
    ["labor-productions-per-period", "operations.labor.productionsPerPeriod", "number"],
    ["gas-method", "operations.gas.method", "select"],
    ["gas-direct-cost", "operations.gas.directCost", "currency"],
    ["gas-cylinder-price", "operations.gas.cylinderPrice", "currency"],
    ["gas-lifespan", "operations.gas.lifespan", "number"],
    ["gas-lifespan-unit", "operations.gas.lifespanUnit", "select"],
    ["gas-usage-production", "operations.gas.usagePerProduction", "number"],
    ["gas-usage-unit", "operations.gas.usageUnit", "select"],
    ["electricity-method", "operations.electricity.method", "select"],
    ["electricity-direct-cost", "operations.electricity.directCost", "currency"],
    ["electricity-bill", "operations.electricity.billAmount", "currency"],
    ["electricity-period", "operations.electricity.period", "select"],
    ["electricity-total-hours", "operations.electricity.totalUsageHours", "number"],
    ["electricity-hours-production", "operations.electricity.hoursPerProduction", "number"],
    ["water-method", "operations.water.method", "select"],
    ["water-direct-cost", "operations.water.directCost", "currency"],
    ["water-bill", "operations.water.billAmount", "currency"],
    ["water-period", "operations.water.period", "select"],
    ["water-productions-period", "operations.water.productionsPerPeriod", "number"],
    ["other-operation-cost", "operations.other", "currency"],
  ];

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const status = byId("save-status");
    status.classList.add("saved");
    setTimeout(() => status.classList.remove("saved"), 500);
  }

  function syncPanels() {
    byId("labor-production-field").hidden = state.operations.labor.period === "production";
    document.querySelectorAll("[data-gas-panel]").forEach((panel) => panel.hidden = panel.dataset.gasPanel !== state.operations.gas.method);
    document.querySelectorAll("[data-electricity-panel]").forEach((panel) => panel.hidden = panel.dataset.electricityPanel !== state.operations.electricity.method);
    document.querySelectorAll("[data-water-panel]").forEach((panel) => panel.hidden = panel.dataset.waterPanel !== state.operations.water.method);
  }

  function syncInputs() {
    productName.value = state.product.name || "";
    batchYield.value = state.product.batchYield > 0 ? state.product.batchYield : "";
    byId("additional-packaging-cost").value = rupiahInput(state.packaging.additionalCost);
    fieldBindings.forEach(([id, path, type]) => {
      const element = byId(id);
      const value = getPath(state, path);
      element.value = type === "currency" ? rupiahInput(value) : (value ?? "");
    });
    syncPanels();
  }

  function calculate() {
    const result = HppEngine.calculate(state);
    result.ingredientResults.forEach((item, index) => {
      const row = ingredientList.children[index];
      if (!row) return;
      row.querySelector("[data-cost]").textContent = rupiah(item.cost);
      row.querySelector("[data-warning]").hidden = item.compatible;
    });
    result.packagingResults.forEach((cost, index) => {
      const row = packagingList.children[index];
      if (row) row.querySelector("[data-packaging-cost]").textContent = rupiah(cost);
    });
    byId("total-ingredients").textContent = rupiah(result.ingredients);
    byId("total-packaging").textContent = rupiah(result.packaging);
    byId("total-operations").textContent = rupiah(result.operations);
    byId("total-batch").textContent = rupiah(result.batch);
    byId("hpp-per-unit").textContent = rupiah(result.perUnit);
    byId("labor-result").textContent = rupiah(result.operationalBreakdown.labor);
    byId("gas-result").textContent = rupiah(result.operationalBreakdown.gas);
    byId("electricity-result").textContent = rupiah(result.operationalBreakdown.electricity);
    byId("water-result").textContent = rupiah(result.operationalBreakdown.water);
    byId("other-result").textContent = rupiah(result.operationalBreakdown.other);
    byId("summary-help").textContent = result.perUnit
      ? `Total produksi ${rupiah(result.batch)} dibagi ${state.product.batchYield} produk${state.product.name ? ` ${state.product.name}` : ""}.`
      : "Isi produk, jumlah jadi, dan resep untuk melihat HPP per produk.";
  }

  function bindRowFields(row, item, selector, priceKey) {
    row.querySelectorAll(selector).forEach((input) => {
      const key = selector === "[data-field]" ? input.dataset.field : input.dataset.packagingField;
      input.value = key === priceKey ? rupiahInput(item[key]) : (item[key] ?? "");
      const update = () => {
        item[key] = key === priceKey ? digits(input.value) : (input.type === "number" ? Number(input.value) || 0 : input.value);
        if (key === priceKey) input.value = rupiahInput(item[key]);
        save();
        calculate();
      };
      input.addEventListener("input", update);
      input.addEventListener("change", update);
    });
  }

  function renderIngredients() {
    ingredientList.innerHTML = "";
    emptyIngredients.hidden = state.ingredients.length > 0;
    state.ingredients.forEach((ingredient) => {
      const fragment = ingredientTemplate.content.cloneNode(true);
      const row = fragment.querySelector(".ingredient-row");
      bindRowFields(row, ingredient, "[data-field]", "purchasePrice");
      row.querySelector(".remove-ingredient").addEventListener("click", () => {
        state.ingredients = state.ingredients.filter((item) => item.id !== ingredient.id);
        save(); renderIngredients(); calculate();
      });
      ingredientList.appendChild(fragment);
    });
  }

  function renderPackaging() {
    packagingList.innerHTML = "";
    emptyPackaging.hidden = state.packaging.items.length > 0;
    state.packaging.items.forEach((packaging) => {
      const fragment = packagingTemplate.content.cloneNode(true);
      const row = fragment.querySelector(".packaging-row");
      bindRowFields(row, packaging, "[data-packaging-field]", "purchasePrice");
      row.querySelector(".remove-packaging").addEventListener("click", () => {
        state.packaging.items = state.packaging.items.filter((item) => item.id !== packaging.id);
        save(); renderPackaging(); calculate();
      });
      packagingList.appendChild(fragment);
    });
  }

  productName.addEventListener("input", () => { state.product.name = productName.value; save(); calculate(); });
  batchYield.addEventListener("input", () => { state.product.batchYield = Number(batchYield.value) || 0; save(); calculate(); });
  byId("additional-packaging-cost").addEventListener("input", (event) => {
    state.packaging.additionalCost = digits(event.target.value);
    event.target.value = rupiahInput(state.packaging.additionalCost);
    save(); calculate();
  });

  fieldBindings.forEach(([id, path, type]) => {
    const element = byId(id);
    const eventName = type === "select" ? "change" : "input";
    element.addEventListener(eventName, () => {
      const value = type === "currency" ? digits(element.value) : type === "number" ? Number(element.value) || 0 : element.value;
      setPath(state, path, value);
      if (type === "currency") element.value = rupiahInput(value);
      if (type === "select") syncPanels();
      save(); calculate();
    });
  });

  byId("add-ingredient").addEventListener("click", () => { state.ingredients.push(defaultIngredient()); save(); renderIngredients(); calculate(); });
  byId("add-packaging").addEventListener("click", () => { state.packaging.items.push(defaultPackaging()); save(); renderPackaging(); calculate(); });
  byId("reset-calculator").addEventListener("click", () => {
    if (!confirm("Hapus seluruh data perhitungan dan mulai ulang?")) return;
    state = defaultState();
    save(); syncInputs(); renderIngredients(); renderPackaging(); calculate();
  });

  document.body.dataset.mode = "easy";
  syncInputs();
  renderIngredients();
  renderPackaging();
  calculate();
  save();
})();
