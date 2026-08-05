# HPPta V2

HPPta V2 adalah kalkulator Harga Pokok Produksi dari KitaLab. Pada tahap pengembangan ini, pengguna langsung memakai satu kalkulator tanpa login dan tanpa klasifikasi.

## Cakupan saat ini

- Landing page pengenalan HPPta.
- CTA utama **Coba Kalkulator** langsung menuju kalkulator.
- Form dan hasil klasifikasi dinonaktifkan sementara.
- Satu mode kalkulator HPP berbasis resep.
- Section Produk untuk nama produk dan jumlah jadi.
- Section Resep untuk menghitung biaya bahan.
- Section Biaya Operasional yang opsional dan bernilai Rp0 jika dikosongkan.
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

## Alur pengembangan saat ini

Pengguna menekan **Coba Kalkulator** dan langsung masuk ke kalkulator. URL klasifikasi dan hasil klasifikasi juga dialihkan ke kalkulator.

## Catatan kalkulator

- Total HPP resep berasal dari biaya seluruh bahan yang digunakan.
- HPP per produk adalah total HPP resep dibagi jumlah jadi.
- Biaya operasional yang diisi ditambahkan ke total resep sebelum dibagi jumlah jadi.
- Biaya bahan dihitung dari harga dan isi pembelian terhadap jumlah pemakaian.
- Data sementara disimpan di browser perangkat pengguna.
