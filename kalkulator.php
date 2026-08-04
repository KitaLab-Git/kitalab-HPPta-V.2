<?php

declare(strict_types=1);

require __DIR__ . '/includes/app.php';

$allowedModes = ['easy', 'professional', 'simulation', 'estimate', 'idea'];
$requestedMode = (string) ($_GET['mode'] ?? '');

if (!in_array($requestedMode, $allowedModes, true)) {
    $answers = $_SESSION['hpp_answers'] ?? [];
    $requestedMode = $answers ? hpp_mode_key(hpp_classify($answers)['mode']) : 'easy';
}

$product = trim((string) ($_GET['product'] ?? ($_SESSION['hpp_answers']['product_name'] ?? '')));
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
    <link rel="stylesheet" href="assets/css/calculator.css">
</head>
<body class="calculator-page" data-initial-mode="<?= hpp_e($requestedMode) ?>" data-initial-product="<?= hpp_e($product) ?>">
    <a class="skip-link" href="#calculator-main">Lewati ke kalkulator</a>
    <header class="calculator-header">
        <div class="container calculator-header-inner">
            <a class="brand" href="index.php" aria-label="HPPta beranda">
                <img src="assets/images/kitalab-mark.png" alt="" width="42" height="42">
                <span><strong>HPPta</strong><small>by KitaLab</small></span>
            </a>
            <div class="save-status" id="save-status"><i></i><span>Tersimpan di browser</span></div>
            <button class="icon-button" id="open-settings" type="button" aria-label="Buka pengaturan mode">⚙ <span>Mode</span></button>
        </div>
    </header>

    <main id="calculator-main" class="calculator-main">
        <div class="container calculator-layout">
            <section class="workspace-column">
                <div class="calculator-welcome">
                    <div>
                        <span class="eyebrow" id="mode-eyebrow">Mode HPP Mudah</span>
                        <h1 id="mode-title">Mari hitung biaya produkmu.</h1>
                        <p id="mode-description">Masukkan bahan yang digunakan dalam satu kali produksi.</p>
                    </div>
                    <button class="button button-secondary" id="reset-calculator" type="button">Mulai ulang</button>
                </div>

                <div class="mode-notice" id="mode-notice" hidden></div>

                <section class="calc-card idea-section" id="idea-section" hidden>
                    <div class="calc-card-heading">
                        <div><span class="step-label">Langkah awal</span><h2>Pilih contoh produk</h2><p>Template memberikan bahan dan harga contoh yang bisa kamu ubah.</p></div>
                    </div>
                    <div class="template-grid" id="template-grid">
                        <button type="button" data-template="coffee"><span>☕</span><strong>Minuman kopi</strong><small>Contoh kopi susu</small></button>
                        <button type="button" data-template="snack"><span>🍟</span><strong>Camilan goreng</strong><small>Contoh kentang goreng</small></button>
                        <button type="button" data-template="cake"><span>🍰</span><strong>Kue sederhana</strong><small>Contoh bolu</small></button>
                    </div>
                    <p class="assumption-note">Harga dan resep template adalah angka contoh untuk simulasi awal, bukan acuan harga pasar.</p>
                </section>

                <section class="calc-card">
                    <div class="calc-card-heading">
                        <div><span class="step-label">01 · Produk</span><h2>Informasi produksi</h2><p>Satu batch berarti satu kali proses produksi.</p></div>
                    </div>
                    <div class="form-grid product-grid">
                        <label class="calc-field"><span>Nama produk</span><input id="product-name" type="text" maxlength="80" placeholder="Contoh: Kopi susu aren"></label>
                        <label class="calc-field"><span>Jumlah jadi per batch</span><div class="input-suffix"><input id="batch-yield" type="number" min="0.01" step="any" value="1"><span id="yield-unit-label">produk</span></div></label>
                        <label class="calc-field"><span>Satuan produk</span><select id="yield-unit"><option>porsi</option><option>gelas</option><option>botol</option><option>bungkus</option><option>buah</option><option>loyang</option><option>kg</option></select></label>
                        <label class="calc-field simulation-only"><span>Target produksi bulanan</span><input id="monthly-target" type="number" min="0" step="1" value="100"></label>
                    </div>
                </section>

                <section class="calc-card">
                    <div class="calc-card-heading ingredient-heading">
                        <div><span class="step-label">02 · Resep</span><h2>Bahan baku</h2><p id="ingredient-guidance">Tuliskan harga beli dan jumlah yang dipakai untuk satu batch.</p></div>
                        <button class="button button-secondary" id="add-ingredient" type="button">+ Tambah bahan</button>
                    </div>
                    <div class="ingredient-table-head" aria-hidden="true"><span>Bahan</span><span>Pembelian</span><span>Pemakaian</span><span>Biaya</span><span></span></div>
                    <div id="ingredient-list" class="ingredient-list"></div>
                    <div class="empty-ingredients" id="empty-ingredients" hidden><strong>Belum ada bahan</strong><p>Tambahkan bahan pertama untuk mulai menghitung.</p></div>
                </section>

                <section class="calc-card estimate-section" id="estimate-section" hidden>
                    <div class="calc-card-heading"><div><span class="step-label">Bantuan estimasi</span><h2>Panduan takaran sehari-hari</h2><p>Atur perkiraan berat atau volume untuk setiap takaran. Hasil akan diberi penanda estimasi.</p></div></div>
                    <div class="estimate-guide"><span>1 sendok makan ≈ 15 gram/ml</span><span>1 sendok teh ≈ 5 gram/ml</span><span>1 gelas ≈ 240 ml</span><span>1 butir = 1 buah</span></div>
                </section>

                <section class="calc-card advanced-section" id="advanced-section" hidden>
                    <div class="calc-card-heading"><div><span class="step-label">03 · Biaya lain</span><h2>Biaya produksi tambahan</h2><p>Masukkan total biaya yang digunakan untuk satu batch, bukan biaya bulanan.</p></div></div>
                    <div class="form-grid cost-grid">
                        <label class="calc-field"><span>Tenaga kerja per batch</span><div class="currency-input"><span>Rp</span><input id="labor-cost" type="text" inputmode="numeric" placeholder="0"></div></label>
                        <label class="calc-field"><span>Kemasan per batch</span><div class="currency-input"><span>Rp</span><input id="packaging-cost" type="text" inputmode="numeric" placeholder="0"></div></label>
                        <label class="calc-field"><span>Gas, listrik, dan air</span><div class="currency-input"><span>Rp</span><input id="utilities-cost" type="text" inputmode="numeric" placeholder="0"></div></label>
                        <label class="calc-field"><span>Biaya lain per batch</span><div class="currency-input"><span>Rp</span><input id="overhead-cost" type="text" inputmode="numeric" placeholder="0"></div></label>
                        <label class="calc-field professional-only"><span>Penyusutan alat per batch</span><div class="currency-input"><span>Rp</span><input id="depreciation-cost" type="text" inputmode="numeric" placeholder="0"></div></label>
                        <label class="calc-field professional-only"><span>Waste bahan</span><div class="input-suffix"><input id="waste-percent" type="number" min="0" max="100" step=".1" value="0"><span>%</span></div></label>
                    </div>
                </section>

                <section class="calc-card pricing-section" id="pricing-section" hidden>
                    <div class="calc-card-heading"><div><span class="step-label">04 · Harga jual</span><h2>Target keuntungan</h2><p>Margin dihitung dari harga jual: harga jual = HPP ÷ (1 − margin).</p></div></div>
                    <div class="form-grid pricing-grid">
                        <label class="calc-field"><span>Target margin</span><div class="input-suffix"><input id="margin-percent" type="number" min="0" max="95" step="1" value="30"><span>%</span></div></label>
                        <label class="calc-field"><span>Harga jual saat ini</span><div class="currency-input"><span>Rp</span><input id="current-price" type="text" inputmode="numeric" placeholder="0"></div></label>
                    </div>
                    <div class="scenario-grid simulation-only" id="scenario-grid"></div>
                </section>
            </section>

            <aside class="summary-column" aria-label="Ringkasan perhitungan">
                <div class="summary-card">
                    <span class="summary-label">HPP per <b id="summary-unit">produk</b></span>
                    <strong class="summary-value" id="hpp-per-unit">Rp 0</strong>
                    <span class="estimate-badge" id="estimate-badge" hidden>Hasil estimasi</span>
                    <div class="summary-breakdown">
                        <div><span>Total bahan</span><strong id="total-ingredients">Rp 0</strong></div>
                        <div id="waste-row" hidden><span>Waste bahan</span><strong id="total-waste">Rp 0</strong></div>
                        <div><span>Biaya tambahan</span><strong id="total-extras">Rp 0</strong></div>
                        <div class="summary-total"><span>Total per batch</span><strong id="total-batch">Rp 0</strong></div>
                    </div>
                    <div class="price-result" id="price-result" hidden><span>Rekomendasi harga jual</span><strong id="recommended-price">Rp 0</strong><small id="profit-note">Target margin 30%</small></div>
                    <div class="monthly-result simulation-only" id="monthly-result"><span>Perkiraan modal bahan bulanan</span><strong id="monthly-capital">Rp 0</strong></div>
                    <p class="summary-help" id="summary-help">Isi harga dan pemakaian bahan untuk melihat HPP.</p>
                </div>
                <div class="data-note"><strong>Data tersimpan di perangkat ini</strong><p>Login belum diaktifkan. Jangan hapus data browser jika ingin mempertahankan perhitungan.</p></div>
            </aside>
        </div>
    </main>

    <div class="settings-backdrop" id="settings-backdrop" hidden></div>
    <aside class="settings-panel" id="settings-panel" aria-labelledby="settings-title" hidden>
        <div class="settings-heading"><div><span class="step-label">Pengaturan</span><h2 id="settings-title">Pilih mode kalkulator</h2></div><button class="close-button" id="close-settings" type="button" aria-label="Tutup pengaturan">×</button></div>
        <p>Mode hanya mengubah cara penggunaan dan fitur yang tampil. Data produk tetap sama.</p>
        <div class="mode-options" id="mode-options">
            <label><input type="radio" name="calculator-mode" value="easy"><span><strong>HPP Mudah</strong><small>Panduan dasar untuk mulai menghitung.</small></span></label>
            <label><input type="radio" name="calculator-mode" value="professional"><span><strong>HPP Profesional</strong><small>Biaya lengkap, waste, dan harga jual.</small></span></label>
            <label><input type="radio" name="calculator-mode" value="simulation"><span><strong>Simulasi Usaha</strong><small>Uji modal dan skenario sebelum menjual.</small></span></label>
            <label><input type="radio" name="calculator-mode" value="estimate"><span><strong>Estimasi</strong><small>Gunakan takaran sehari-hari.</small></span></label>
            <label><input type="radio" name="calculator-mode" value="idea"><span><strong>Generator Simulasi</strong><small>Mulai dari template contoh produk.</small></span></label>
        </div>
    </aside>

    <template id="ingredient-template">
        <article class="ingredient-row">
            <label class="calc-field ingredient-name"><span class="mobile-label">Nama bahan</span><input data-field="name" type="text" maxlength="60" placeholder="Nama bahan"></label>
            <div class="purchase-fields">
                <label class="calc-field purchase-price"><span class="mobile-label">Harga beli</span><div class="currency-input compact"><span>Rp</span><input data-field="purchasePrice" type="text" inputmode="numeric" placeholder="0"></div></label>
                <label class="calc-field purchase-quantity"><span class="mobile-label">Isi pembelian</span><input data-field="purchaseQty" type="number" min="0" step="any" placeholder="0"></label>
                <label class="calc-field purchase-unit"><span class="mobile-label">Satuan</span><select data-field="purchaseUnit" aria-label="Satuan pembelian"><option value="g">gram</option><option value="kg">kg</option><option value="ml">ml</option><option value="l">liter</option><option value="pcs">buah</option></select></label>
            </div>
            <div class="usage-fields standard-usage">
                <label class="calc-field quantity-unit"><span class="mobile-label">Dipakai</span><input data-field="usedQty" type="number" min="0" step="any" placeholder="0"><select data-field="usedUnit" aria-label="Satuan pemakaian otomatis" disabled><option value="g">gram</option><option value="ml">ml</option><option value="pcs">buah</option></select></label>
            </div>
            <div class="usage-fields estimate-usage">
                <label class="calc-field quantity-unit"><span class="mobile-label">Takaran dipakai</span><input data-field="householdQty" type="number" min="0" step="any" placeholder="0"><select data-field="householdUnit" aria-label="Takaran sehari-hari"><option value="tbsp">sdm</option><option value="tsp">sdt</option><option value="cup">gelas</option><option value="piece">butir</option></select></label>
                <label class="calc-field"><span class="mobile-label">Per takaran</span><div class="input-suffix"><input data-field="gramsPerHousehold" type="number" min="0" step="any" value="15"><span>g/ml</span></div></label>
            </div>
            <strong class="ingredient-cost" data-cost>Rp 0</strong>
            <button class="remove-ingredient" type="button" aria-label="Hapus bahan">×</button>
        </article>
    </template>

    <script src="assets/js/hpp-engine.js"></script>
    <script src="assets/js/calculator.js"></script>
</body>
</html>
