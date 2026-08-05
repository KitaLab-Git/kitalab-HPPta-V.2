# HPPta V2

HPPta V2 adalah kalkulator Harga Pokok Produksi dari KitaLab. Pada tahap pengembangan ini, pengguna langsung memakai satu kalkulator tanpa login dan tanpa klasifikasi.

## Cakupan saat ini

- Landing page pengenalan HPPta.
- CTA utama **Coba Kalkulator** langsung menuju kalkulator.
- Form dan hasil klasifikasi dinonaktifkan sementara.
- Satu mode kalkulator HPP berbasis resep.
- Section Produk untuk nama produk dan jumlah jadi.
- Section Resep untuk menghitung biaya bahan.
- Section Kemasan opsional dengan biaya material dan biaya packing pada setiap item kemasan.
- Section Biaya Operasional opsional dengan tenaga kerja, gas, listrik, air, dan daftar biaya lainnya.
- Card margin harga jual dengan slider 0–50% dan input manual hingga 9999%.
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
- Harga jual dihitung dari `HPP per produk × (1 + margin ÷ 100)` tanpa mengubah nilai HPP.
- Kemasan dihitung dari `harga pembelian ÷ isi pembelian × jumlah dipakai`, lalu ditambah biaya packing item tersebut per produksi atau per pcs.
- Tenaga kerja memiliki satuan biaya dan satuan jumlah produksi yang dapat dipilih secara terpisah, sehingga biaya bulanan dapat dialokasikan memakai jumlah produksi harian, mingguan, atau bulanan.
- Gas dapat diisi langsung atau dihitung dari harga tabung, lama tabung bertahan, dan durasi pemakaian.
- Listrik dialokasikan dari biaya, lama biaya tersebut digunakan, serta jumlah produksi per jam, hari, minggu, atau bulan.
- Air dapat diisi langsung atau dialokasikan dari tagihan dan jumlah produksi dengan satuan masing-masing dalam satu baris form.
- Biaya operasional lainnya dapat ditambahkan sebagai beberapa item bernama. Setiap item memiliki satuan biaya dan satuan jumlah produksi yang dapat dipilih secara terpisah.
- Semua biaya opsional bernilai Rp0 jika dikosongkan.
- Biaya bahan dihitung dari harga dan isi pembelian terhadap jumlah pemakaian.
- Data sementara disimpan di browser perangkat pengguna.
