const express = require('express');
const pool = require('./config/db');
require('dotenv').config();

const app = express();
app.use(express.json());

// 1. GET: Ambil semua data hasil panen
app.get('/api/hasil-panen', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hasil_panen ORDER BY id ASC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET: Ambil data hasil panen berdasarkan ID
app.get('/api/hasil-panen/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM hasil_panen WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data panen tidak ditemukan' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. GET: Cari data berdasarkan nama komoditas
app.get('/api/hasil-panen/nama/:nama', async (req, res) => {
  const { nama } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM hasil_panen WHERE nama_komoditas ILIKE $1',
      [`%${nama}%`]
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. POST: Tambah pameran panen warga baru
app.post('/api/hasil-panen', async (req, res) => {
  const { nama_komoditas, kategori_id, warga_id, berat_kg, kualitas, deskripsi_pameran } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO hasil_panen (nama_komoditas, kategori_id, warga_id, berat_kg, kualitas, deskripsi_pameran)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nama_komoditas, kategori_id, warga_id, berat_kg, kualitas, deskripsi_pameran]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. PUT: Update data pameran panen berdasarkan ID
app.put('/api/hasil-panen/:id', async (req, res) => {
  const { id } = req.params;
  const { nama_komoditas, kategori_id, warga_id, berat_kg, kualitas, deskripsi_pameran } = req.body;
  try {
    const result = await pool.query(
      `UPDATE hasil_panen 
       SET nama_komoditas = $1, kategori_id = $2, warga_id = $3, berat_kg = $4, kualitas = $5, deskripsi_pameran = $6 
       WHERE id = $7 RETURNING *`,
      [nama_komoditas, kategori_id, warga_id, berat_kg, kualitas, deskripsi_pameran, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data panen tidak ditemukan' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. DELETE: Hapus data pameran panen berdasarkan ID
app.delete('/api/hasil-panen/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM hasil_panen WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data panen tidak ditemukan' });
    }
    res.status(200).json({ success: true, message: 'Data pameran panen berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server Festival Panen berjalan di port ${PORT}`);
});