# HPPta V2

HPPta V2 adalah kalkulator Harga Pokok Produksi dari KitaLab. Milestone ini mencakup fase pengenalan produk dan klasifikasi awal pengguna.

## Cakupan saat ini

- Landing page pengenalan HPPta.
- CTA utama **Mulai Hitung HPP**.
- Wizard klasifikasi satu pertanyaan per halaman.
- Lima rekomendasi mode awal berdasarkan flow produk.
- Halaman hasil sementara untuk memvalidasi logika klasifikasi.
- Tanpa login, register, database, dan kalkulator fase 3.

## Menjalankan secara lokal

Gunakan PHP 8.1 atau lebih baru:

```powershell
php -S localhost:8080
```

Lalu buka `http://localhost:8080`.

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

1. Takaran yang belum pasti mendapatkan rekomendasi **Kalkulator Estimasi**.
2. Produk yang belum dijual dan belum memiliki resep mendapatkan **Generator Simulasi HPP**.
3. Produk yang belum dijual tetapi sudah memiliki resep mendapatkan **Kalkulator Simulasi Usaha**.
4. Produk yang sudah dijual dan pernah dihitung mendapatkan **Kalkulator HPP Profesional**.
5. Produk yang sudah dijual tetapi belum pernah dihitung mendapatkan **Kalkulator HPP Mudah**.

Preferensi `Cepat` atau `Lengkap` direkam sebagai preferensi tampilan awal, bukan sebagai sistem kalkulator yang berbeda.
