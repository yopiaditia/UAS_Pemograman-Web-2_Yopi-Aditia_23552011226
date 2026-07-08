import mysql from 'mysql2/promise';

export async function eksekusiKueri({ kueri, nilai = [] }) {
  const koneksi = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'danabijak_db', 
  });

  try {
    const [hasil] = await koneksi.execute(kueri, nilai);
    await koneksi.end();
    return hasil;
  } catch (error) {
    await koneksi.end();
    throw new Error(`Gagal mengeksekusi kueri database: ${error.message}`);
  }
}