<?php

declare(strict_types=1);

require __DIR__ . '/includes/app.php';

if (isset($_GET['restart'])) {
    $_SESSION['hpp_answers'] = [];
    header('Location: klasifikasi.php');
    exit;
}

$answers = $_SESSION['hpp_answers'] ?? [];
$steps = hpp_steps($answers);
$requestedStep = isset($_GET['step']) ? max(0, (int) $_GET['step']) : null;

if ($requestedStep !== null) {
    $stepIndex = min($requestedStep, count($steps) - 1);
} else {
    $stepIndex = 0;
    foreach ($steps as $index => $key) {
        if (!isset($answers[$key]) || $answers[$key] === '') {
            $stepIndex = $index;
            break;
        }
        $stepIndex = min($index + 1, count($steps) - 1);
    }
}

$questionKey = $steps[$stepIndex];
$question = HPP_QUESTIONS[$questionKey];
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postedKey = (string) ($_POST['question_key'] ?? '');
    $postedIndex = max(0, (int) ($_POST['step_index'] ?? 0));

    if ($postedKey !== $questionKey) {
        header('Location: klasifikasi.php');
        exit;
    }

    $value = trim((string) ($_POST['answer'] ?? ''));

    if (($question['type'] ?? '') === 'text') {
        if ($value === '') {
            $error = 'Tuliskan nama produk terlebih dahulu.';
        } elseif (mb_strlen($value) > 80) {
            $error = 'Nama produk maksimal 80 karakter.';
        }
    } elseif (!array_key_exists($value, $question['options'] ?? [])) {
        $error = 'Pilih salah satu jawaban untuk melanjutkan.';
    }

    if ($error === '') {
        $answers[$questionKey] = $value;
        $_SESSION['hpp_answers'] = $answers;
        $updatedSteps = hpp_steps($answers);

        if ($postedIndex >= count($updatedSteps) - 1) {
            header('Location: hasil.php');
        } else {
            header('Location: klasifikasi.php?step=' . ($postedIndex + 1));
        }
        exit;
    }
}

$steps = hpp_steps($answers);
$stepIndex = min($stepIndex, count($steps) - 1);
$totalSteps = count($steps);
$progress = (int) round((($stepIndex + 1) / $totalSteps) * 100);
$selectedValue = (string) ($answers[$questionKey] ?? '');
?>
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#2567d9">
    <title>Klasifikasi Pengguna - HPPta</title>
    <link rel="icon" href="assets/images/kitalab-icon.svg?v=20260804" type="image/svg+xml">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="flow-page">
    <a class="skip-link" href="#main-content">Lewati ke pertanyaan</a>
    <header class="flow-header">
        <div class="container flow-header-inner">
            <a class="brand" href="index.php" aria-label="Kembali ke beranda HPPta">
                <img src="assets/images/kitalab-icon.svg" alt="" width="42" height="42">
                <span><strong>HPPta</strong><small>by KitaLab</small></span>
            </a>
            <span class="secure-note"><i></i> Klasifikasi awal</span>
        </div>
    </header>

    <main id="main-content" class="flow-main">
        <div class="flow-shell">
            <div class="flow-progress-meta">
                <span>Langkah <?= $stepIndex + 1 ?> dari <?= $totalSteps ?></span>
                <strong><?= $progress ?>% selesai</strong>
            </div>
            <div class="progress-track" role="progressbar" aria-label="Progres klasifikasi" aria-valuemin="1" aria-valuemax="<?= $totalSteps ?>" aria-valuenow="<?= $stepIndex + 1 ?>"><span style="width: <?= $progress ?>%"></span></div>

            <form class="question-card" method="post" action="klasifikasi.php?step=<?= $stepIndex ?>">
                <input type="hidden" name="question_key" value="<?= hpp_e($questionKey) ?>">
                <input type="hidden" name="step_index" value="<?= $stepIndex ?>">
                <span class="eyebrow"><?= hpp_e($question['eyebrow']) ?></span>
                <h1><?= hpp_e($question['title']) ?></h1>
                <p class="question-helper"><?= hpp_e($question['helper']) ?></p>

                <?php if ($error !== ''): ?>
                    <div class="form-error" role="alert"><?= hpp_e($error) ?></div>
                <?php endif; ?>

                <?php if (($question['type'] ?? '') === 'text'): ?>
                    <label class="text-field">
                        <span>Nama produk</span>
                        <input type="text" name="answer" value="<?= hpp_e($selectedValue) ?>" placeholder="Contoh: Kopi susu gula aren" maxlength="80" autocomplete="off" autofocus>
                        <small>Masukkan nama yang biasa kamu gunakan.</small>
                    </label>
                <?php else: ?>
                    <fieldset class="option-list">
                        <legend class="sr-only">Pilih satu jawaban</legend>
                        <?php foreach ($question['options'] as $value => $option): ?>
                            <label class="option-card">
                                <input type="radio" name="answer" value="<?= hpp_e($value) ?>" <?= $selectedValue === $value ? 'checked' : '' ?>>
                                <span class="radio-mark"></span>
                                <span class="option-copy"><strong><?= hpp_e($option['title']) ?></strong><small><?= hpp_e($option['description']) ?></small></span>
                                <span class="option-arrow" aria-hidden="true">→</span>
                            </label>
                        <?php endforeach; ?>
                    </fieldset>
                <?php endif; ?>

                <div class="question-actions">
                    <?php if ($stepIndex > 0): ?>
                        <a class="button button-secondary" href="klasifikasi.php?step=<?= $stepIndex - 1 ?>"><span aria-hidden="true">←</span> Kembali</a>
                    <?php else: ?>
                        <a class="button button-secondary" href="index.php"><span aria-hidden="true">←</span> Beranda</a>
                    <?php endif; ?>
                    <button class="button button-primary" type="submit"><?= $stepIndex === $totalSteps - 1 ? 'Lihat hasil' : 'Selanjutnya' ?> <span aria-hidden="true">→</span></button>
                </div>
            </form>

            <p class="flow-footnote">Jawaban ini hanya digunakan untuk merekomendasikan mode awal dan nantinya dapat diubah.</p>
        </div>
    </main>
</body>
</html>
