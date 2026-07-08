export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { eksekusiKueri } from '@/lib/db'; 

export async function POST(request) {
  try {
    const dataTubuh = await request.json();
    const { username, password } = dataTubuh;

    if (!username || !password) {
      return NextResponse.json({ sukses: false, pesan: 'Username dan password wajib diisi!' }, { status: 400 });
    }

    const kueriCari = 'SELECT * FROM pengguna WHERE username = ?';
    const hasilCari = await eksekusiKueri({ kueri: kueriCari, nilai: [username] });

    if (hasilCari.length === 0) {
      return NextResponse.json({ sukses: false, pesan: 'Username tidak ditemukan!' }, { status: 401 });
    }

    const akunDitemukan = hasilCari[0];

    if (password !== akunDitemukan.password) {
      return NextResponse.json({ sukses: false, pesan: 'Password salah!' }, { status: 401 });
    }

    return NextResponse.json({
      sukses: true,
      pesan: 'Login berhasil!',
      pengguna: { id: akunDitemukan.id_pengguna, username: akunDitemukan.username }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ sukses: false, pesan: error.message }, { status: 500 });
  }
}