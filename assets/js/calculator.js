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
    version: 1,
    mode: "easy",
    product: { name: "", batchYield: 1, yieldUnit: "resep", monthlyTarget: 0 },
    ingredients: [defaultIngredient()],
    costs: {},
    pricing: {},
  });
  const byId = (id) => document.getElementById(id);
  const digits = (value) => Number(String(value || "").replace(/\D/g, "")) || 0;
  const rupiah = (value) => `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`;
  const rupiahInput = (value) => value ? Number(value).toLocaleString("id-ID") : "";

  let state = defaultState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && Array.isArray(saved.ingredients)) state.ingredients = saved.ingredients;
  } catch (_) {}

  const list = byId("ingredient-list");
  const template = byId("ingredient-template");
  const empty = byId("empty-ingredients");

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
    byId("total-batch").textContent = rupiah(result.batch);
    byId("hpp-per-unit").textContent = rupiah(result.batch);
    byId("summary-help").textContent = result.batch
      ? "Total biaya seluruh bahan yang digunakan dalam resep."
      : "Isi harga pembelian dan pemakaian bahan untuk melihat total HPP resep.";
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
          ingredient[key] = input.value;
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
  byId("reset-calculator").addEventListener("click", () => {
    if (!confirm("Hapus seluruh data resep dan mulai ulang?")) return;
    state = defaultState();
    save();
    renderIngredients();
    calculate();
  });

  document.body.dataset.mode = "easy";
  renderIngredients();
  calculate();
  save();
})();
