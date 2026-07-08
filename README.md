DanaBijak - Aplikasi Pencatat Keuangan Pribadi Modern (TUTORIAL RUNNING)

Aplikasi DanaBijak adalah platform manajemen keuangan personal berbasis web yang dirancang untuk membantu pengguna mencatat pemasukan, mengelola pengeluaran, dan memantau saldo bersih secara instan. Proyek ini dibangun sebagai bentuk pemenuhan komponen penilaian Ujian Akhir Semester (UAS) untuk program studi Informatika di Universitas Teknologi Bandung.

-------------------------------------------------------------------------------------------------------------------------------------------------

 Identitas Pengembang
 Nama          : Yopi Aditia
 NIM           : 23552011226
 Program Studi : Web Programming 2 
 Institusi     : Universitas Teknologi Bandung

-------------------------------------------------------------------------------------------------------------------------------------------------

Fitur Utama Aplikasi
1. Sistem Autentikasi Pengaman: Halaman gerbang login terproteksi untuk memastikan privasi data keuangan aman.
2. Pengisian Custom Saldo Awal: Formulir khusus untuk menyuntikkan dana atau modal awal ke dalam sistem secara fleksibel.
3. Pencatatan Transaksi Dinamis: Formulir pencatatan transaksi biasa yang terintegrasi dengan dropdown kategori rumpun kelompok database (Uang Masuk / Uang Keluar).
4. Kalkulasi Finansial Otomatis: Widget ringkasan yang otomatis menghitung total pemasukan, total pengeluaran, dan saldo bersih tanpa delay.
5. Manajemen Riwayat Penuh (CRUD): Tabel riwayat aliran dana terintegrasi yang mendukung operasi penambahan (POST), perubahan in-line (Update/PUT), serta penghapusan data secara permanen (Delete).
6. Desain Tata Letak Presisi: Layout antarmuka dikunci khusus untuk resolusi monitor standar 1366 x 768 piksel dengan dukungan fitur internal scroll area agar navigasi tetap rapi dan konsisten.

-------------------------------------------------------------------------------------------------------------------------------------------------

 Spesifikasi Teknologi (Tech Stack)
 Frontend Framework: Next.js v16.2.10 (App Router)
 Compiler/Bundler: Turbopack Engine
 Styling & UI: Tailwind CSS & Lucide React Icons
 Backend Runtime: Next.js API Routes (Serverless Handler)
 Database Management: MySQL 2 (Promise-based) & HeidiSQL Client

-------------------------------------------------------------------------------------------------------------------------------------------------

Struktur Folder 
text
danabijak/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── login/
│   │   │   │   └── route.js        API Handler Autentikasi
│   │   │   ├── kategori/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.js    API Dinamis Kategori (PUT/DELETE)
│   │   │   │   └── route.js        API Utama Kategori (GET/POST)
│   │   │   └── transaksi/
│   │   │       ├── [id]/
│   │   │       │   └── route.js    API Dinamis Transaksi (PUT/DELETE)
│   │   │       └── route.js        API Utama Transaksi (GET/POST)
│   │   ├── globals.css             Pengaturan Tailwind CSS
│   │   └── page.js                 Komponen Antarmuka Utama (Dashboard)
│   └── lib/
│       └── db.js                   Driver Koneksi Database MySQL
├── .next/                          Folder Cache Kompilasi
├── package.json                    Dependensi & Skrip Node.js
└── README.md                       Dokumentasi Proyek UAS


-------------------------------------------------------------------------------------------------------------------------------------------------

CARA MENJALANKAN PROYEK (RUN TUTORIAL)

Langkah 1: Persiapan Kontrol Database (MySQL Via Query Script)

1. Buka aplikasi XAMPP Control Panel atau Laragon, lalu aktifkan (Start) modul Apache dan MySQL.
2. Buka HeidiSQl atau phpMyAdmin (`http://localhost/phpmyadmin`).
3. Hubungkan ke server lokal (localhost).
4. Buka tab Query (di HeidiSQL) atau menu SQL (di phpMyAdmin).
5. Salin (copy) seluruh kode SQL di bawah ini, lalu jalankan/eksekusi (tekan tombol F9 di HeidiSQL atau klik Go/Kirim di phpMyAdmin):

```sql
-- 1. Membuat Database Baru (Jika belum ada)
CREATE DATABASE IF NOT EXISTS `danabijak_db`;
USE `danabijak_db`;

-- 2. Membuat Tabel Pengguna (Users)
CREATE TABLE IF NOT EXISTS `pengguna` (
  `id_pengguna` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nama_lengkap` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Membuat Tabel Kategori (Categories)
CREATE TABLE IF NOT EXISTS `kategori` (
  `id_kategori` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_kategori` VARCHAR(100) NOT NULL,
  `jenis` ENUM('pemasukan', 'pengeluaran') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Membuat Tabel Transaksi (Transactions) dengan Relasi Foreign Key
CREATE TABLE IF NOT EXISTS `transaksi` (
  `id_transaksi` INT AUTO_INCREMENT PRIMARY KEY,
  `id_kategori` INT NOT NULL,
  `judul` VARCHAR(255) NOT NULL,
  `jumlah` DECIMAL(15, 2) NOT NULL,
  `tanggal` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_transaksi_kategori` 
    FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------------------------------------------------------------------------------------
-- JANGAN DIHAPUS: DATA AWAL (SEEDER) UNTUK KEPERLUAN DEMO UAS
-------------------------------------------------------------------------------------------------------------------------------------------------

-- Input Akun Default Login: admin / admin123
INSERT INTO `pengguna` (`username`, `password`, `nama_lengkap`) 
VALUES ('admin', 'admin123', 'Yopi Aditia')
ON DUPLICATE KEY UPDATE `username`=`username`;

-- Input Master Data Kelompok Kategori Awal
INSERT INTO `kategori` (`id_kategori`, `nama_kategori`, `jenis`) VALUES
(1, 'Gaji / Pemasukan Utama', 'pemasukan'),
(2, 'Sampingan / Hiburan Masuk', 'pemasukan'),
(3, 'Makanan & Minuman', 'pengeluaran'),
(4, 'Kebutuhan Kuliah & Kost', 'pengeluaran'),
(5, 'Transportasi & Bensin', 'pengeluaran'),
(6, 'Belanja & Hiburan Keluar', 'pengeluaran')
ON DUPLICATE KEY UPDATE `id_kategori`=`id_kategori`;

-------------------------------------------------------------------------------------------------------------------------------------------------

Langkah 2: Membuka Proyek di Terminal VS Code

1. Buka folder proyek danabijak menggunakan teks editor Visual Studio Code.
2. Buka terminal baru di VS Code dengan menekan kombinasi tombol Ctrl + ~ (atau lewat menu atas Terminal -> New Terminal).
3. Pastikan jalur direktori terminal Anda sudah berada di akar folder proyek.

 Langkah 3: Menginstal Dependensi Node Node.js

Jalankan perintah berikut di terminal untuk memasang pustaka (library) eksternal seperti Tailwind, Lucide Icons, dan MySQL Driver yang dibutuhkan oleh aplikasi:

cmd
npm install

Tunggu proses unduhan hingga selesai dan muncul folder node_modules.

Langkah 4: Pembersihan Cache Kompilasi (Wajib)

Next.js v16 menggunakan mesin Turbopack yang memiliki sistem caching sangat ketat. Agar sistem rute dinamis backend dibaca secara segar tanpa membawa sisa memori eror lama, jalankan perintah ini untuk menghapus folder .next:

cmd
rd /s /q .next

Langkah 5: Menyalakan Server Lokal (Development Mode)

Jalankan perintah utama berikut untuk mengompilasi dan mengaktifkan server lokal Next.js :

cmd
npm run dev

Jika berhasil, terminal akan menampilkan log kompilasi sukses dan memberi tahu bahwa server telah aktif.

Langkah 6: Mengakses Aplikasi di Browser

1. Buka aplikasi peramban Anda (Google Chrome, Microsoft Edge, atau Mozilla Firefox).
2. Ketik dan masuk ke alamat URL berikut:
   http://localhost:3000
3. Halaman Gerbang Login DanaBijak akan langsung terbuka.

Langkah 7: Pengujian Akun Masuk (Demo Kredensial)

ketik data akun default di bawah ini pada form login untuk masuk ke dalam halaman dasbor utama:

 Username: admin
 Password: admin123

-------------------------------------------------------------------------------------------------------------------------------------------------
Copyright © 2026 All Rights Reserved - UAS Yopi Aditia (23552011226)

