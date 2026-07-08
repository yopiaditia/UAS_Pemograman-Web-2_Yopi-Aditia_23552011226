export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { eksekusiKueri } from '@/lib/db';

// 1. PUT: Mengubah data transaksi berdasarkan ID
export async function PUT(request, context) {
  try {
    const { id } = await context.params; 
    const dataTubuh = await request.json();
    const { id_kategori, judul, jumlah, tanggal } = dataTubuh;

    if (!id_kategori || !judul || !jumlah || !tanggal) {
      return NextResponse.json({ sukses: false, pesan: 'Semua kolom data wajib diisi!' }, { status: 400 });
    }

    const kueriUbah = 'UPDATE transaksi SET id_kategori = ?, judul = ?, jumlah = ?, tanggal = ? WHERE id_transaksi = ?';
    const hasilUbah = await eksekusiKueri({
      kueri: kueriUbah,
      nilai: [id_kategori, judul, jumlah, tanggal, parseInt(id)],
    });

    if (hasilUbah.affectedRows === 0) {
      return NextResponse.json({ sukses: false, pesan: 'Data transaksi tidak ditemukan!' }, { status: 404 });
    }

    return NextResponse.json({ sukses: true, pesan: 'Data transaksi berhasil diperbarui!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ sukses: false, pesan: error.message }, { status: 500 });
  }
}

// 2. DELETE: Menghapus data transaksi berdasarkan ID
export async function DELETE(request, context) {
  try {
    const { id } = await context.params; // Menunggu resolusi objek params secara asinkron

    const kueriHapus = 'DELETE FROM transaksi WHERE id_transaksi = ?';
    const hasilHapus = await eksekusiKueri({
      kueri: kueriHapus,
      nilai: [parseInt(id)],
    });

    if (hasilHapus.affectedRows === 0) {
      return NextResponse.json({ sukses: false, pesan: 'Catatan transaksi tidak ditemukan!' }, { status: 404 });
    }

    return NextResponse.json({ sukses: true, pesan: 'Transaksi berhasil dihapus!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ sukses: false, pesan: error.message }, { status: 500 });
  }
}