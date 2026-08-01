# HPPta V2

HPPta V2 adalah kalkulator Harga Pokok Produksi adaptif dari KitaLab. Aplikasi menggunakan satu mesin perhitungan dengan beberapa mode pengalaman pengguna.

## Cakupan saat ini

- Landing page pengenalan HPPta.
- CTA utama **Mulai Hitung HPP**.
- Wizard klasifikasi satu pertanyaan per halaman.
- Lima rekomendasi mode awal berdasarkan flow produk.
- Halaman hasil klasifikasi dan rekomendasi mode awal.
- Kalkulator HPP Mudah.
- Kalkulator HPP Profesional.
- Kalkulator Simulasi Usaha.
- Kalkulator Estimasi.
- Generator Simulasi HPP.
- Pergantian mode tanpa kehilangan data.
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

1. Takaran yang belum pasti mendapatkan rekomendasi **Kalkulator Estimasi**.
2. Produk yang belum dijual dan belum memiliki resep mendapatkan **Generator Simulasi HPP**.
3. Produk yang belum dijual tetapi sudah memiliki resep mendapatkan **Kalkulator Simulasi Usaha**.
4. Produk yang sudah dijual dan pernah dihitung mendapatkan **Kalkulator HPP Profesional**.
5. Produk yang sudah dijual tetapi belum pernah dihitung mendapatkan **Kalkulator HPP Mudah**.

Preferensi `Cepat` atau `Lengkap` direkam sebagai preferensi tampilan awal, bukan sebagai sistem kalkulator yang berbeda.

## Catatan fase 3

- Harga jual menggunakan rumus margin: `HPP / (1 - margin)`.
- Biaya tenaga kerja dan biaya operasional harus diisi sebagai biaya per batch, bukan biaya bulanan.
- Waste hanya dihitung pada mode Profesional.
- Mode Simulasi menghitung target produksi dan modal bulanan dari biaya per batch.
- Mode Estimasi dan Generator menampilkan penanda bahwa hasil menggunakan asumsi.
- Template Generator adalah contoh yang harus diganti dengan resep serta harga pengguna.
