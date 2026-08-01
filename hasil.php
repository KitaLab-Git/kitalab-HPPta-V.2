<?php

declare(strict_types=1);

require __DIR__ . '/includes/app.php';

$answers = $_SESSION['hpp_answers'] ?? [];
$requiredSteps = hpp_steps($answers);

foreach ($requiredSteps as $key) {
    if (!isset($answers[$key]) || $answers[$key] === '') {
        header('Location: klasifikasi.php');
        exit;
    }
}

$result = hpp_classify($answers);
$productName = $answers['product_name'];
$detailLabel = ($answers['detail_preference'] ?? '') === 'complete' ? 'Lengkap dan terperinci' : 'Cepat dan sederhana';
?>
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#2567d9">
    <title>Hasil Klasifikasi - HPPta</title>
    <link rel="icon" href="assets/images/kitalab-mark.png" type="image/png">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="result-page">
    <header class="flow-header">
        <div class="container flow-header-inner">
            <a class="brand" href="index.php" aria-label="Kembali ke beranda HPPta">
                <img src="assets/images/kitalab-mark.png" alt="" width="42" height="42">
                <span><strong>HPPta</strong><small>by KitaLab</small></span>
            </a>
            <span class="secure-note"><i></i> Hasil klasifikasi</span>
        </div>
    </header>

    <main class="result-main">
        <div class="result-shell">
            <div class="result-check" aria-hidden="true">✓</div>
            <span class="eyebrow">Klasifikasi selesai</span>
            <p class="result-overline">Untuk produk <strong><?= hpp_e($productName) ?></strong>, Anda termasuk level</p>
            <h1><?= hpp_e($result['level']) ?></h1>
            <p class="result-description"><?= hpp_e($result['description']) ?></p>

            <div class="recommendation-card">
                <div class="recommendation-icon">H</div>
                <div><small>Mode awal yang direkomendasikan</small><strong><?= hpp_e($result['mode']) ?></strong></div>
                <span>Direkomendasikan</span>
            </div>

            <div class="result-summary">
                <div><small>Preferensi tampilan</small><strong><?= hpp_e($detailLabel) ?></strong></div>
                <div><small>Status mode</small><strong>Dapat diubah nanti</strong></div>
            </div>

            <div class="development-note">
                <span>i</span>
                <div><strong>Kalkulator sedang disiapkan</strong><p>Fase ini sementara berhenti pada hasil klasifikasi agar logikanya dapat diuji. Kalkulator pada fase berikutnya tetap menggunakan satu sistem yang sama.</p></div>
            </div>

            <div class="result-actions">
                <a class="button button-primary button-large" href="klasifikasi.php?restart=1">Ulangi klasifikasi</a>
                <a class="button button-secondary button-large" href="index.php">Kembali ke beranda</a>
            </div>
        </div>
    </main>
</body>
</html>

