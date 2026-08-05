<?php

declare(strict_types=1);

require __DIR__ . '/includes/app.php';

if (isset($_GET['reset'])) {
    unset($_SESSION['hpp_answers']);
}
?>
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="HPPta membantu UMKM memahami Harga Pokok Produksi melalui cara menghitung yang disesuaikan dengan tingkat pemahaman pengguna.">
    <meta name="theme-color" content="#2567d9">
    <title>HPPta - Hitung HPP dengan Cara yang Lebih Mudah</title>
    <link rel="icon" href="assets/images/kitalab-icon.svg?v=20260804" type="image/svg+xml">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <a class="skip-link" href="#main-content">Lewati ke konten utama</a>
    <header class="site-header">
        <div class="container header-inner">
            <a class="brand" href="index.php" aria-label="HPPta beranda">
                <img src="assets/images/kitalab-icon.svg" alt="" width="44" height="44">
                <span><strong>HPPta</strong><small>by KitaLab</small></span>
            </a>
            <nav class="desktop-nav" aria-label="Navigasi utama">
                <a href="#tentang">Tentang</a>
                <a href="#cara-kerja">Cara kerja</a>
                <a href="#untuk-siapa">Untuk siapa</a>
            </nav>
            <a class="button button-small button-primary" href="kalkulator.php">Coba Kalkulator</a>
        </div>
    </header>

    <main id="main-content">
        <section class="hero">
            <div class="container hero-grid">
                <div class="hero-copy">
                    <span class="eyebrow">Kalkulator HPP untuk UMKM Indonesia</span>
                    <h1>Pahami biaya produkmu dengan cara yang <em>lebih ringan.</em></h1>
                    <p>HPPta membantumu menghitung Harga Pokok Produksi dari bahan yang digunakan dalam satu kali proses produksi.</p>
                    <div class="hero-actions">
                        <a class="button button-primary button-large" href="kalkulator.php">Coba Kalkulator <span aria-hidden="true">→</span></a>
                        <a class="button button-secondary button-large" href="#cara-kerja">Lihat cara kerja</a>
                    </div>
                    <div class="trust-row" aria-label="Keunggulan HPPta">
                        <span>✓ Tanpa login untuk tahap ini</span>
                        <span>✓ Dipandu langkah demi langkah</span>
                    </div>
                </div>

                <div class="hero-visual" aria-label="Ilustrasi pengalaman HPPta">
                    <div class="visual-glow visual-glow-one"></div>
                    <div class="visual-glow visual-glow-two"></div>
                    <div class="preview-card">
                        <div class="preview-top">
                            <span class="preview-icon">H</span>
                            <div><strong>Perhitungan produk</strong><small>Mulai dari produk dan resepmu</small></div>
                            <span class="status-pill">Resep</span>
                        </div>
                        <div class="preview-question">
                            <small>Informasi produksi</small>
                            <strong>Apa produk yang ingin dihitung?</strong>
                            <div class="mini-option active"><span></span> Tulis nama produk</div>
                            <div class="mini-option"><span></span> Masukkan jumlah jadi</div>
                            <div class="mini-option"><span></span> Tambahkan bahan resep</div>
                        </div>
                        <div class="preview-footer"><span>Langsung hitung tanpa klasifikasi</span><b>1 mode</b></div>
                    </div>
                    <div class="floating-note note-one"><span>✓</span><div><strong>Satu kalkulator</strong><small>Langsung dapat digunakan</small></div></div>
                    <div class="floating-note note-two"><span>↗</span><div><strong>Lebih sederhana</strong><small>Produk, resep, lalu hasil</small></div></div>
                </div>
            </div>
        </section>

        <section class="trust-strip">
            <div class="container">
                <p>DIRANCANG AGAR PERHITUNGAN HPP TIDAK TERASA RUMIT</p>
                <div><span>Sederhana</span><span>Adaptif</span><span>Bertahap</span><span>Mobile-first</span></div>
            </div>
        </section>

        <section class="section" id="tentang">
            <div class="container intro-grid">
                <div>
                    <span class="eyebrow eyebrow-yellow">Kenapa HPPta?</span>
                    <h2>Satu kalkulator untuk mulai memahami <em>biaya produkmu.</em></h2>
                </div>
                <div class="intro-copy">
                    <p>Setiap pelaku usaha dapat memulai dari informasi paling dasar: produk yang dibuat dan bahan yang digunakan.</p>
                    <p>Dalam masa pengembangan ini, HPPta menggunakan satu kalkulator yang sama untuk seluruh pengguna tanpa form klasifikasi.</p>
                </div>
            </div>
        </section>

        <section class="section section-soft" id="cara-kerja">
            <div class="container">
                <div class="section-heading">
                    <span class="eyebrow">Cara kerja</span>
                    <h2>Mulai menghitung dalam <em>tiga langkah.</em></h2>
                    <p>Tidak perlu melalui klasifikasi. Masukkan informasi produksi dan resep untuk melihat HPP produkmu.</p>
                </div>
                <div class="steps-grid">
                    <article class="feature-card"><span class="feature-number">01</span><div class="feature-icon">P</div><h3>Isi informasi produk</h3><p>Tuliskan nama produk dan jumlah produk yang dihasilkan.</p></article>
                    <article class="feature-card featured"><span class="feature-number">02</span><div class="feature-icon">R</div><h3>Masukkan resep</h3><p>Catat harga pembelian dan jumlah setiap bahan yang digunakan.</p></article>
                    <article class="feature-card"><span class="feature-number">03</span><div class="feature-icon">∑</div><h3>Lihat hasil HPP</h3><p>HPPta membagi total biaya resep dengan jumlah produk yang dihasilkan.</p></article>
                </div>
            </div>
        </section>

        <section class="section" id="untuk-siapa">
            <div class="container audience-panel">
                <div>
                    <span class="eyebrow eyebrow-light">Dibangun untuk bertumbuh bersama</span>
                    <h2>Baru mulai atau sudah berpengalaman, <em>keduanya tetap bisa.</em></h2>
                    <p>Satu kalkulator digunakan oleh seluruh pengguna selama masa pengembangan, tanpa login dan tanpa klasifikasi.</p>
                    <a class="button button-yellow button-large" href="kalkulator.php">Coba Kalkulator <span aria-hidden="true">→</span></a>
                </div>
                <ul>
                    <li><span>01</span><div><strong>Usaha yang sudah berjalan</strong><small>Untuk pengguna baru maupun berpengalaman.</small></div></li>
                    <li><span>02</span><div><strong>Produk yang masih disiapkan</strong><small>Uji resep dan biaya sebelum mulai berjualan.</small></div></li>
                    <li><span>03</span><div><strong>Ide yang belum memiliki resep</strong><small>Mulai dari simulasi yang lebih mudah dipahami.</small></div></li>
                </ul>
            </div>
        </section>

        <section class="final-cta">
            <div class="container">
                <img src="assets/images/kitalab-icon.svg" alt="" width="52" height="52">
                <span class="eyebrow">Siap mengenal HPP produkmu?</span>
                <h2>Mulai dari yang kamu pahami <em>hari ini.</em></h2>
                <p>Masukkan produk dan resep untuk mulai menghitung tanpa klasifikasi.</p>
                <a class="button button-primary button-large" href="kalkulator.php">Coba Kalkulator <span aria-hidden="true">→</span></a>
            </div>
        </section>
    </main>

    <footer class="site-footer">
        <div class="container footer-inner">
            <div class="brand footer-brand"><img src="assets/images/kitalab-icon.svg" alt="" width="40" height="40"><span><strong>HPPta</strong><small>by KitaLab</small></span></div>
            <p>Produk perhitungan Harga Pokok Produksi untuk UMKM Indonesia.</p>
            <a href="https://kitalab.online" target="_blank" rel="noreferrer">Kenal KitaLab ↗</a>
        </div>
    </footer>
</body>
</html>
