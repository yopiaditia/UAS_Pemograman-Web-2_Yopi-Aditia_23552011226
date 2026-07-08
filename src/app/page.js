'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, ArrowUpRight, ArrowDownLeft, Wallet, LogIn, LogOut, Lock, User, Edit3, Check, X, DollarSign } from 'lucide-react';

export default function AplikasiDanaBijakFixed() {
  // =========================================================================
  // STATE UTAMA
  // =========================================================================
  const [sudahLogin, setSudahLogin] = useState(false);
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');

  const [daftarTransaksi, setDaftarTransaksi] = useState([]);
  const [daftarKategori, setDaftarKategori] = useState([]);
  
  // State Form Tambah Transaksi Biasa
  const [judul, setJudul] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [idKategori, setIdKategori] = useState('');
  const [tanggal, setTanggal] = useState('');

  // State Form Custom Saldo Awal
  const [customSaldo, setCustomSaldo] = useState('');

  // State Ringkasan Finansial
  const [totalPemasukan, setTotalPemasukan] = useState(0);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);

  // State Khusus Fitur Edit/Update Data
  const [idSedangEdit, setIdSedangEdit] = useState(null);
  const [editJudul, setEditJudul] = useState('');
  const [editJumlah, setEditJumlah] = useState('');
  const [editIdKategori, setEditIdKategori] = useState('');
  const [editTanggal, setEditTanggal] = useState('');

  // =========================================================================
  // AMBIL DATA FROM API
  // =========================================================================
  useEffect(() => {
    if (sudahLogin) {
      muatDataDasbor();
    }
  }, [sudahLogin]);

  const muatDataDasbor = async () => {
    try {
      const responTransaksi = await fetch('/api/transaksi');
      const hasilTransaksi = await responTransaksi.json();
      if (hasilTransaksi.sukses) setDaftarTransaksi(hasilTransaksi.data);

      const responKategori = await fetch('/api/kategori');
      const hasilKategori = await responKategori.json();
      if (hasilKategori.sukses) setDaftarKategori(hasilKategori.data);
    } catch (eror) {
      console.error("Gagal sinkronisasi data:", eror);
    }
  };

  // Kalkulasi Saldo Otomatis (Anti-Bug Kategori Kosong / Kategori Umum)
  useEffect(() => {
    let pemasukan = 0;
    let pengeluaran = 0;
    
    daftarTransaksi.forEach((item) => {
      const nominal = Math.abs(parseFloat(item.jumlah || 0));
      const judulKecil = (item.judul || '').toLowerCase();
      
      if (
        item.jenis === 'pemasukan' || 
        judulKecil.includes('saldo') || 
        judulKecil.includes('suntik') || 
        judulKecil.includes('masuk')
      ) {
        pemasukan += nominal;
        item.jenis = 'pemasukan'; 
      } else {
        pengeluaran += nominal;
        item.jenis = 'pengeluaran'; 
      }
    });
    
    setTotalPemasukan(pemasukan);
    setTotalPengeluaran(pengeluaran);
  }, [daftarTransaksi]);

  // =========================================================================
  // INTERAKSI SISTEM
  // =========================================================================
  const tanganiLogin = async (e) => {
    e.preventDefault();
    try {
      const respon = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inputUsername, password: inputPassword })
      });
      const hasil = await respon.json();
      if (hasil.sukses) setSudahLogin(true);
      else alert("Akses Ditolak: " + hasil.pesan);
    } catch (error) {
      alert('Sistem login bermasalah.');
    }
  };

  // 1. TAMBAH TRANSAKSI (POST)
  const tanganiTambahTransaksi = async (e) => {
    e.preventDefault();
    if (!idKategori || !judul || !jumlah || !tanggal) {
      alert('Mohon lengkapi seluruh kolom formulir!');
      return;
    }
    try {
      const nominalBersih = Math.abs(parseFloat(jumlah)); 
      const respon = await fetch('/api/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_kategori: parseInt(idKategori), judul, jumlah: nominalBersih, tanggal })
      });
      const hasil = await respon.json();
      if (hasil.sukses) {
        setJudul(''); setJumlah(''); setIdKategori(''); setTanggal('');
        muatDataDasbor();
      }
    } catch (eror) {
      alert('Gagal menyimpan transaksi.');
    }
  };

  // 2. INPUT CUSTOM SALDO AWAL (POST)
  const tanganiCustomSaldo = async (e) => {
    e.preventDefault();
    if (!customSaldo || parseFloat(customSaldo) <= 0) {
      alert('Masukkan jumlah saldo nominal yang valid!');
      return;
    }
    try {
      const kategoriPemasukan = daftarKategori.find(k => k.jenis === 'pemasukan') || { id_kategori: 1 };
      const nominalBersih = Math.abs(parseFloat(customSaldo));
      
      const respon = await fetch('/api/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_kategori: kategoriPemasukan.id_kategori,
          judul: 'Pengisian Custom Saldo Utama',
          jumlah: nominalBersih,
          tanggal: new Date().toISOString().split('T')[0]
        })
      });
      const hasil = await respon.json();
      if (hasil.sukses) {
        setCustomSaldo('');
        muatDataDasbor();
        alert('Custom Saldo awal berhasil dimasukkan!');
      }
    } catch (error) {
      alert('Gagal menyuntikkan saldo.');
    }
  };

  // 3. AKTIFKAN MODE EDIT
  const mulaiEditTransaksi = (item) => {
    setIdSedangEdit(item.id_transaksi);
    setEditJudul(item.judul);
    setEditJumlah(Math.abs(item.jumlah));
    setEditIdKategori(item.id_kategori || '');
    const tglFormat = new Date(item.tanggal).toISOString().split('T')[0];
    setEditTanggal(tglFormat);
  };

  // 4. SIMPAN PERUBAHAN EDIT (PUT)
  const tanganiSimpanUpdate = async (id) => {
    try {
      const nominalBersih = Math.abs(parseFloat(editJumlah));
      const respon = await fetch(`/api/transaksi/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_kategori: parseInt(editIdKategori), judul: editJudul, jumlah: nominalBersih, tanggal: editTanggal })
      });
      const hasil = await respon.json();
      if (hasil.sukses) {
        setIdSedangEdit(null);
        muatDataDasbor();
      } else {
        alert(hasil.pesan);
      }
    } catch (error) {
      alert('Gagal memperbarui data.');
    }
  };

  // 5. HAPUS TRANSAKSI (DELETE)
  const tanganiHapusTransaksi = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan transaksi ini?')) return;
    try {
      const respon = await fetch(`/api/transaksi/${parseInt(id)}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const hasil = await respon.json();
      if (hasil.sukses) {
        muatDataDasbor();
      } else {
        alert("Gagal menghapus: " + hasil.pesan);
      }
    } catch (eror) {
      alert('Terjadi kesalahan koneksi saat menghapus data.');
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  // =========================================================================
  // VIEW 1: HALAMAN LOGIN (DENGAN COPYRIGHT)
  // =========================================================================
  if (!sudahLogin) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 px-4 py-6">
        {/* Spacer Atas */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">DanaBijak</h1>
              <p className="text-gray-400 text-sm mt-1">Silakan masuk untuk mengelola keuangan Anda</p>
            </div>
            <form onSubmit={tanganiLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><User size={14} /> Username</label>
                <input type="text" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} placeholder="Masukkan username" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><Lock size={14} /> Password</label>
                <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} placeholder="Masukkan password" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500" required />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2">
                <LogIn size={16} /> Masuk ke Aplikasi
              </button>
            </form>
            <div className="mt-6 text-center text-xs text-gray-400">
              Akun Default: <span className="font-semibold text-gray-600">admin</span> / password: <span className="font-semibold text-gray-600">admin123</span>
            </div>
          </div>
        </div>
        
        {/* COPYRIGHT LOGIN PAGE */}
        <footer className="text-center text-xs font-medium text-gray-400 tracking-wide mt-4">
          &copy; {new Date().getFullYear()} All Rights Reserved &bull; UAS Yopi Aditia (23552011226)
        </footer>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: HALAMAN DASHBOARD MAIN (DENGAN COPYRIGHT)
  // =========================================================================
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
        {/* HEADER BAR */}
        <header className="mb-8 flex items-center justify-between border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">DanaBijak</h1>
            <p className="text-gray-500 text-sm mt-1">Aplikasi Pencatat Keuangan Pribadi Modern</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2">
              <Wallet size={16} /> Mode Pengembang Lokal
            </div>
            <button onClick={() => setSudahLogin(false)} className="bg-rose-50 text-rose-600 p-2.5 rounded-full hover:bg-rose-100 transition-colors cursor-pointer">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* THREE WIDGET CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col justify-between">
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Saldo Bersih</span>
            <h2 className={`text-2xl font-bold mt-2 ${totalPemasukan - totalPengeluaran >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
              {formatRupiah(totalPemasukan - totalPengeluaran)}
            </h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Pemasukan</span>
              <h2 className="text-2xl font-bold text-emerald-600 mt-2">{formatRupiah(totalPemasukan)}</h2>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600"><ArrowUpRight size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Pengeluaran</span>
              <h2 className="text-2xl font-bold text-rose-600 mt-2">{formatRupiah(totalPengeluaran)}</h2>
            </div>
            <div className="bg-rose-50 p-3 rounded-xl text-rose-600"><ArrowDownLeft size={24} /></div>
          </div>
        </div>

        {/* DASHBOARD CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SISI KIRI: INPUT FORM */}
          <div className="space-y-6">
            {/* FORM 1: CUSTOM SALDO AWAL */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 h-fit">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-blue-500" /> Isi Custom Saldo Awal
              </h3>
              <form onSubmit={tanganiCustomSaldo} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nominal Rupiah (Rp)</label>
                  <input type="number" value={customSaldo} onChange={(e) => setCustomSaldo(e.target.value)} placeholder="Contoh: 5000000" className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500" required />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white rounded-xl py-3 font-medium text-sm hover:bg-slate-800 transition-colors cursor-pointer mt-2">
                  Suntik Saldo Utama
                </button>
              </form>
            </div>

            {/* FORM 2: CATAT TRANSAKSI BIASA */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 h-fit">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PlusCircle size={20} className="text-blue-500" /> Catat Transaksi Baru
              </h3>
              <form onSubmit={tanganiTambahTransaksi} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Judul / Keterangan</label>
                  <input type="text" value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Contoh: Beli Makan Siang" className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nominal Rupiah (Rp)</label>
                  <input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} placeholder="Contoh: 15000" className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Pilih Kategori Kelompok</label>
                  <select value={idKategori} onChange={(e) => setIdKategori(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500" required>
                    <option value="">-- Tentukan Kelompok Kategori --</option>
                    {daftarKategori.map((kat) => (
                      <option key={kat.id_kategori} value={kat.id_kategori}>
                        {kat.nama_kategori} ({kat.jenis === 'pemasukan' ? 'UANG MASUK' : 'UANG KELUAR'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tanggal Eksekusi</label>
                  <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500" required />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white rounded-xl py-3 font-medium text-sm hover:bg-slate-800 transition-colors cursor-pointer mt-2">
                  Simpan ke Catatan
                </button>
              </form>
            </div>
          </div>

          {/* SISI KANAN: RIWAYAT TABLE */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Riwayat Aliran Dana</h3>
            {daftarTransaksi.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-2xl">
                Belum ada catatan transaksi keuangan. Masukkan saldo awal pada form di sebelah kiri!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3">Tanggal</th>
                      <th className="pb-3">Deskripsi / Judul</th>
                      <th className="pb-3">Kelompok</th>
                      <th className="pb-3 text-right">Jumlah</th>
                      <th className="pb-3 text-center">Aksi Operasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {daftarTransaksi.map((item) => {
                      const isEditing = idSedangEdit === item.id_transaksi;
                      const tanggalFormat = new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                      
                      return (
                        <tr key={item.id_transaksi} className="hover:bg-gray-50/50 transition-colors">
                          {isEditing ? (
                            <>
                              <td className="py-2"><input type="date" value={editTanggal} onChange={(e) => setEditTanggal(e.target.value)} className="border border-gray-300 rounded-sm p-1 text-xs w-full" /></td>
                              <td className="py-2"><input type="text" value={editJudul} onChange={(e) => setEditJudul(e.target.value)} className="border border-gray-300 rounded-sm p-1 text-xs w-full font-medium" /></td>
                              <td className="py-2">
                                <select value={editIdKategori} onChange={(e) => setEditIdKategori(e.target.value)} className="border border-gray-300 rounded-sm p-1 text-xs w-full bg-white">
                                  {daftarKategori.map(k => (
                                    <option key={k.id_kategori} value={k.id_kategori}>{k.nama_kategori}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2"><input type="number" value={editJumlah} onChange={(e) => setEditJumlah(e.target.value)} className="border border-gray-300 rounded-sm p-1 text-xs w-full text-right" /></td>
                              <td className="py-2 text-center flex items-center justify-center gap-1 mt-1">
                                <button onClick={() => tanganiSimpanUpdate(item.id_transaksi)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-md" title="Simpan Perubahan"><Check size={16} /></button>
                                <button onClick={() => setIdSedangEdit(null)} className="text-gray-400 hover:bg-gray-100 p-1 rounded-md" title="Batal"><X size={16} /></button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-3.5 text-gray-500">{tanggalFormat}</td>
                              <td className="py-3.5 font-medium text-slate-800">{item.judul}</td>
                              <td className="py-3.5">
                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${item.jenis === 'pemasukan' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                  {item.nama_kategori || 'Kategori Umum'}
                                </span>
                              </td>
                              <td className={`py-3.5 text-right font-semibold ${item.jenis === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {item.jenis === 'pemasukan' ? '+' : '-'} {formatRupiah(Math.abs(item.jumlah))}
                              </td>
                              <td className="py-3.5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button onClick={() => mulaiEditTransaksi(item)} className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50" title="Ubah Data / Edit"><Edit3 size={15} /></button>
                                  <button onClick={() => tanganiHapusTransaksi(item.id_transaksi)} className="text-gray-400 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50" title="Hapus Data"><Trash2 size={15} /></button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COPYRIGHT IN DASHBOARD FOOTER */}
      <footer className="text-center text-xs font-medium text-gray-400 tracking-wide py-6 border-t border-gray-200 bg-white mt-12 w-full">
        &copy; {new Date().getFullYear()} All Rights Reserved &bull; UAS Yopi Aditia (23552011226)
      </footer>
    </div>
  );
}