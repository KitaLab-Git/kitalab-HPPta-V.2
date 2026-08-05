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
    <link rel="icon" href="assets/images/kitalab-icon.svg?v=20260804" type="image/svg+xml">
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/calculator.css?v=20260805-5">
</head>
<body class="calculator-page" data-initial-mode="<?= hpp_e($requestedMode) ?>">
    <a class="skip-link" href="#calculator-main">Lewati ke kalkulator</a>
    <header class="calculator-header">
        <div class="container calculator-header-inner">
            <a class="brand" href="index.php" aria-label="HPPta beranda">
                <img src="assets/images/kitalab-icon.svg" alt="" width="42" height="42">
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
                    <div class="calc-card-heading">
                        <div><span class="step-label">01 · Produk</span><h2>Informasi produksi</h2><p>Masukkan produk dan jumlah yang dihasilkan dari satu resep.</p></div>
                    </div>
                    <div class="form-grid product-grid">
                        <label class="calc-field"><span>Nama produk</span><input id="product-name" type="text" maxlength="80" placeholder="Contoh: Kopi susu aren"></label>
                        <label class="calc-field"><span>Jumlah jadi</span><div class="input-suffix"><input id="batch-yield" type="number" min="0.01" step="any" value="1"><span>produk</span></div></label>
                    </div>
                </section>

                <section class="calc-card">
                    <div class="calc-card-heading ingredient-heading">
                        <div><span class="step-label">02 · Resep</span><h2>Bahan baku</h2><p>Tuliskan harga beli dan jumlah yang dipakai dalam resep.</p></div>
                        <button class="button button-secondary" id="add-ingredient" type="button">+ Tambah bahan</button>
                    </div>
                    <div id="ingredient-list" class="ingredient-list"></div>
                    <div class="empty-ingredients" id="empty-ingredients" hidden><strong>Belum ada bahan</strong><p>Tambahkan bahan pertama untuk mulai menghitung.</p></div>
                </section>

                <section class="calc-card">
                    <div class="calc-card-heading ingredient-heading">
                        <div><span class="step-label">03 · Kemasan</span><h2>Kemasan produk <small class="optional-label">Opsional</small></h2><p>Tambahkan cup, botol, plastik, stiker, kardus, atau kemasan lain yang dipakai.</p></div>
                        <button class="button button-secondary" id="add-packaging" type="button">+ Tambah kemasan</button>
                    </div>
                    <div id="packaging-list" class="packaging-list"></div>
                    <div class="empty-ingredients" id="empty-packaging"><strong>Belum ada kemasan</strong><p>Bagian ini boleh dilewati jika produk tidak memakai kemasan.</p></div>
                </section>

                <section class="calc-card">
                    <div class="calc-card-heading">
                        <div><span class="step-label">04 · Biaya operasional</span><h2>Operasional produksi <small class="optional-label">Opsional</small></h2><p>Pilih cara input yang paling mudah. Kolom kosong selalu dihitung Rp0.</p></div>
                    </div>

                    <div class="operation-stack">
                        <section class="operation-block" aria-labelledby="labor-title">
                            <div class="operation-heading"><div><h3 id="labor-title">Tenaga kerja</h3></div><strong id="labor-result">Rp 0</strong></div>
                            <div class="form-grid operation-grid labor-fields">
                                <label class="calc-field"><span>Jumlah tenaga kerja</span><input id="labor-worker-count" type="number" min="0" step="1" placeholder="0"></label>
                                <label class="calc-field"><span>Biaya per tenaga kerja</span><div class="currency-input"><span>Rp</span><input id="labor-cost-per-worker" type="text" inputmode="numeric" placeholder="0"></div></label>
                                <label class="calc-field"><span>Satuan biaya</span><select id="labor-period"><option value="production">Per produksi</option><option value="day">Per hari</option><option value="week">Per minggu</option><option value="month">Per bulan</option></select></label>
                                <label class="calc-field" id="labor-production-field" hidden><span>Jumlah produksi</span><div class="value-unit"><input id="labor-productions-per-period" type="number" min="0" step="1" placeholder="0"><select id="labor-production-unit" aria-label="Satuan jumlah produksi tenaga kerja"><option value="day">per hari</option><option value="week">per minggu</option><option value="month">per bulan</option></select></div></label>
                            </div>
                        </section>

                        <section class="operation-block" aria-labelledby="gas-title">
                            <div class="operation-heading"><div><h3 id="gas-title">Gas</h3></div><strong id="gas-result">Rp 0</strong></div>
                            <div class="gas-fields">
                                <label class="calc-field"><span>Metode perhitungan</span><select id="gas-method"><option value="direct">Biaya langsung per produksi</option><option value="usage">Berdasarkan durasi pemakaian tabung</option></select></label>
                                <div class="gas-panel" data-gas-panel="direct">
                                    <label class="calc-field"><span>Biaya gas per produksi</span><div class="currency-input"><span>Rp</span><input id="gas-direct-cost" type="text" inputmode="numeric" placeholder="0"></div></label>
                                </div>
                                <div class="gas-panel" data-gas-panel="usage" hidden>
                                    <label class="calc-field"><span>Harga satu tabung</span><div class="currency-input"><span>Rp</span><input id="gas-cylinder-price" type="text" inputmode="numeric" placeholder="0"></div></label>
                                    <label class="calc-field"><span>Satu tabung bertahan</span><div class="value-unit"><input id="gas-lifespan" type="number" min="0" step="any" placeholder="0"><select id="gas-lifespan-unit"><option value="hour">jam</option><option value="day">hari</option></select></div></label>
                                    <label class="calc-field"><span>Dipakai per produksi</span><div class="value-unit"><input id="gas-usage-production" type="number" min="0" step="any" placeholder="0"><select id="gas-usage-unit"><option value="hour">jam</option><option value="day">hari</option></select></div></label>
                                </div>
                            </div>
                        </section>

                        <section class="operation-block" aria-labelledby="electricity-title">
                            <div class="operation-heading"><div><h3 id="electricity-title">Listrik</h3></div><strong id="electricity-result">Rp 0</strong></div>
                            <div class="electricity-fields">
                                <label class="calc-field electricity-cost"><span>Biaya listrik</span><div class="currency-input"><span>Rp</span><input id="electricity-cost" type="text" inputmode="numeric" placeholder="0"></div></label>
                                <label class="calc-field electricity-duration"><span>Digunakan selama</span><div class="value-unit"><input id="electricity-duration" type="number" min="0" step="any" placeholder="0"><select id="electricity-duration-unit"><option value="hour">jam</option><option value="day">hari</option><option value="week">minggu</option><option value="month">bulan</option></select></div></label>
                                <label class="calc-field electricity-productions"><span>Jumlah produksi per</span><div class="value-unit"><input id="electricity-production-count" type="number" min="0" step="any" placeholder="0"><select id="electricity-production-unit"><option value="hour">jam</option><option value="day">hari</option><option value="week">minggu</option><option value="month">bulan</option></select></div></label>
                            </div>
                        </section>

                        <section class="operation-block" aria-labelledby="water-title">
                            <div class="operation-heading"><div><h3 id="water-title">Air</h3><p>Masukkan langsung atau bagi tagihan dengan jumlah produksi.</p></div><strong id="water-result">Rp 0</strong></div>
                            <div class="water-fields">
                                <label class="calc-field"><span>Metode perhitungan</span><select id="water-method"><option value="direct">Biaya langsung per produksi</option><option value="allocation">Alokasi tagihan berdasarkan jumlah produksi</option></select></label>
                                <div class="water-panel" data-water-panel="direct">
                                    <label class="calc-field"><span>Biaya air per produksi</span><div class="currency-input"><span>Rp</span><input id="water-direct-cost" type="text" inputmode="numeric" placeholder="0"></div></label>
                                </div>
                                <div class="water-panel" data-water-panel="allocation" hidden>
                                    <label class="calc-field"><span>Total tagihan air</span><div class="currency-input"><span>Rp</span><input id="water-bill" type="text" inputmode="numeric" placeholder="0"></div></label>
                                    <label class="calc-field"><span>Satuan tagihan</span><select id="water-period"><option value="day">Per hari</option><option value="week">Per minggu</option><option value="month">Per bulan</option></select></label>
                                    <label class="calc-field"><span>Jumlah produksi</span><div class="value-unit"><input id="water-productions-period" type="number" min="0" step="1" placeholder="0"><select id="water-production-unit" aria-label="Satuan jumlah produksi air"><option value="day">per hari</option><option value="week">per minggu</option><option value="month">per bulan</option></select></div></label>
                                </div>
                            </div>
                        </section>

                        <section class="operation-block" aria-labelledby="other-title">
                            <div class="operation-heading"><div><h3 id="other-title">Biaya operasional lainnya</h3><p>Tambahkan nama dan nominal setiap biaya lain untuk satu produksi.</p></div><strong id="other-result">Rp 0</strong></div>
                            <button class="button button-secondary" id="add-other-operation" type="button">+ Tambah biaya lainnya</button>
                            <div id="other-operation-list" class="other-operation-list"></div>
                            <div class="empty-operations" id="empty-other-operations"><span>Belum ada biaya lainnya.</span></div>
                        </section>
                    </div>
                </section>

            </section>

            <aside class="summary-column" aria-label="Ringkasan perhitungan">
                <div class="summary-card">
                    <span class="summary-label">HPP per produk</span>
                    <strong class="summary-value" id="hpp-per-unit">Rp 0</strong>
                    <div class="summary-breakdown">
                        <div><span>Total bahan</span><strong id="total-ingredients">Rp 0</strong></div>
                        <div><span>Total kemasan</span><strong id="total-packaging">Rp 0</strong></div>
                        <div><span>Biaya operasional</span><strong id="total-operations">Rp 0</strong></div>
                        <div class="summary-total"><span>Total produksi</span><strong id="total-batch">Rp 0</strong></div>
                    </div>
                    <p class="summary-help" id="summary-help">Isi produk, jumlah jadi, dan resep untuk melihat HPP per produk.</p>
                </div>
                <div class="margin-card">
                    <div class="margin-decoration" aria-hidden="true">%</div>
                    <div class="margin-title-row">
                        <div><span class="margin-eyebrow">Tentukan harga jual</span><h2>Margin keuntungan</h2></div>
                        <span class="margin-value-badge" id="margin-value-label">0%</span>
                    </div>
                    <label class="margin-method"><span>Jenis margin</span><select id="margin-type"><option value="profit">Margin profit dari HPP</option><option value="revenue">Margin dari harga jual</option></select></label>
                    <p class="margin-explanation" id="margin-explanation">Keuntungan dihitung sebagai persentase tambahan dari HPP.</p>
                    <div class="margin-control-row">
                        <label class="margin-number"><span>Input manual</span><div><input id="margin-input" type="number" min="0" max="9999" step="1" value="0" aria-label="Persentase margin manual"><b>%</b></div></label>
                        <div class="margin-slider-wrap">
                            <input class="margin-slider" id="margin-slider" type="range" min="0" max="50" step="10" value="0" list="margin-steps" aria-label="Pilihan margin 0, 10, 20, 30, 40, atau 50 persen">
                            <datalist id="margin-steps"><option value="0"></option><option value="10"></option><option value="20"></option><option value="30"></option><option value="40"></option><option value="50"></option></datalist>
                            <div class="margin-ticks" aria-hidden="true"><span>0</span><span>10</span><span>20</span><span>30</span><span>40</span><span>50</span></div>
                        </div>
                    </div>
                    <p class="margin-warning" id="margin-warning" hidden></p>
                    <div class="selling-price"><span>Rekomendasi harga jual</span><strong id="selling-price">Rp 0</strong></div>
                </div>
                <div class="data-note"><strong>Data tersimpan di perangkat ini</strong><p>Login belum diaktifkan. Jangan hapus data browser jika ingin mempertahankan perhitungan.</p></div>
            </aside>
        </div>
    </main>

    <template id="ingredient-template">
        <article class="ingredient-row">
            <label class="calc-field ingredient-name"><span class="mobile-label">Nama bahan</span><input data-field="name" type="text" maxlength="60" placeholder="Nama bahan"></label>
            <label class="calc-field ingredient-price"><span class="mobile-label">Harga beli</span><div class="currency-input compact"><span>Rp</span><input data-field="purchasePrice" type="text" inputmode="numeric" placeholder="0"></div></label>
            <label class="calc-field quantity-unit ingredient-purchase"><span class="mobile-label">Isi pembelian</span><input data-field="purchaseQty" type="number" min="0" step="any" placeholder="0"><select data-field="purchaseUnit" aria-label="Satuan pembelian"><option value="g">gram</option><option value="kg">kg</option><option value="ml">ml</option><option value="l">liter</option><option value="pcs">buah</option></select></label>
            <label class="calc-field quantity-unit ingredient-usage"><span class="mobile-label">Dipakai</span><input data-field="usedQty" type="number" min="0" step="any" placeholder="0"><select data-field="usedUnit" aria-label="Satuan pemakaian"><option value="g">gram</option><option value="kg">kg</option><option value="ml">ml</option><option value="l">liter</option><option value="pcs">buah</option></select></label>
            <strong class="ingredient-cost" data-cost>Rp 0</strong>
            <button class="remove-ingredient" type="button" aria-label="Hapus bahan">×</button>
            <p class="unit-warning" data-warning hidden>Satuan pembelian dan pemakaian tidak sejenis.</p>
        </article>
    </template>

    <template id="packaging-template">
        <article class="packaging-row">
            <label class="calc-field packaging-name"><span>Nama kemasan</span><input data-packaging-field="name" type="text" maxlength="60" placeholder="Contoh: Cup 16 oz"></label>
            <label class="calc-field packaging-price"><span>Harga pembelian</span><div class="currency-input"><span>Rp</span><input data-packaging-field="purchasePrice" type="text" inputmode="numeric" placeholder="0"></div></label>
            <label class="calc-field packaging-purchase"><span>Isi pembelian</span><div class="input-suffix"><input data-packaging-field="purchaseQty" type="number" min="0" step="any" placeholder="0"><span>pcs</span></div></label>
            <label class="calc-field packaging-usage"><span>Dipakai per produksi</span><div class="input-suffix"><input data-packaging-field="usedQty" type="number" min="0" step="any" placeholder="0"><span>pcs</span></div></label>
            <label class="calc-field packaging-packing"><span>Biaya packing</span><div class="currency-select"><span>Rp</span><input data-packaging-field="packingCost" type="text" inputmode="numeric" placeholder="0"><select data-packaging-field="packingCostUnit"><option value="production">per produksi</option><option value="piece">per pcs</option></select></div></label>
            <strong class="packaging-cost" data-packaging-cost>Rp 0</strong>
            <button class="remove-packaging" type="button" aria-label="Hapus kemasan">×</button>
        </article>
    </template>

    <template id="other-operation-template">
        <article class="other-operation-row">
            <label class="calc-field"><span>Nama biaya</span><input data-other-field="name" type="text" maxlength="60" placeholder="Contoh: Transportasi"></label>
            <label class="calc-field other-amount"><span>Nominal biaya</span><div class="currency-select"><span>Rp</span><input data-other-field="amount" type="text" inputmode="numeric" placeholder="0"><select data-other-field="amountUnit" aria-label="Satuan nominal biaya"><option value="production">per produksi</option><option value="day">per hari</option><option value="week">per minggu</option><option value="month">per bulan</option></select></div></label>
            <label class="calc-field other-production" data-other-production-field hidden><span>Jumlah produksi</span><div class="value-unit"><input data-other-field="productionCount" type="number" min="0" step="any" placeholder="0"><select data-other-field="productionUnit" aria-label="Satuan jumlah produksi biaya lainnya"><option value="day">per hari</option><option value="week">per minggu</option><option value="month">per bulan</option></select></div></label>
            <button class="remove-other-operation" type="button" aria-label="Hapus biaya lainnya">×</button>
        </article>
    </template>

    <script src="assets/js/hpp-engine.js?v=20260805-6"></script>
    <script src="assets/js/calculator.js?v=20260805-7"></script>
</body>
</html>
