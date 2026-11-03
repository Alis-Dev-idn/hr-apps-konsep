# Prototipe Konsep Upajiwa HRIS & Payroll SaaS

> Repositori Prototipe Interaktif HTML Upajiwa HRIS & Payroll SaaS

Repositori ini memuat implementasi prototipe interaktif konsep antarmuka dan alur kerja aplikasi **Upajiwa HRIS & Payroll SaaS** — platform manajemen SDM, presensi, dan penggajian otomatis berstandar regulasi ketenagakerjaan Indonesia.

---

## 🌿 Arah Desain: Living Forest Canvas

Antarmuka Upajiwa mengusung tema **Living Forest Canvas** yang teduh, berwibawa, dan modern (merujuk pada `assets/Dashboard.png`, `assets/colors.png`, dan `assets/icon.png`):
- **Warna Utama (Brand Primary):** Deep Emerald (`#0D6840`)
- **Latar Belakang Canvas:** Sage Mint Canvas (`#E8F4EC`)
- **Aksen:** Warm Ochre (`#D97706`) & Bright Mint (`#10B981`)
- **Teks Utama:** Charcoal Forest (`#13231B`) & Forest Muted (`#567364`)
- **Tipografi:** Plus Jakarta Sans (Headings) & Inter (Body/Data)
- **Filosofi Sudut:** *Zero Sharp Corners* (`rounded-3xl` / `rounded-2xl`)

---

## 📁 Struktur Berkas Prototipe

```text
.
├── index.html           # Portal Masuk & Quick Login Demo (Admin vs Karyawan)
├── dashboard.html       # Dashboard Eksekutif Admin & ESS Karyawan
├── pegawai.html         # Direktori 20 Pegawai, Tambah Karyawan, & Impor CSV
├── detail-pegawai.html  # Detail Penuh Karyawan (Tab Payroll & Presensi 12 Bulan)
├── absensi.html         # Input Presensi Harian Admin & Riwayat Presensi Mandiri ESS
├── payroll.html         # Kalkulasi Penggajian, Potongan Dinamis, & Kunci Payroll
├── laporan.html         # Laporan Eksekutif & Export Excel Freeze Panes SheetJS
├── pricing.html         # Paket Pro (Rp 12.500/karyawan) & Paket Enterprise
├── settings.html        # Pengaturan Profil Pengguna & Upload Avatar
├── layout.js            # Injeksi Shell Navigasi, Modal, Dialog Konfirmasi, & Slip A4
├── style.css            # Desain Living Forest Canvas & Konfigurasi Print Media A4
├── mock-data.js         # Dataset 20 Karyawan, Riwayat 12 Bulan, & Analitik
├── template-pegawai-upajiwa.csv # Format Sampel Impor CSV
├── assets/              # Aset Visual Resmi
│   ├── icon.png         # Lambang Resmi Daun Bertingkat Upajiwa
│   ├── colors.png       # Referensi Palet Desain
│   └── Dashboard.png    # Referensi Desain Layout Utama
└── README.md            # Dokumentasi Repositori Prototipe Konsep
```

---

## 🚀 Panduan Menjalankan Prototipe Secara Lokal

Prototipe ini dibangun dengan arsitektur **Multi-Page Modular Vanilla JS & Tailwind CSS** yang dapat dibuka langsung tanpa perlu menginstal dependensi backend maupun web server (kompatibel penuh dengan protokol `file:///`):

1. Kloning repositori ini:
   ```bash
   git clone https://github.com/Alis-Dev-idn/hr-apps-konsep.git
   ```
2. Buka berkas `index.html` langsung melalui peramban web modern (Google Chrome, Microsoft Edge, Safari, Firefox) via klik ganda atau *drag-and-drop*.
3. Gunakan pintas masuk cepat:
   - **HR Admin (Sarah Jenkins):** Akses penuh operasional SDM, absensi harian, kalkulasi payroll, dan laporan eksekutif.
   - **Karyawan (Budi Santoso):** Portal mandiri ESS, riwayat presensi keluar-masuk, dan arsip slip gaji resmi A4.

---

## 📄 Lisensi & Hak Cipta
&copy; 2026 PT Maju Bersama Sejahtera / Upajiwa SaaS. Hak Cipta Dilindungi Undang-Undang.
