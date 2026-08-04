# HPPta V2

HPPta V2 adalah kalkulator Harga Pokok Produksi dari KitaLab. Pada tahap ini, semua level pengguna memakai satu mode kalkulator berbasis resep.

## Cakupan saat ini

- Landing page pengenalan HPPta.
- CTA utama **Mulai Hitung HPP**.
- Wizard klasifikasi satu pertanyaan per halaman.
- Lima klasifikasi level pengguna berdasarkan flow produk.
- Halaman hasil klasifikasi pengguna.
- Satu mode kalkulator HPP berbasis resep.
- Section Resep untuk menghitung biaya bahan.
- Penyimpanan sementara menggunakan browser perangkat.
- Tanpa login, register, dan database pada tahap pengembangan ini.

## Menjalankan secara lokal

Gunakan PHP 8.1 atau lebih baru:

```powershell
php -S localhost:8080
```

Lalu buka `http://localhost:8080`.

Pengujian mesin perhitungan:

```powershell
node tests/hpp-engine.test.js
```

## Hosting

Unggah seluruh isi repository ke document root domain/subdomain Hostinger. Aplikasi tidak membutuhkan Node.js atau proses build.

Struktur utama:

```text
public_html/
├── .htaccess
├── index.php
├── klasifikasi.php
├── hasil.php
├── includes/
└── assets/
```

Pastikan ekstensi PHP `session` aktif. Hostinger mengaktifkannya secara default.

## Logika klasifikasi

Klasifikasi tetap menentukan level pemahaman awal pengguna. Level tersebut tidak mengubah kalkulator: seluruh pengguna diarahkan ke satu mode dan menggunakan Section Resep yang sama.

## Catatan kalkulator

- Total HPP resep berasal dari biaya seluruh bahan yang digunakan.
- Biaya bahan dihitung dari harga dan isi pembelian terhadap jumlah pemakaian.
- Data sementara disimpan di browser perangkat pengguna.
