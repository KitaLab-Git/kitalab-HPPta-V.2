(function () {
  "use strict";

  const STORAGE_KEY = "hppta-v2-calculator";
  const byId = (id) => document.getElementById(id);
  const digits = (value) => Number(String(value || "").replace(/\D/g, "")) || 0;
  const rupiah = (value) => `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`;
  const rupiahInput = (value) => value ? Number(value).toLocaleString("id-ID") : "";

  const defaultIngredient = () => ({ id: Date.now() + Math.random(), name: "", purchasePrice: 0, purchaseQty: 0, purchaseUnit: "g", usedQty: 0, usedUnit: "g" });
  const defaultPackaging = () => ({ id: Date.now() + Math.random(), name: "", purchasePrice: 0, purchaseQty: 0, usedQty: 0, packingCost: 0, packingCostUnit: "production" });
  const defaultOtherOperation = () => ({ id: Date.now() + Math.random(), name: "", amount: 0, amountUnit: "production", productionCount: 0, productionUnit: "month" });
  const defaultState = () => ({
    version: 6,
    mode: "easy",
    product: { name: "", batchYield: 1, yieldUnit: "produk", monthlyTarget: 0 },
    ingredients: [defaultIngredient()],
    packaging: { items: [] },
    operations: {
      labor: { workerCount: 0, costPerWorker: 0, period: "production", productionsPerPeriod: 0, productionUnit: "month" },
      gas: { method: "direct", directCost: 0, cylinderPrice: 0, lifespan: 0, lifespanUnit: "hour", usagePerProduction: 0, usageUnit: "hour" },
      electricity: { cost: 0, duration: 1, durationUnit: "month", productionCount: 0, productionUnit: "month" },
      water: { method: "direct", directCost: 0, billAmount: 0, period: "month", productionsPerPeriod: 0, productionUnit: "month" },
      otherItems: [],
    },
    costs: {},
    pricing: { margin: 0 },
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
      if (saved.pricing) state.pricing = { ...state.pricing, ...saved.pricing };
      if (Number(saved.version) >= 3) {
        const savedPackaging = Array.isArray(saved.packaging?.items) ? saved.packaging.items : [];
        state.packaging.items = savedPackaging.map((item) => ({ ...defaultPackaging(), ...item }));
        if (Number(saved.version) === 3 && Number(saved.packaging?.additionalCost) > 0) {
          state.packaging.items.push({ ...defaultPackaging(), name: "Biaya packaging tambahan", packingCost: Number(saved.packaging.additionalCost), packingCostUnit: "production" });
        }
        state.operations = {
          ...state.operations,
          ...(saved.operations || {}),
          labor: { ...state.operations.labor, ...(saved.operations?.labor || {}) },
          gas: { ...state.operations.gas, ...(saved.operations?.gas || {}) },
          water: { ...state.operations.water, ...(saved.operations?.water || {}) },
        };
        if (!saved.operations?.labor?.productionUnit) state.operations.labor.productionUnit = saved.operations?.labor?.period === "production" ? "month" : (saved.operations?.labor?.period || "month");
        if (!saved.operations?.water?.productionUnit) state.operations.water.productionUnit = saved.operations?.water?.period || "month";
        if (Number(saved.version) >= 4) {
          state.operations.electricity = { ...state.operations.electricity, ...(saved.operations?.electricity || {}) };
          state.operations.otherItems = Array.isArray(saved.operations?.otherItems) ? saved.operations.otherItems.map((item) => ({ ...defaultOtherOperation(), ...item })) : [];
        } else {
          const oldElectricity = saved.operations?.electricity || {};
          if (oldElectricity.method === "allocation") {
            state.operations.electricity.cost = Number(oldElectricity.billAmount) || 0;
            state.operations.electricity.duration = 1;
            state.operations.electricity.durationUnit = oldElectricity.period || "month";
            state.operations.electricity.productionCount = Number(oldElectricity.hoursPerProduction) > 0 ? (Number(oldElectricity.totalUsageHours) || 0) / Number(oldElectricity.hoursPerProduction) : 0;
            state.operations.electricity.productionUnit = oldElectricity.period || "month";
          } else {
            state.operations.electricity.cost = Number(oldElectricity.directCost) || 0;
            state.operations.electricity.duration = 1;
            state.operations.electricity.durationUnit = "day";
            state.operations.electricity.productionCount = state.operations.electricity.cost ? 1 : 0;
            state.operations.electricity.productionUnit = "day";
          }
          if (Number(saved.operations?.other) > 0) state.operations.otherItems = [{ ...defaultOtherOperation(), name: "Biaya lainnya", amount: Number(saved.operations.other) }];
        }
      } else if (Number(saved.version) >= 2 && saved.costs) {
        if (Number(saved.costs.packaging) > 0) state.packaging.items = [{ ...defaultPackaging(), name: "Biaya packaging tambahan", packingCost: Number(saved.costs.packaging), packingCostUnit: "production" }];
        state.operations.labor.costPerWorker = Number(saved.costs.labor) || 0;
        state.operations.labor.workerCount = state.operations.labor.costPerWorker ? 1 : 0;
        const oldOther = (Number(saved.costs.utilities) || 0) + (Number(saved.costs.overhead) || 0);
        if (oldOther > 0) state.operations.otherItems = [{ ...defaultOtherOperation(), name: "Biaya lainnya", amount: oldOther }];
      }
    }
  } catch (_) {}

  const ingredientList = byId("ingredient-list");
  const ingredientTemplate = byId("ingredient-template");
  const emptyIngredients = byId("empty-ingredients");
  const packagingList = byId("packaging-list");
  const packagingTemplate = byId("packaging-template");
  const emptyPackaging = byId("empty-packaging");
  const otherOperationList = byId("other-operation-list");
  const otherOperationTemplate = byId("other-operation-template");
  const emptyOtherOperations = byId("empty-other-operations");
  const productName = byId("product-name");
  const batchYield = byId("batch-yield");
  const marginSlider = byId("margin-slider");
  const marginInput = byId("margin-input");

  const fieldBindings = [
    ["labor-worker-count", "operations.labor.workerCount", "number"],
    ["labor-cost-per-worker", "operations.labor.costPerWorker", "currency"],
    ["labor-period", "operations.labor.period", "select"],
    ["labor-productions-per-period", "operations.labor.productionsPerPeriod", "number"],
    ["labor-production-unit", "operations.labor.productionUnit", "select"],
    ["gas-method", "operations.gas.method", "select"],
    ["gas-direct-cost", "operations.gas.directCost", "currency"],
    ["gas-cylinder-price", "operations.gas.cylinderPrice", "currency"],
    ["gas-lifespan", "operations.gas.lifespan", "number"],
    ["gas-lifespan-unit", "operations.gas.lifespanUnit", "select"],
    ["gas-usage-production", "operations.gas.usagePerProduction", "number"],
    ["gas-usage-unit", "operations.gas.usageUnit", "select"],
    ["electricity-cost", "operations.electricity.cost", "currency"],
    ["electricity-duration", "operations.electricity.duration", "number"],
    ["electricity-duration-unit", "operations.electricity.durationUnit", "select"],
    ["electricity-production-count", "operations.electricity.productionCount", "number"],
    ["electricity-production-unit", "operations.electricity.productionUnit", "select"],
    ["water-method", "operations.water.method", "select"],
    ["water-direct-cost", "operations.water.directCost", "currency"],
    ["water-bill", "operations.water.billAmount", "currency"],
    ["water-period", "operations.water.period", "select"],
    ["water-productions-period", "operations.water.productionsPerPeriod", "number"],
    ["water-production-unit", "operations.water.productionUnit", "select"],
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
    document.querySelectorAll("[data-water-panel]").forEach((panel) => panel.hidden = panel.dataset.waterPanel !== state.operations.water.method);
  }

  function syncInputs() {
    productName.value = state.product.name || "";
    batchYield.value = state.product.batchYield > 0 ? state.product.batchYield : "";
    const margin = Math.min(9999, Math.max(0, Number(state.pricing.margin) || 0));
    state.pricing.margin = margin;
    marginInput.value = margin;
    marginSlider.value = Math.min(50, margin);
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
    const margin = Math.min(9999, Math.max(0, Number(state.pricing.margin) || 0));
    byId("margin-value-label").textContent = `${margin.toLocaleString("id-ID")}%`;
    byId("selling-price").textContent = rupiah(result.perUnit * (1 + margin / 100));
    byId("labor-result").textContent = rupiah(result.operationalBreakdown.labor);
    byId("gas-result").textContent = rupiah(result.operationalBreakdown.gas);
    byId("electricity-result").textContent = rupiah(result.operationalBreakdown.electricity);
    byId("water-result").textContent = rupiah(result.operationalBreakdown.water);
    byId("other-result").textContent = rupiah(result.operationalBreakdown.other);
    byId("summary-help").textContent = result.perUnit
      ? `Total produksi ${rupiah(result.batch)} dibagi ${state.product.batchYield} produk${state.product.name ? ` ${state.product.name}` : ""}.`
      : "Isi produk, jumlah jadi, dan resep untuk melihat HPP per produk.";
  }

  function bindRowFields(row, item, selector, datasetName, currencyKeys = []) {
    row.querySelectorAll(selector).forEach((input) => {
      const key = input.dataset[datasetName];
      input.value = currencyKeys.includes(key) ? rupiahInput(item[key]) : (item[key] ?? "");
      const update = () => {
        item[key] = currencyKeys.includes(key) ? digits(input.value) : (input.type === "number" ? Number(input.value) || 0 : input.value);
        if (currencyKeys.includes(key)) input.value = rupiahInput(item[key]);
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
      bindRowFields(row, ingredient, "[data-field]", "field", ["purchasePrice"]);
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
      bindRowFields(row, packaging, "[data-packaging-field]", "packagingField", ["purchasePrice", "packingCost"]);
      row.querySelector(".remove-packaging").addEventListener("click", () => {
        state.packaging.items = state.packaging.items.filter((item) => item.id !== packaging.id);
        save(); renderPackaging(); calculate();
      });
      packagingList.appendChild(fragment);
    });
  }

  function renderOtherOperations() {
    otherOperationList.innerHTML = "";
    emptyOtherOperations.hidden = state.operations.otherItems.length > 0;
    state.operations.otherItems.forEach((operation) => {
      const fragment = otherOperationTemplate.content.cloneNode(true);
      const row = fragment.querySelector(".other-operation-row");
      bindRowFields(row, operation, "[data-other-field]", "otherField", ["amount"]);
      const syncOtherRow = () => row.querySelector("[data-other-production-field]").hidden = operation.amountUnit === "production";
      row.querySelector('[data-other-field="amountUnit"]').addEventListener("change", syncOtherRow);
      syncOtherRow();
      row.querySelector(".remove-other-operation").addEventListener("click", () => {
        state.operations.otherItems = state.operations.otherItems.filter((item) => item.id !== operation.id);
        save(); renderOtherOperations(); calculate();
      });
      otherOperationList.appendChild(fragment);
    });
  }

  productName.addEventListener("input", () => { state.product.name = productName.value; save(); calculate(); });
  batchYield.addEventListener("input", () => { state.product.batchYield = Number(batchYield.value) || 0; save(); calculate(); });
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
  byId("add-other-operation").addEventListener("click", () => { state.operations.otherItems.push(defaultOtherOperation()); save(); renderOtherOperations(); calculate(); });
  marginSlider.addEventListener("input", () => {
    state.pricing.margin = Number(marginSlider.value) || 0;
    marginInput.value = state.pricing.margin;
    save(); calculate();
  });
  const updateMarginInput = () => {
    const margin = Math.min(9999, Math.max(0, Number(marginInput.value) || 0));
    state.pricing.margin = margin;
    marginInput.value = margin;
    marginSlider.value = Math.min(50, margin);
    save(); calculate();
  };
  marginInput.addEventListener("input", updateMarginInput);
  marginInput.addEventListener("change", updateMarginInput);
  byId("reset-calculator").addEventListener("click", () => {
    if (!confirm("Hapus seluruh data perhitungan dan mulai ulang?")) return;
    state = defaultState();
    save(); syncInputs(); renderIngredients(); renderPackaging(); renderOtherOperations(); calculate();
  });

  document.body.dataset.mode = "easy";
  syncInputs();
  renderIngredients();
  renderPackaging();
  renderOtherOperations();
  calculate();
  save();
})();
