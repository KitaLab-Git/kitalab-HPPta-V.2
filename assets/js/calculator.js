(function () {
  "use strict";

  const STORAGE_KEY = "hppta-v2-calculator";
  const defaultIngredient = () => ({
    id: Date.now() + Math.random(),
    name: "",
    purchasePrice: 0,
    purchaseQty: 0,
    purchaseUnit: "g",
    usedQty: 0,
    usedUnit: "g",
  });
  const defaultState = () => ({
    version: 2,
    mode: "easy",
    product: { name: "", batchYield: 1, yieldUnit: "resep", monthlyTarget: 0 },
    ingredients: [defaultIngredient()],
    costs: { labor: 0, packaging: 0, utilities: 0, overhead: 0 },
    pricing: {},
  });
  const byId = (id) => document.getElementById(id);
  const digits = (value) => Number(String(value || "").replace(/\D/g, "")) || 0;
  const rupiah = (value) => `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`;
  const rupiahInput = (value) => value ? Number(value).toLocaleString("id-ID") : "";

  let state = defaultState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved) {
      if (Array.isArray(saved.ingredients)) state.ingredients = saved.ingredients;
      if (saved.product) state.product = { ...state.product, ...saved.product };
      if (Number(saved.version) >= 2 && saved.costs) state.costs = { ...state.costs, ...saved.costs };
    }
  } catch (_) {}

  const list = byId("ingredient-list");
  const template = byId("ingredient-template");
  const empty = byId("empty-ingredients");
  const productName = byId("product-name");
  const batchYield = byId("batch-yield");
  const costInputs = {
    labor: byId("labor-cost"),
    packaging: byId("packaging-cost"),
    utilities: byId("utilities-cost"),
    overhead: byId("overhead-cost"),
  };

  function syncProduct() {
    productName.value = state.product.name || "";
    batchYield.value = state.product.batchYield > 0 ? state.product.batchYield : "";
    Object.entries(costInputs).forEach(([key, input]) => {
      input.value = rupiahInput(state.costs[key]);
    });
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const status = byId("save-status");
    status.classList.add("saved");
    setTimeout(() => status.classList.remove("saved"), 500);
  }

  function calculate() {
    const result = HppEngine.calculate(state);
    result.ingredientResults.forEach((item, index) => {
      const row = list.children[index];
      if (!row) return;
      row.querySelector("[data-cost]").textContent = rupiah(item.cost);
      row.querySelector("[data-warning]").hidden = item.compatible;
    });
    byId("total-ingredients").textContent = rupiah(result.ingredients);
    byId("total-extras").textContent = rupiah(result.extras);
    byId("total-batch").textContent = rupiah(result.batch);
    byId("hpp-per-unit").textContent = rupiah(result.perUnit);
    byId("summary-help").textContent = result.perUnit
      ? `Total resep ${rupiah(result.batch)} dibagi ${state.product.batchYield} produk${state.product.name ? ` ${state.product.name}` : ""}.`
      : "Isi produk, jumlah jadi, dan resep untuk melihat HPP per produk.";
  }

  function renderIngredients() {
    list.innerHTML = "";
    empty.hidden = state.ingredients.length > 0;
    state.ingredients.forEach((ingredient) => {
      const fragment = template.content.cloneNode(true);
      const row = fragment.querySelector(".ingredient-row");
      row.dataset.id = ingredient.id;
      row.querySelectorAll("[data-field]").forEach((input) => {
        const key = input.dataset.field;
        input.value = key === "purchasePrice" ? rupiahInput(ingredient[key]) : (ingredient[key] ?? "");
        input.addEventListener("input", () => {
          ingredient[key] = key === "purchasePrice"
            ? digits(input.value)
            : (input.type === "number" ? Number(input.value) || 0 : input.value);
          if (key === "purchasePrice") input.value = rupiahInput(ingredient[key]);
          save();
          calculate();
        });
        input.addEventListener("change", () => {
          if (key === "purchasePrice") {
            ingredient[key] = digits(input.value);
            input.value = rupiahInput(ingredient[key]);
          } else if (input.type === "number") {
            ingredient[key] = Number(input.value) || 0;
          } else {
            ingredient[key] = input.value;
          }
          save();
          calculate();
        });
      });
      row.querySelector(".remove-ingredient").addEventListener("click", () => {
        state.ingredients = state.ingredients.filter((item) => item.id !== ingredient.id);
        save();
        renderIngredients();
        calculate();
      });
      list.appendChild(fragment);
    });
  }

  byId("add-ingredient").addEventListener("click", () => {
    state.ingredients.push(defaultIngredient());
    save();
    renderIngredients();
    calculate();
  });
  productName.addEventListener("input", () => {
    state.product.name = productName.value;
    save();
    calculate();
  });
  batchYield.addEventListener("input", () => {
    state.product.batchYield = Number(batchYield.value) || 0;
    save();
    calculate();
  });
  Object.entries(costInputs).forEach(([key, input]) => {
    const updateCost = () => {
      state.costs[key] = digits(input.value);
      input.value = rupiahInput(state.costs[key]);
      save();
      calculate();
    };
    input.addEventListener("input", updateCost);
    input.addEventListener("change", updateCost);
  });
  byId("reset-calculator").addEventListener("click", () => {
    if (!confirm("Hapus seluruh data resep dan mulai ulang?")) return;
    state = defaultState();
    save();
    syncProduct();
    renderIngredients();
    calculate();
  });

  document.body.dataset.mode = "easy";
  syncProduct();
  renderIngredients();
  calculate();
  save();
})();
