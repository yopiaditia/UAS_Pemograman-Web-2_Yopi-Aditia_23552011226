export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { eksekusiKueri } from '@/lib/db'; 

export async function GET() {
  try {
    const kueriAmbil = `
      SELECT t.*, k.nama_kategori, k.jenis 
      FROM transaksi t 
      LEFT JOIN kategori k ON t.id_kategori = k.id_kategori 
      ORDER BY t.tanggal DESC, t.id_transaksi DESC
    `;
    const daftarTransaksi = await eksekusiKueri({ kueri: kueriAmbil });
    return NextResponse.json({ sukses: true, data: daftarTransaksi }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ sukses: false, pesan: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const dataTubuh = await request.json();
    const { id_kategori, judul, jumlah, tanggal } = dataTubuh;

    if (!id_kategori || !judul || !jumlah || !tanggal) {
      return NextResponse.json({ sukses: false, pesan: 'Semua kolom wajib diisi!' }, { status: 400 });
    }

    const kueriTambah = 'INSERT INTO transaksi (id_kategori, judul, jumlah, tanggal) VALUES (?, ?, ?, ?)';
    const hasilTambah = await eksekusiKueri({
      kueri: kueriTambah,
      nilai: [id_kategori, judul, jumlah, tanggal],
    });

    return NextResponse.json({
      sukses: true,
      pesan: 'Transaksi berhasil dicatat!',
      id_baru: hasilTambah.insertId,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ sukses: false, pesan: error.message }, { status: 500 });
  }
}