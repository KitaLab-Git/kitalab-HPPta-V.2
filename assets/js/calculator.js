(function () {
  "use strict";

  const STORAGE_KEY = "hppta-v2-calculator";
  const modes = {
    easy: { eyebrow: "Mode HPP Mudah", title: "Mari hitung biaya produkmu.", description: "Masukkan bahan yang digunakan dalam satu kali produksi." },
    professional: { eyebrow: "Mode HPP Profesional", title: "Hitung setiap komponen dengan rinci.", description: "Bahan, waste, biaya produksi, margin, dan harga jual dalam satu perhitungan." },
    simulation: { eyebrow: "Mode Simulasi Usaha", title: "Uji biaya sebelum mulai berjualan.", description: "Buat skenario modal, target produksi, dan harga jual yang lebih terarah." },
    estimate: { eyebrow: "Mode Kalkulator Estimasi", title: "Mulai dari takaran yang kamu kenal.", description: "Gunakan sendok, gelas, atau butir sambil membangun takaran yang lebih pasti." },
    idea: { eyebrow: "Mode Generator Simulasi", title: "Ubah ide menjadi simulasi awal.", description: "Pilih template, sesuaikan asumsi, lalu lihat gambaran HPP pertamamu." },
  };

  const templates = {
    coffee: { name: "Kopi Susu", yield: 1, unit: "gelas", ingredients: [
      ["Kopi bubuk", 60000, 1000, "g", 2, "tbsp", 10], ["Susu", 20000, 1000, "ml", 1, "cup", 150], ["Gula", 18000, 1000, "g", 1, "tbsp", 15]
    ] },
    snack: { name: "Kentang Goreng", yield: 5, unit: "porsi", ingredients: [
      ["Kentang", 25000, 1000, "g", 5, "piece", 150], ["Minyak goreng", 20000, 1000, "ml", 1, "cup", 200], ["Bumbu", 10000, 100, "g", 2, "tbsp", 10]
    ] },
    cake: { name: "Bolu Sederhana", yield: 12, unit: "buah", ingredients: [
      ["Tepung", 14000, 1000, "g", 16, "tbsp", 15], ["Telur", 30000, 30, "pcs", 4, "piece", 1], ["Gula", 18000, 1000, "g", 10, "tbsp", 15]
    ] }
  };

  const defaultIngredient = () => ({ id: Date.now() + Math.random(), name: "", purchasePrice: 0, purchaseQty: 0, purchaseUnit: "g", usedQty: 0, usedUnit: "g", householdQty: 0, householdUnit: "tbsp", gramsPerHousehold: 15 });
  const defaultState = (mode, product) => ({ version: 1, mode, product: { name: product || "", batchYield: 1, yieldUnit: "porsi", monthlyTarget: 100 }, ingredients: [defaultIngredient()], costs: { labor: 0, packaging: 0, utilities: 0, overhead: 0, depreciation: 0, wastePercent: 0 }, pricing: { marginPercent: 30, currentPrice: 0 } });
  const byId = (id) => document.getElementById(id);
  const digits = (value) => Number(String(value || "").replace(/\D/g, "")) || 0;
  const rupiah = (value) => `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`;
  const rupiahInput = (value) => value ? Number(value).toLocaleString("id-ID") : "";
  const syncIngredientUnit = (ingredient) => {
    ingredient.usedUnit = HppEngine.baseUnitForPurchase(ingredient.purchaseUnit);
    return ingredient;
  };
  const deepMerge = (base, saved) => ({ ...base, ...saved, product: { ...base.product, ...(saved.product || {}) }, costs: { ...base.costs, ...(saved.costs || {}) }, pricing: { ...base.pricing, ...(saved.pricing || {}) }, ingredients: Array.isArray(saved.ingredients) ? saved.ingredients : base.ingredients });

  const initialMode = document.body.dataset.initialMode || "easy";
  const initialProduct = document.body.dataset.initialProduct || "";
  let state = defaultState(initialMode, initialProduct);
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved) state = deepMerge(state, saved);
  } catch (_) {}
  if (new URLSearchParams(location.search).has("mode")) state.mode = initialMode;
  if (initialProduct && !state.product.name) state.product.name = initialProduct;
  state.ingredients = state.ingredients.map(syncIngredientUnit);

  const refs = {
    productName: byId("product-name"), batchYield: byId("batch-yield"), yieldUnit: byId("yield-unit"), monthlyTarget: byId("monthly-target"),
    ingredientList: byId("ingredient-list"), template: byId("ingredient-template"), empty: byId("empty-ingredients"),
    labor: byId("labor-cost"), packaging: byId("packaging-cost"), utilities: byId("utilities-cost"), overhead: byId("overhead-cost"), depreciation: byId("depreciation-cost"), waste: byId("waste-percent"),
    margin: byId("margin-percent"), currentPrice: byId("current-price")
  };

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    byId("save-status").classList.add("saved");
    setTimeout(() => byId("save-status").classList.remove("saved"), 500);
  }

  function applyMode() {
    document.body.dataset.mode = state.mode;
    const copy = modes[state.mode];
    byId("mode-eyebrow").textContent = copy.eyebrow;
    byId("mode-title").textContent = copy.title;
    byId("mode-description").textContent = copy.description;
    byId("advanced-section").hidden = !["professional", "simulation"].includes(state.mode);
    byId("pricing-section").hidden = !["professional", "simulation"].includes(state.mode);
    byId("estimate-section").hidden = state.mode !== "estimate";
    byId("idea-section").hidden = state.mode !== "idea";
    byId("estimate-badge").hidden = !["estimate", "idea"].includes(state.mode);
    document.querySelectorAll(".simulation-only").forEach((el) => el.hidden = state.mode !== "simulation");
    document.querySelectorAll(".professional-only").forEach((el) => el.hidden = state.mode !== "professional");
    document.querySelectorAll('input[name="calculator-mode"]').forEach((input) => input.checked = input.value === state.mode);
    const notices = {
      estimate: "Hasil menggunakan konversi takaran perkiraan. Timbang bahan untuk meningkatkan ketepatan.",
      idea: "Template berisi asumsi contoh. Ganti resep dan harga dengan data usahamu sebelum mengambil keputusan.",
      simulation: "Angka ini merupakan simulasi usaha dan belum mencerminkan transaksi penjualan nyata."
    };
    const notice = byId("mode-notice");
    notice.hidden = !notices[state.mode];
    notice.textContent = notices[state.mode] || "";
    byId("ingredient-guidance").textContent = ["estimate", "idea"].includes(state.mode) ? "Gunakan takaran sehari-hari dan perkiraan isi setiap takaran." : "Tuliskan harga beli dan jumlah yang dipakai untuk satu batch.";
    renderIngredients();
    calculate();
  }

  function syncInputs() {
    refs.productName.value = state.product.name;
    refs.batchYield.value = state.product.batchYield || "";
    refs.yieldUnit.value = state.product.yieldUnit;
    refs.monthlyTarget.value = state.product.monthlyTarget || "";
    refs.labor.value = rupiahInput(state.costs.labor); refs.packaging.value = rupiahInput(state.costs.packaging); refs.utilities.value = rupiahInput(state.costs.utilities); refs.overhead.value = rupiahInput(state.costs.overhead); refs.depreciation.value = rupiahInput(state.costs.depreciation);
    refs.waste.value = state.costs.wastePercent; refs.margin.value = state.pricing.marginPercent; refs.currentPrice.value = rupiahInput(state.pricing.currentPrice);
  }

  function renderIngredients() {
    refs.ingredientList.innerHTML = "";
    refs.empty.hidden = state.ingredients.length > 0;
    state.ingredients.forEach((ingredient) => {
      const fragment = refs.template.content.cloneNode(true);
      const row = fragment.querySelector(".ingredient-row");
      row.dataset.id = ingredient.id;
      row.querySelectorAll("[data-field]").forEach((input) => {
        const key = input.dataset.field;
        input.value = key === "purchasePrice" ? rupiahInput(ingredient[key]) : (ingredient[key] ?? "");
        input.addEventListener("input", () => {
          ingredient[key] = key === "purchasePrice" ? digits(input.value) : (input.type === "number" ? Number(input.value) || 0 : input.value);
          if (key === "purchasePrice") input.value = rupiahInput(ingredient[key]);
          if (key === "purchaseUnit") {
            syncIngredientUnit(ingredient);
            const usageUnit = row.querySelector('[data-field="usedUnit"]');
            if (usageUnit) usageUnit.value = ingredient.usedUnit;
          }
          save(); calculate();
        });
        input.addEventListener("change", () => {
          ingredient[key] = input.value;
          if (key === "purchaseUnit") {
            syncIngredientUnit(ingredient);
            const usageUnit = row.querySelector('[data-field="usedUnit"]');
            if (usageUnit) usageUnit.value = ingredient.usedUnit;
          }
          save(); calculate();
        });
      });
      row.querySelector(".remove-ingredient").addEventListener("click", () => { state.ingredients = state.ingredients.filter((item) => item.id !== ingredient.id); save(); renderIngredients(); calculate(); });
      refs.ingredientList.appendChild(fragment);
    });
  }

  function calculate() {
    const result = HppEngine.calculate(state);
    result.ingredientResults.forEach((item, index) => {
      const row = refs.ingredientList.children[index];
      if (!row) return;
      row.querySelector("[data-cost]").textContent = rupiah(item.cost);
    });
    byId("total-ingredients").textContent = rupiah(result.ingredients);
    byId("total-waste").textContent = rupiah(result.waste);
    byId("total-extras").textContent = rupiah(result.extras);
    byId("total-batch").textContent = rupiah(result.batch);
    byId("hpp-per-unit").textContent = rupiah(result.perUnit);
    byId("summary-unit").textContent = state.product.yieldUnit || "produk";
    byId("yield-unit-label").textContent = state.product.yieldUnit || "produk";
    byId("waste-row").hidden = state.mode !== "professional" || !result.waste;
    const priced = ["professional", "simulation"].includes(state.mode);
    byId("price-result").hidden = !priced;
    byId("recommended-price").textContent = rupiah(result.recommendedPrice);
    byId("profit-note").textContent = `Target margin ${state.pricing.marginPercent || 0}%`;
    byId("monthly-capital").textContent = rupiah(result.monthlyCapital);
    byId("summary-help").textContent = result.perUnit ? `Untuk 1 ${state.product.yieldUnit}, dari ${state.product.batchYield || 0} ${state.product.yieldUnit} per batch.` : "Isi harga dan pemakaian bahan untuk melihat HPP.";
    byId("scenario-grid").innerHTML = result.scenarios.map((item) => `<div><span>Margin ${item.margin}%</span><strong>${rupiah(item.price)}</strong></div>`).join("");
  }

  function bindValue(element, setter, parser = (value) => value) {
    element.addEventListener("input", () => { setter(parser(element.value)); save(); calculate(); });
  }

  bindValue(refs.productName, (v) => state.product.name = v);
  bindValue(refs.batchYield, (v) => state.product.batchYield = v, Number);
  refs.yieldUnit.addEventListener("change", () => { state.product.yieldUnit = refs.yieldUnit.value; save(); calculate(); });
  bindValue(refs.monthlyTarget, (v) => state.product.monthlyTarget = v, Number);
  [[refs.labor,"labor"],[refs.packaging,"packaging"],[refs.utilities,"utilities"],[refs.overhead,"overhead"],[refs.depreciation,"depreciation"]].forEach(([el,key]) => bindValue(el, (v) => { state.costs[key] = v; el.value = rupiahInput(v); }, digits));
  bindValue(refs.waste, (v) => state.costs.wastePercent = v, Number);
  bindValue(refs.margin, (v) => state.pricing.marginPercent = v, Number);
  bindValue(refs.currentPrice, (v) => { state.pricing.currentPrice = v; refs.currentPrice.value = rupiahInput(v); }, digits);

  byId("add-ingredient").addEventListener("click", () => { state.ingredients.push(defaultIngredient()); save(); renderIngredients(); calculate(); });
  byId("reset-calculator").addEventListener("click", () => { if (!confirm("Hapus seluruh data perhitungan dan mulai ulang?")) return; state = defaultState(state.mode, ""); save(); syncInputs(); applyMode(); });
  byId("template-grid").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-template]"); if (!button) return;
    const template = templates[button.dataset.template];
    state.product.name = template.name; state.product.batchYield = template.yield; state.product.yieldUnit = template.unit;
    state.ingredients = template.ingredients.map(([name, price, qty, unit, householdQty, householdUnit, grams]) => ({ ...defaultIngredient(), name, purchasePrice: price, purchaseQty: qty, purchaseUnit: unit, usedUnit: unit, householdQty, householdUnit, gramsPerHousehold: grams }));
    save(); syncInputs(); renderIngredients(); calculate();
  });

  const openSettings = () => { byId("settings-panel").hidden = false; byId("settings-backdrop").hidden = false; document.body.classList.add("settings-open"); };
  const closeSettings = () => { byId("settings-panel").hidden = true; byId("settings-backdrop").hidden = true; document.body.classList.remove("settings-open"); };
  byId("open-settings").addEventListener("click", openSettings); byId("close-settings").addEventListener("click", closeSettings); byId("settings-backdrop").addEventListener("click", closeSettings);
  document.querySelectorAll('input[name="calculator-mode"]').forEach((input) => input.addEventListener("change", () => { state.mode = input.value; save(); applyMode(); closeSettings(); history.replaceState({}, "", `kalkulator.php?mode=${state.mode}`); }));

  syncInputs(); applyMode(); save();
})();
