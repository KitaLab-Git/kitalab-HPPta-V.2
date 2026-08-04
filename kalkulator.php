<?php

declare(strict_types=1);

require __DIR__ . '/includes/app.php';

$requestedMode = 'easy';
?>
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#2567d9">
    <meta name="description" content="Kalkulator HPPta membantu menghitung biaya produksi dan HPP per produk.">
    <title>Kalkulator HPP - HPPta</title>
    <link rel="icon" href="assets/images/kitalab-mark.png" type="image/png">
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/calculator.css?v=20260804-2">
</head>
<body class="calculator-page" data-initial-mode="<?= hpp_e($requestedMode) ?>">
    <a class="skip-link" href="#calculator-main">Lewati ke kalkulator</a>
    <header class="calculator-header">
        <div class="container calculator-header-inner">
            <a class="brand" href="index.php" aria-label="HPPta beranda">
                <img src="assets/images/kitalab-mark.png" alt="" width="42" height="42">
                <span><strong>HPPta</strong><small>by KitaLab</small></span>
            </a>
            <div class="save-status" id="save-status"><i></i><span>Tersimpan di browser</span></div>
        </div>
    </header>

    <main id="calculator-main" class="calculator-main">
        <div class="container calculator-layout">
            <section class="workspace-column">
                <div class="calculator-welcome">
                    <div>
                        <span class="eyebrow">Kalkulator HPPta</span>
                        <h1>Hitung HPP dari resep.</h1>
                        <p>Masukkan harga pembelian dan jumlah bahan yang digunakan.</p>
                    </div>
                    <button class="button button-secondary" id="reset-calculator" type="button">Mulai ulang</button>
                </div>

                <section class="calc-card">
                    <div class="calc-card-heading ingredient-heading">
                        <div><span class="step-label">Resep</span><h2>Bahan baku</h2><p>Tuliskan harga beli dan jumlah yang dipakai dalam resep.</p></div>
                        <button class="button button-secondary" id="add-ingredient" type="button">+ Tambah bahan</button>
                    </div>
                    <div class="ingredient-table-head" aria-hidden="true"><span>Bahan</span><span>Pembelian</span><span>Pemakaian</span><span>Biaya</span><span></span></div>
                    <div id="ingredient-list" class="ingredient-list"></div>
                    <div class="empty-ingredients" id="empty-ingredients" hidden><strong>Belum ada bahan</strong><p>Tambahkan bahan pertama untuk mulai menghitung.</p></div>
                </section>

            </section>

            <aside class="summary-column" aria-label="Ringkasan perhitungan">
                <div class="summary-card">
                    <span class="summary-label">Total HPP resep</span>
                    <strong class="summary-value" id="hpp-per-unit">Rp 0</strong>
                    <div class="summary-breakdown">
                        <div><span>Total bahan</span><strong id="total-ingredients">Rp 0</strong></div>
                        <div class="summary-total"><span>Total resep</span><strong id="total-batch">Rp 0</strong></div>
                    </div>
                    <p class="summary-help" id="summary-help">Isi harga pembelian dan pemakaian bahan untuk melihat total HPP resep.</p>
                </div>
                <div class="data-note"><strong>Data tersimpan di perangkat ini</strong><p>Login belum diaktifkan. Jangan hapus data browser jika ingin mempertahankan perhitungan.</p></div>
            </aside>
        </div>
    </main>

    <template id="ingredient-template">
        <article class="ingredient-row">
            <label class="calc-field ingredient-name"><span class="mobile-label">Nama bahan</span><input data-field="name" type="text" maxlength="60" placeholder="Nama bahan"></label>
            <div class="purchase-fields">
                <label class="calc-field"><span class="mobile-label">Harga beli</span><div class="currency-input compact"><span>Rp</span><input data-field="purchasePrice" type="text" inputmode="numeric" placeholder="0"></div></label>
                <label class="calc-field quantity-unit"><span class="mobile-label">Isi pembelian</span><input data-field="purchaseQty" type="number" min="0" step="any" placeholder="0"><select data-field="purchaseUnit" aria-label="Satuan pembelian"><option value="g">gram</option><option value="kg">kg</option><option value="ml">ml</option><option value="l">liter</option><option value="pcs">buah</option></select></label>
            </div>
            <div class="usage-fields standard-usage">
                <label class="calc-field quantity-unit"><span class="mobile-label">Dipakai</span><input data-field="usedQty" type="number" min="0" step="any" placeholder="0"><select data-field="usedUnit" aria-label="Satuan pemakaian"><option value="g">gram</option><option value="kg">kg</option><option value="ml">ml</option><option value="l">liter</option><option value="pcs">buah</option></select></label>
            </div>
            <strong class="ingredient-cost" data-cost>Rp 0</strong>
            <button class="remove-ingredient" type="button" aria-label="Hapus bahan">×</button>
            <p class="unit-warning" data-warning hidden>Satuan pembelian dan pemakaian tidak sejenis.</p>
        </article>
    </template>

    <script src="assets/js/hpp-engine.js?v=20260804-1"></script>
    <script src="assets/js/calculator.js?v=20260804-2"></script>
</body>
</html>
