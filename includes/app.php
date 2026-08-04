<?php

declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

const HPP_QUESTIONS = [
    'sale_status' => [
        'eyebrow' => 'Tentang produkmu',
        'title' => 'Apakah produk ini sudah dijual?',
        'helper' => 'Jawabanmu membantu HPPta menentukan titik awal yang paling sesuai.',
        'options' => [
            'sold' => ['title' => 'Sudah dijual', 'description' => 'Produk sudah pernah atau sedang dijual.'],
            'planned' => ['title' => 'Belum, masih rencana', 'description' => 'Produk masih dalam tahap persiapan atau ide.'],
        ],
    ],
    'capital_experience' => [
        'eyebrow' => 'Pengalaman menghitung',
        'title' => 'Apakah Anda pernah menghitung modal per produk sebelumnya?',
        'helper' => 'Tidak masalah jika belum. HPPta akan menyesuaikan cara penggunaannya.',
        'options' => [
            'yes' => ['title' => 'Pernah', 'description' => 'Saya sudah pernah menghitung modal atau HPP produk.'],
            'no' => ['title' => 'Belum pernah', 'description' => 'Ini pertama kalinya saya menghitung modal produk.'],
        ],
    ],
    'has_recipe' => [
        'eyebrow' => 'Kesiapan produk',
        'title' => 'Apakah Anda sudah memiliki resep?',
        'helper' => 'Resep dapat berupa daftar bahan dan perkiraan takaran yang akan digunakan.',
        'options' => [
            'yes' => ['title' => 'Sudah', 'description' => 'Saya sudah memiliki resep atau daftar bahan.'],
            'no' => ['title' => 'Belum', 'description' => 'Saya masih mencari gambaran bahan dan resep.'],
        ],
    ],
    'measurement' => [
        'eyebrow' => 'Takaran resep',
        'title' => 'Bagaimana takaran resep Anda?',
        'helper' => 'Pilih bentuk takaran yang paling sering Anda gunakan saat ini.',
        'options' => [
            'precise' => ['title' => 'Gram atau mililiter', 'description' => 'Saya menggunakan satuan ukur yang cukup pasti.'],
            'household' => ['title' => 'Sendok, gelas, atau butir', 'description' => 'Saya menggunakan takaran sehari-hari.'],
            'unknown' => ['title' => 'Belum tahu pasti', 'description' => 'Takaran masih berdasarkan perkiraan.'],
        ],
    ],
    'detail_preference' => [
        'eyebrow' => 'Cara menghitung',
        'title' => 'Seberapa detail perhitungan yang diinginkan?',
        'helper' => 'Pilihan ini menjadi preferensi awal dan nantinya tetap dapat diubah.',
        'options' => [
            'quick' => ['title' => 'Cepat dan sederhana', 'description' => 'Tampilkan hal penting agar saya dapat segera mulai.'],
            'complete' => ['title' => 'Lengkap dan terperinci', 'description' => 'Saya ingin melihat lebih banyak komponen perhitungan.'],
        ],
    ],
    'product_name' => [
        'eyebrow' => 'Langkah terakhir',
        'title' => 'Apa nama produk yang ingin dihitung?',
        'helper' => 'Nama ini hanya digunakan untuk menampilkan hasil klasifikasi sementara.',
        'type' => 'text',
    ],
];

function hpp_steps(array $answers): array
{
    $steps = ['sale_status'];
    $steps[] = ($answers['sale_status'] ?? '') === 'sold' ? 'capital_experience' : 'has_recipe';

    if (($answers['sale_status'] ?? '') === 'planned' && ($answers['has_recipe'] ?? '') === 'no') {
        $steps[] = 'detail_preference';
        $steps[] = 'product_name';
        return $steps;
    }

    $steps[] = 'measurement';
    $steps[] = 'detail_preference';
    $steps[] = 'product_name';

    return $steps;
}

function hpp_classify(array $answers): array
{
    $saleStatus = $answers['sale_status'] ?? '';
    $measurement = $answers['measurement'] ?? '';

    if ($saleStatus === 'planned' && ($answers['has_recipe'] ?? '') === 'no') {
        return [
            'level' => 'Pengguna Masih Tahap Ide',
            'mode' => 'Kalkulator HPPta',
            'description' => 'Produkmu masih berada di tahap ide dan belum memiliki resep. Mulailah menyusun bahan yang ingin digunakan sebagai dasar perhitungan.',
        ];
    }

    if ($measurement === 'unknown') {
        return [
            'level' => 'Pengguna Tanpa Takaran',
            'mode' => 'Kalkulator HPPta',
            'description' => 'Takaran produkmu masih berupa perkiraan. Catat bahan dan takarannya agar perhitungan dapat dibuat semakin tepat.',
        ];
    }

    if ($saleStatus === 'planned') {
        return [
            'level' => 'Pengguna Simulasi Usaha',
            'mode' => 'Kalkulator HPPta',
            'description' => 'Produkmu belum dijual, tetapi resepnya sudah tersedia. Kamu dapat mulai menghitung biaya bahan sebelum usaha dimulai.',
        ];
    }

    if (($answers['capital_experience'] ?? '') === 'yes') {
        return [
            'level' => 'Pengguna Berpengalaman',
            'mode' => 'Kalkulator HPPta',
            'description' => 'Kamu sudah menjual produk dan pernah menghitung modal. Gunakan data pembelian dan resep aktual untuk menghitung biaya bahan.',
        ];
    }

    return [
        'level' => 'Pengguna Baru',
        'mode' => 'Kalkulator HPPta',
        'description' => 'Kamu sudah menjual produk, tetapi baru mulai menghitung modal. Mulailah dari harga pembelian dan pemakaian setiap bahan.',
    ];
}

function hpp_mode_key(string $mode): string
{
    return 'easy';
}

function hpp_e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function hpp_url(string $path): string
{
    return $path;
}
