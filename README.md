# Patungan Qurban — Buku Tabungan Online

Website sederhana untuk mencatat tabungan patungan qurban 17 peserta.
Data disimpan di Supabase (database gratis), dan situsnya dihosting gratis lewat GitHub Pages.

Isi folder ini:
- `index.html` — halaman website
- `style.css` — desain
- `app.js` — logika (ambil & simpan data ke Supabase)
- `config.js` — **kamu isi sendiri** dengan kunci Supabase-mu
- `supabase-schema.sql` — perintah SQL untuk membuat tabel & data awal

Tidak perlu jago coding untuk beres-in ini. Ikuti langkah-langkah di bawah urut dari atas.

---

## Bagian 1 — Membuat database di Supabase

1. Buka [supabase.com](https://supabase.com) dan daftar/login (bisa pakai akun GitHub).
2. Klik **New project**.
   - Isi nama project, contoh: `patungan-qurban`
   - Buat password database (simpan, tapi tidak akan dipakai lagi setelah ini)
   - Pilih region terdekat (misalnya Singapore)
   - Klik **Create new project**, tunggu sekitar 1-2 menit sampai selesai disiapkan.
3. Setelah project terbuka, klik menu **SQL Editor** di sidebar kiri.
4. Klik **New query**.
5. Buka file `supabase-schema.sql` yang sudah disediakan, salin semua isinya, lalu tempel ke SQL Editor.
6. Klik **Run**. Kalau berhasil akan muncul pesan "Success". Ini otomatis membuat:
   - Tabel `participants` (sudah terisi 17 nama)
   - Tabel `contributions` (kosong, untuk setoran)
   - Tabel `settings` (target tabungan per orang)
7. Ambil kunci API:
   - Klik **Project Settings** (ikon gerigi) di sidebar
   - Klik **Data API**
   - Salin nilai **Project URL** dan **anon public key** — dua nilai ini yang akan kamu masukkan ke `config.js`

---

## Bagian 2 — Mengisi config.js

1. Buka file `config.js` di folder ini dengan text editor apa saja (Notepad, VS Code, dll).
2. Ganti bagian ini:

```js
const SUPABASE_URL = "https://xxxxxxxxxxxxx.supabase.co";
const SUPABASE_ANON_KEY = "isi-anon-key-kamu-di-sini";
```

dengan Project URL dan anon key yang kamu salin tadi. Simpan file.

> Catatan keamanan: anon key ini memang dirancang aman untuk ditaruh di kode frontend (publik). Yang menjaga keamanan datanya adalah aturan RLS (Row Level Security) yang sudah dibuat di `supabase-schema.sql`. Karena situs ini tidak pakai login, siapa pun yang punya link situsnya bisa menambah/menghapus setoran — cocok untuk grup kecil yang saling percaya seperti panitia qurban.

---

## Bagian 3 — Mengunggah ke GitHub

1. Buka [github.com](https://github.com), daftar/login.
2. Klik tombol **+** di kanan atas → **New repository**.
   - Nama repo, contoh: `patungan-qurban`
   - Pilih **Public**
   - Jangan centang "Add a README" (kita sudah punya)
   - Klik **Create repository**
3. Di halaman repo yang masih kosong, klik **uploading an existing file**.
4. Seret (drag & drop) semua file di folder ini: `index.html`, `style.css`, `app.js`, `config.js`, `supabase-schema.sql`, `README.md`.
5. Scroll ke bawah, klik **Commit changes**.

---

## Bagian 4 — Mengaktifkan GitHub Pages (hosting gratis)

1. Di repo yang sama, klik tab **Settings**.
2. Di sidebar kiri, klik **Pages**.
3. Di bagian **Build and deployment** → **Branch**, pilih `main` dan folder `/ (root)`.
4. Klik **Save**.
5. Tunggu sekitar 1 menit, refresh halaman. Akan muncul link seperti:

```
https://namakamu.github.io/patungan-qurban/
```

6. Buka link itu — situs kamu sudah live! Bagikan link ini ke semua peserta patungan qurban.

---

## Bagian 5 — Cara pakai situsnya

- **Dashboard**: menampilkan total tabungan semua orang, progress menuju target, dan status "lunas" per peserta.
- **Input data**: pilih nama, masukkan jumlah setoran, klik "Stempel setoran" — otomatis tersimpan dan langsung terlihat di dashboard. Ada juga riwayat semua setoran yang bisa dihapus kalau salah input.
- **Pengaturan**: ubah target tabungan per orang (default Rp2.600.000, sesuaikan dengan harga qurban tahun ini).

---

## Kalau ingin update tampilan/logika nanti

Edit file `index.html`, `style.css`, atau `app.js` langsung di GitHub (klik file → ikon pensil → edit → Commit changes). Situsnya akan otomatis update dalam 1 menit setelah commit, tidak perlu setting ulang.

## Troubleshooting

- **Dashboard kosong / muncul pesan gagal memuat data** → cek lagi `config.js`, pastikan URL dan anon key sudah benar dan tidak ada spasi tambahan.
- **Nama peserta tidak muncul** → pastikan langkah menjalankan `supabase-schema.sql` di Bagian 1 sudah selesai tanpa error.
- **Ingin tambah/kurangi peserta** → buka Supabase → Table Editor → tabel `participants` → tambah/hapus baris langsung dari situ.
