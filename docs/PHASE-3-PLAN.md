# Rencana Pengembangan Fase 3

**Status:** Implementasi awal selesai, siap diuji pengguna dan direvisi.

## Tujuan

Fase 3 membangun kalkulator HPP adaptif berdasarkan hasil klasifikasi pengguna. HPPta tetap menggunakan satu mesin perhitungan dan satu struktur data. Perbedaan mode hanya memengaruhi alur, bahasa, panduan, tingkat detail, serta fitur yang ditampilkan.

Klasifikasi merupakan rekomendasi mode awal, bukan keputusan permanen. Pengguna kelak dapat mengganti mode melalui Pengaturan tanpa kehilangan data.

## Urutan pengerjaan

### 1. Fondasi kalkulator inti

- Struktur data produk, resep, dan bahan.
- Satuan pembelian dan penggunaan.
- Konversi satuan.
- Jumlah hasil produksi per batch.
- Biaya per bahan, biaya per batch, dan HPP per produk.
- Komponen biaya tambahan yang dipakai bersama.
- Format Rupiah dan aturan pembulatan.
- Penyimpanan data bersama antarmode.
- Konfigurasi fitur yang terlihat pada setiap mode.

### 2. Kalkulator HPP Mudah

Mode pertama untuk membuktikan mesin inti melalui pengalaman pengguna paling sederhana.

- Nama produk dan jumlah produk jadi.
- Bahan baku.
- Harga dan jumlah pembelian.
- Jumlah bahan yang digunakan.
- Total biaya bahan.
- HPP per produk.
- Istilah sederhana dan panduan bertahap.

### 3. Kalkulator HPP Profesional

Memperluas mode Mudah dengan komponen dan kontrol lanjutan.

- Tenaga kerja.
- Kemasan.
- Biaya operasional.
- Penyusutan alat.
- Biaya tidak langsung.
- Waste atau kehilangan bahan.
- Rincian per batch dan per unit.
- Margin dan rekomendasi harga jual.

### 4. Kalkulator Simulasi Usaha

- Simulasi resep sebelum produk dijual.
- Target jumlah produksi.
- Perkiraan biaya awal.
- Skenario harga dan margin.
- Perbandingan skenario sebelum mulai berjualan.

### 5. Kalkulator Estimasi

- Takaran sehari-hari seperti sendok, gelas, dan butir.
- Konversi estimasi ke satuan baku.
- Penanda tingkat kepastian.
- Peringatan bahwa hasil belum sepenuhnya presisi.
- Bantuan memperbaiki takaran secara bertahap.

### 6. Generator Simulasi HPP

- Pemilihan kategori produk.
- Template bahan dasar.
- Contoh resep atau komposisi awal.
- Asumsi jumlah produksi.
- Estimasi harga bahan.
- Penjelasan bahwa hasil merupakan simulasi, bukan angka final.

## Urutan ringkas

```text
Mesin inti
  -> HPP Mudah
  -> HPP Profesional
  -> Simulasi Usaha
  -> Estimasi
  -> Generator Simulasi HPP
```

## Batasan keputusan saat ini

- Login dan register belum menjadi prioritas implementasi.
- Fase 1 dan fase 2 pada branch `main` menjadi baseline stabil.
- Detail kalkulator harus disepakati sebelum implementasi setiap mode.
- Mode tidak boleh memiliki mesin hitung atau format data yang terpisah.

## Implementasi awal

- Satu mesin perhitungan tersedia di `assets/js/hpp-engine.js`.
- Seluruh mode menggunakan state yang sama dan tersimpan di `localStorage`.
- Biaya yang tidak tersedia pada mode aktif tidak ikut dihitung, tetapi datanya tetap disimpan.
- Mode dapat diganti melalui panel Pengaturan.
- Halaman hasil klasifikasi mengarahkan pengguna langsung ke mode rekomendasi.
- Pengujian mesin tersimpan di `tests/hpp-engine.test.js`.

## Asumsi yang perlu divalidasi melalui pengujian pengguna

1. Tenaga kerja, kemasan, utilitas, overhead, dan penyusutan dimasukkan per batch.
2. Waste merupakan persentase dari total biaya bahan.
3. Margin merupakan persentase terhadap harga jual, bukan markup terhadap HPP.
4. Modal bulanan menggunakan target produk dibagi hasil per batch.
5. Konversi takaran rumah tangga ditentukan pengguna; angka panduan hanya contoh.
6. Template Generator tidak dianggap sebagai resep atau harga pasar yang direkomendasikan.
