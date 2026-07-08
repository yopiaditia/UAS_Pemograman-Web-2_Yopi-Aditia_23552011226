export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { eksekusiKueri } from '@/lib/db'; 

// 1. GET: Mengambil semua data kategori dari database
export async function GET() {
  try {
    const kueriAmbil = 'SELECT * FROM kategori ORDER BY id_kategori DESC';
    const daftarKategori = await eksekusiKueri({ kueri: kueriAmbil });
    
    return NextResponse.json({ sukses: true, data: daftarKategori }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ sukses: false, pesan: error.message }, { status: 500 });
  }
}

// 2. POST: Menambahkan kategori baru (Struktur Kolom Sudah Diperbaiki)
export async function POST(request) {
  try {
    const dataTubuh = await request.json();
    const { nama_kategori, jenis } = dataTubuh;

    if (!nama_kategori || !jenis) {
      return NextResponse.json({ sukses: false, pesan: 'Nama kategori dan jenis wajib diisi!' }, { status: 400 });
    }

    const kueriTambah = 'INSERT INTO kategori (nama_kategori, jenis) VALUES (?, ?)';
    const hasilTambah = await eksekusiKueri({
      kueri: kueriTambah,
      nilai: [nama_kategori, jenis],
    });

    return NextResponse.json({
      sukses: true,
      pesan: 'Kategori berhasil ditambahkan!',
      id_baru: hasilTambah.insertId,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ sukses: false, pesan: error.message }, { status: 500 });
  }
}