const { Client, Pool } = require('pg');
require('dotenv').config();

async function initAndSeed() {
  const dbName = process.env.DB_NAME || 'db_festival_panen';
  
  // Buat koneksi sementara ke database bawaan (postgres) 
  const rootClient = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await rootClient.connect();
    // Cek  database db_festival_panen 
    const res = await rootClient.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
    if (res.rows.length === 0) {
      await rootClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" berhasil dibuat!`);
    } else {
      console.log(`Database "${dbName}" sudah ada.`);
    }
  } catch (err) {
    console.error('Gagal membuat database:', err.message);
    process.exit(1);
  } finally {
    await rootClient.end();
  }

  // Hubungkan ke database db_festival_panen dan buat Tabel + Data Dummy
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: dbName,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Sedang membuat tabel dan memasukkan data dummy...');

    // Tabel kategori_panen
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kategori_panen (
          id SERIAL PRIMARY KEY,
          nama_kategori VARCHAR(100) NOT NULL
      );
    `);

    // Tabel warga
    await pool.query(`
      CREATE TABLE IF NOT EXISTS warga (
          id SERIAL PRIMARY KEY,
          nik VARCHAR(16) UNIQUE NOT NULL,
          nama_petani VARCHAR(150) NOT NULL,
          nomor_rt_rw VARCHAR(20) NOT NULL
      );
    `);

    // Tabel hasil_panen
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hasil_panen (
          id SERIAL PRIMARY KEY,
          nama_komoditas VARCHAR(150) NOT NULL,
          kategori_id INT REFERENCES kategori_panen(id) ON DELETE CASCADE,
          warga_id INT REFERENCES warga(id) ON DELETE CASCADE,
          berat_kg DECIMAL(10, 2) NOT NULL,
          kualitas VARCHAR(50) DEFAULT 'Super',
          deskripsi_pameran TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert Data Dummy Kategori & Warga
    await pool.query(`
      INSERT INTO kategori_panen (nama_kategori) 
      VALUES ('Biji-bijian & Pangan Utama')
      ON CONFLICT DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO warga (nik, nama_petani, nomor_rt_rw) 
      VALUES ('3201123456780001', 'Pak Karto', 'RT 01 / RW 02')
      ON CONFLICT DO NOTHING;
    `);

    console.log('Selesai! Database, Tabel, dan Data Dummy siap digunakan.');
  } catch (err) {
    console.error('Detail Gagal:', err.message);
  } finally {
    await pool.end();
  }
}

initAndSeed();