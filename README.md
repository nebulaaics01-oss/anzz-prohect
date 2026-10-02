## ANZZ PROJECT — Template Publik

Template publik Cupz Project dengan tampilan modern, akun pengguna, sistem kredit, dan halaman pengelola.

> **Catatan penting:** template ini tidak menyertakan password, token rahasia, file `.env`, atau kunci milik pembuat. Setiap orang yang memakai template wajib menggunakan akun Supabase miliknya sendiri.

---

## ✨ Fitur

- Tampilan website responsif untuk HP dan desktop
- Daftar akun dan masuk
- Fitur utama terkunci sebelum pengguna masuk
- Fitur utama terkunci jika kredit habis
- Setiap penggunaan fitur mengurangi **1 kredit**
- Kredit tersimpan di database
- Kredit diisi ulang otomatis setiap **00:00 WIB**
- Saldo diperbarui otomatis tanpa perlu keluar-masuk akun
- Akun pengelola untuk mengatur kredit pengguna
- Statistik dan riwayat penggunaan yang tersedia di template
- Siap dipasang melalui **GitHub → Vercel → Supabase**

---

# 🚀 CARA PASANG — GITHUB → VERCEL → SUPABASE

Ikuti urutan ini. Tidak perlu mengubah kode jika hanya ingin memasang template.

---

## 1. Yang perlu disiapkan

Buat akun gratis di:

- GitHub — untuk menyimpan kode
- Vercel — untuk menjalankan website
- Supabase — untuk akun dan database

Untuk pengujian di komputer, Node.js versi LTS juga disarankan, tetapi **tidak wajib** jika langsung memakai Vercel.

---

# 2. Upload template ke GitHub

### Cara paling mudah

1. Login ke GitHub.
2. Pilih **New repository**.
3. Beri nama repository, misalnya `cupz-am-template`.
4. Buat repository.
5. Upload **isi folder `aligtht-motion-v2`**, bukan ZIP-nya.
6. Commit perubahan.

### Jangan upload

```text
.env
node_modules/
```

`.env.example` boleh dan memang disediakan sebagai contoh.

### Jika memakai Git

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
git push -u origin main
```

Ganti `USERNAME` dan `NAMA-REPOSITORY` dengan milik sendiri.

---

# 3. Buat database di Supabase

1. Login ke Supabase.
2. Pilih **New project**.
3. Buat project baru.
4. Tunggu sampai project siap.
5. Buka **SQL Editor**.
6. Dari repository GitHub, buka:

```text
supabase/professional_auth_credits.sql
```

7. Copy semua isinya.
8. Paste ke SQL Editor Supabase.
9. Klik **Run**.

Jika ingin memakai statistik tambahan yang tersedia di template, jalankan juga:

```text
supabase/activation_stats.sql
```

### Apa yang dibuat oleh SQL?

SQL membuat bagian yang diperlukan untuk:

- akun pengguna
- nama dan email pengguna
- jenis akun pengguna/pengelola
- jumlah kredit
- jumlah kredit harian
- waktu pengisian ulang
- pengurangan kredit
- perubahan kredit oleh pengelola
- keamanan akses database

Kamu tidak perlu membuat tabel tersebut secara manual.

---

# 4. Ambil informasi project Supabase

Di Supabase buka:

**Project Settings → API**

Siapkan tiga nilai berikut:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Contoh bentuknya:

```text
SUPABASE_URL=https://contoh-project.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

> **Sangat penting:** `SUPABASE_SERVICE_ROLE_KEY` adalah kunci rahasia. Jangan masukkan ke file HTML, JavaScript frontend, GitHub, screenshot, atau kirimkan kepada orang lain.

---

# 5. Hubungkan GitHub ke Vercel

1. Login ke Vercel.
2. Klik **Add New → Project**.
3. Pilih repository GitHub yang tadi dibuat.
4. Klik **Import**.
5. Biarkan konfigurasi build mengikuti repository.
6. Jangan deploy dulu jika Environment Variables belum diisi.

---

# 6. Masukkan Environment Variables di Vercel

Di project Vercel buka:

**Settings → Environment Variables**

Tambahkan:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Masukkan nilai dari project Supabase milik sendiri.

Aktifkan untuk environment yang diperlukan, biasanya:

- Production
- Preview
- Development

Setelah selesai, lakukan **Redeploy**.

---

# 7. Atur alamat website di Supabase

Setelah Vercel memberikan alamat seperti:

```text
https://nama-project.vercel.app
```

buka Supabase:

**Authentication → URL Configuration**

Isi alamat website Vercel sebagai URL utama.

Jika konfigurasi Auth meminta Redirect URL, tambahkan URL Vercel tersebut juga.

Jika nanti memakai domain sendiri, tambahkan domain tersebut dengan cara yang sama.

---

# 8. Buat akun pertama

Buka website Vercel.

Klik **Daftar**, lalu masukkan email dan password.

Jika Supabase meminta konfirmasi email, buka email konfirmasi terlebih dahulu.

Setelah akun berhasil dibuat, akun tersebut awalnya adalah akun pengguna biasa.

---

# 9. Jadikan akun pertama sebagai Pengelola

Di Supabase buka **SQL Editor** dan jalankan:

```sql
UPDATE public.profiles
SET role = 'admin',
    daily_credits = 100,
    credits = 100
WHERE email = 'EMAIL_KAMU';
```

Ganti:

```text
EMAIL_KAMU
```

dengan email akun yang tadi dibuat.

Contoh:

```sql
UPDATE public.profiles
SET role = 'admin',
    daily_credits = 100,
    credits = 100
WHERE email = 'admin@email.com';
```

Keluar dari website lalu masuk kembali agar tampilan pengelola muncul.

---

# 10. Cara kerja kredit

Contoh pengaturan:

```text
Kredit harian: 10
```

Saat pengguna memakai fitur:

```text
10 → 9 → 8 → 7 → ... → 1 → 0
```

Saat saldo menjadi `0`, fitur akan dikunci.

Pengguna akan melihat informasi bahwa kredit sudah habis dan menunggu pengisian ulang.

---

# 11. Pengisian ulang 00:00 WIB

Pengisian ulang menggunakan zona waktu:

```text
Asia/Jakarta
```

Jadi bukan berdasarkan zona waktu HP atau komputer pengguna.

Misalnya kredit harian pengguna adalah `10`:

```text
23:59 WIB → 0 kredit
00:00 WIB → kembali menjadi 10 kredit
```

Website juga memperbarui saldo secara otomatis ketika hari berganti.

### Mengubah jumlah kredit harian

Pengaturan awal ditentukan pada kolom:

```text
daily_credits
```

Contoh mengubah pengguna menjadi 50 kredit per hari:

```sql
UPDATE public.profiles
SET daily_credits = 50,
    credits = 50
WHERE email = 'user@email.com';
```

---

# 12. Mengatur kredit pengguna

Akun pengelola dapat menggunakan bagian pengaturan kredit yang tersedia di website.

Pengelola dapat memberikan atau mengurangi kredit sesuai kebutuhan.

Contoh:

```text
+10  → tambah 10 kredit
-5   → kurangi 5 kredit
```

Jangan memberikan `SUPABASE_SERVICE_ROLE_KEY` kepada pengelola atau pengguna. Kunci tersebut tetap berada di Vercel.

---

# 13. Aturan akses fitur

Urutannya adalah:

```text
Belum masuk
    ↓
Fitur terkunci

Sudah masuk
    ↓
Kredit tersedia?
    ├── Ya  → Fitur dapat digunakan
    └── Tidak → Fitur terkunci

Fitur berhasil digunakan
    ↓
Kredit -1
```

Pengecekan dilakukan pada sisi server sehingga mengganti angka kredit melalui Developer Tools browser tidak membuat pengguna mendapatkan kredit tambahan.

---

# 14. Pengujian setelah deployment

Setelah Vercel aktif, cek:

### Tes 1 — Daftar

- Klik Daftar.
- Buat akun.
- Pastikan akun dapat masuk.

### Tes 2 — Pengguna belum masuk

- Keluar.
- Buka bagian fitur.
- Pastikan fitur terkunci.

### Tes 3 — Kredit tersedia

- Masuk sebagai pengguna.
- Pastikan saldo muncul.
- Jalankan fitur.
- Pastikan saldo berkurang 1.

### Tes 4 — Kredit habis

Untuk pengujian, ubah saldo menjadi 0 melalui database.

Pastikan fitur terkunci.

### Tes 5 — Pengelola

- Masuk sebagai akun pengelola.
- Pastikan menu pengaturan kredit muncul.
- Ubah saldo pengguna.
- Pastikan saldo pengguna berubah.

### Tes 6 — Reset harian

Reset berjalan berdasarkan tanggal **Asia/Jakarta**. Tidak perlu mengubah jam perangkat pengguna.

---

# 15. Pengujian lokal (opsional)

Jika ingin menjalankan di komputer:

```bash
npm install
npm start
```

Kemudian buka:

```text
http://localhost:3300
```

Buat file `.env` berdasarkan `.env.example`:

```env
SUPABASE_URL=https://PROJECT.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Jangan upload `.env` ke GitHub.**

---

# 16. Update website setelah perubahan

Jika repository sudah terhubung ke Vercel, setiap push baru ke branch utama dapat memicu deployment baru.

Contoh:

```bash
git add .
git commit -m "Update website"
git push
```

Vercel akan mengambil perubahan dari GitHub.

---

# 17. Struktur folder

```text
aligtht-motion-v2/
├── app/
│   └── api/
│       ├── account/
│       ├── admin/
│       ├── auto/
│       ├── send-link/
│       ├── verify-link/
│       ├── status/
│       └── stats/
├── lib/
│   ├── auth.js
│   ├── credits.js
│   ├── supabase.js
│   └── ...
├── public/
│   ├── index.html
│   └── donation-qr.jpg
├── supabase/
│   ├── professional_auth_credits.sql
│   └── activation_stats.sql
├── am.js
├── server.js
├── package.json
├── vercel.json
└── .env.example
```

---

# 18. Istilah yang akan dilihat pengguna

Website sengaja memakai bahasa sederhana.

| Istilah teknis | Istilah di tampilan |
|---|---|
| Authentication | Akun / Masuk |
| User | Pengguna |
| Admin | Pengelola |
| Credits | Kredit |
| Database | Data akun / data sistem |
| API | Layanan sistem |
| Transaction | Riwayat aktivitas |
| Endpoint | Layanan |
| Error server | Terjadi masalah, coba lagi |

Detail teknis tetap ada di kode dan dokumentasi untuk pemilik template, tetapi tidak perlu ditampilkan kepada pengguna biasa.

---

# 19. Troubleshooting

## Login tidak bisa

Periksa:

1. Environment Variables Vercel sudah benar.
2. Supabase URL sudah benar.
3. Kunci Supabase tidak salah.
4. URL Vercel sudah dimasukkan di konfigurasi Authentication.
5. Akun sudah melakukan konfirmasi email jika diwajibkan.

Setelah mengubah Environment Variables, lakukan **Redeploy**.

## Website tampil tetapi akun tidak bisa digunakan

Pastikan SQL berikut sudah dijalankan:

```text
supabase/professional_auth_credits.sql
```

## Kredit tidak berkurang

Pastikan:

- pengguna benar-benar masuk;
- saldo lebih dari 0;
- Environment Variables server benar;
- deployment Vercel sudah diperbarui.

## Menu pengelola tidak muncul

Pastikan akun memiliki:

```text
role = admin
```

di `public.profiles`.

## Service Role Key error

Jangan taruh kunci tersebut di frontend. Masukkan hanya melalui:

**Vercel → Settings → Environment Variables**

---

# 20. Keamanan template publik

Sebelum repository dibuat publik, pastikan tidak ada:

```text
.env
password
private key
service role key
access token
secret token
node_modules/
```

Jika sebuah credential pernah ter-upload ke GitHub, **jangan hanya menghapus file tersebut**. Credential yang sudah terekspos sebaiknya segera di-rotate/revoke dari layanan asalnya.

---

# 21. Checklist sebelum membagikan template

- [ ] `.env` tidak ada di repository
- [ ] `.env.example` tersedia
- [ ] Tidak ada credential pribadi
- [ ] Tidak ada password pribadi
- [ ] Repository dapat di-clone
- [ ] SQL Supabase tersedia
- [ ] README ini tersedia
- [ ] Vercel dapat melakukan deployment
- [ ] Register dapat digunakan
- [ ] Login dapat digunakan
- [ ] Fitur terkunci sebelum login
- [ ] Fitur terkunci ketika kredit 0
- [ ] Penggunaan mengurangi 1 kredit
- [ ] Pengisian ulang menggunakan 00:00 WIB
- [ ] Pengelola dapat mengatur kredit

---

# 22. Ringkasan paling singkat

```text
1. Upload project ke GitHub
2. Buat Supabase Project
3. Jalankan professional_auth_credits.sql
4. Hubungkan GitHub ke Vercel
5. Masukkan 3 Environment Variables di Vercel
6. Atur URL website di Supabase Authentication
7. Deploy
8. Daftar akun
9. Jadikan akun pertama sebagai pengelola
10. Atur kredit
11. Website siap digunakan
```

---

## Lisensi

Lihat file `LICENSE` yang disertakan dalam repository.

## Catatan

Template ini ditujukan untuk penggunaan yang sah dan untuk layanan/fungsi yang memang pengguna berhak jalankan. Pastikan penggunaan setiap integrasi pihak ketiga mematuhi ketentuan layanan penyedia terkait.


## Fitur Pengelola: Maintenance & Broadcast

### Maintenance
1. Login sebagai akun Pengelola.
2. Buka **Pusat Pengelola**.
3. Aktifkan **Maintenance**.
4. Tulis pesan yang ingin ditampilkan.
5. Klik **SIMPAN MAINTENANCE**.

Saat maintenance aktif:
- Semua pengunjung melihat layar maintenance.
- Fitur aktivasi tidak dapat dijalankan.
- Endpoint aktivasi juga menolak permintaan di server dengan status maintenance.
- Setelah maintenance dimatikan, fitur kembali tersedia sesuai login dan kredit pengguna.

### Broadcast
1. Buka **Pusat Pengelola → Broadcast / Pengumuman**.
2. Aktifkan **Tampilkan broadcast**.
3. Isi judul dan isi pengumuman.
4. Klik **TERBITKAN BROADCAST**.

Broadcast muncul sebagai popup. Pengguna dapat menutupnya dengan tombol **×**. Setiap broadcast memiliki ID baru sehingga pengumuman baru akan muncul kembali meskipun pengguna pernah menutup broadcast sebelumnya.

### Nama Website
Nama publik template ini adalah **ANZZ PROJECT**. Credential Supabase milik pembuat template tidak disertakan. Setiap pengguna template wajib memakai project Supabase miliknya sendiri.

## 🛡️ PANEL PENGELOLA ANZZ PROJECT

Template ini menyediakan panel pengelola bergaya dashboard SaaS modern di:

`/admin`

Panel hanya dapat digunakan oleh akun yang memiliki `role = admin` pada tabel `profiles` di Supabase.

### Fitur panel

- Ringkasan jumlah pengguna
- Total kredit seluruh pengguna
- Status website Online / Maintenance
- Daftar pengguna dengan pencarian
- Lihat ID akun, email, role, kredit, dan kredit harian
- Tambah / kurangi kredit pengguna
- Atur kredit harian yang akan digunakan saat reset 00:00 WIB
- Maintenance ON/OFF
- Pesan maintenance
- Broadcast ON/OFF
- Judul dan isi broadcast
- Broadcast tampil sebagai popup pada halaman pengguna dan dapat ditutup dengan tombol `×`

### Membuka panel

Login menggunakan akun pengelola, kemudian buka:

`https://DOMAIN-KAMU.vercel.app/admin`

Jika akun bukan pengelola, akses akan ditolak dan pengguna diarahkan kembali ke halaman utama.

### Membuat pengelola pertama

Setelah akun dibuat melalui halaman login, jalankan SQL berikut di Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin',
    credits = 100,
    daily_credits = 100
WHERE email = 'EMAIL_KAMU';
```

Ganti `EMAIL_KAMU` dengan email akun yang digunakan.

### Mengatur kredit harian

Di panel:

1. Buka **Pengguna**.
2. Pilih pengguna.
3. Klik **Atur Kredit**.
4. Masukkan perubahan kredit jika diperlukan.
5. Isi **Kredit Harian** dengan jumlah yang ingin diberikan setelah reset.
6. Simpan.

Kredit harian akan digunakan ketika tanggal di zona `Asia/Jakarta` berganti setelah pukul 00:00 WIB.

### Maintenance

Buka menu **Maintenance**, aktifkan tombol, isi pesan, lalu simpan.

Ketika maintenance aktif:

- Pengguna tetap dapat login.
- Halaman utama tetap dapat dibuka.
- Fitur aktivasi tidak dapat dijalankan.
- API aktivasi juga menolak permintaan dengan status maintenance.
- Pengelola tetap dapat masuk ke `/admin` untuk mematikan maintenance.

### Broadcast

Buka menu **Broadcast**, aktifkan broadcast, masukkan judul dan isi pesan, lalu terbitkan.

Pengguna akan melihat pengumuman sebagai popup. Popup memiliki tombol `×` sehingga pengguna dapat menutupnya.

### Keamanan

Jangan pernah memasukkan `SUPABASE_SERVICE_ROLE_KEY` ke file frontend, GitHub, atau kode JavaScript di folder `public`. Secret hanya boleh berada di Environment Variables Vercel/server.


## Akses Panel Pengelola

Panel pengelola **tidak ditampilkan sebagai tombol di website pengguna**. URL panel adalah `/admin` dan tidak memakai `.html`.

Akun pengelola yang berhasil login akan menerima sesi admin server-side yang aman. Jika akun bukan pengelola, `/admin` mengembalikan 404 dan seluruh endpoint `/api/admin/*` tetap menolak akses. Jangan membagikan URL panel sebagai navigasi publik.

> Catatan: karena login Supabase menyimpan sesi di browser, buka website dan login sebagai akun pengelola terlebih dahulu. Setelah `/api/account/me` memverifikasi role pengelola, buka `/admin`.
