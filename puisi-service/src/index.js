const express = require('express');
const pool = require('./db');
const cors = require('cors');
const { verifyToken } = require('./middleware');
const ServiceClient = require('./serviceClient');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Create puisi table (now stores username as denormalized data)
pool.query(`
  CREATE TABLE IF NOT EXISTS puisi (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username VARCHAR(50) NOT NULL,
    judul TEXT NOT NULL,
    isi TEXT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
  );
`);

// GET all public puisi
app.get('/puisi', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM puisi WHERE is_public = TRUE ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get puisi error:', err);
    res.status(500).json({ error: 'Gagal mengambil puisi' });
  }
});

// GET puisi by ID (single puisi)
app.get('/puisi/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM puisi WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Puisi tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get puisi by ID error:', err);
    res.status(500).json({ error: 'Gagal mengambil puisi' });
  }
});

// GET puisi by user (private + public)
app.get('/puisi/user/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM puisi WHERE user_id = $1 ORDER BY created_at DESC', 
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get user puisi error:', err);
    res.status(500).json({ error: 'Gagal mengambil puisi user' });
  }
});

// POST puisi (protected)
app.post('/puisi', verifyToken, async (req, res) => {
  const { judul, isi, is_public } = req.body;
  
  if (!judul || !isi) {
    return res.status(400).json({ error: 'Judul dan isi harus diisi' });
  }
  
  try {
    // Verify user exists in auth service
    const userDetails = await ServiceClient.getUserDetails(req.user.id);
    if (!userDetails) {
      return res.status(400).json({ error: 'User tidak valid' });
    }
    
    const result = await pool.query(
      'INSERT INTO puisi (user_id, username, judul, isi, is_public) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, userDetails.username, judul.trim(), isi.trim(), is_public ?? true]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create puisi error:', err);
    res.status(500).json({ error: 'Gagal menyimpan puisi' });
  }
});

// PUT puisi (edit, protected)
app.put('/puisi/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { judul, isi, is_public } = req.body;
  
  if (!judul || !isi) {
    return res.status(400).json({ error: 'Judul dan isi harus diisi' });
  }
  
  try {
    // Check ownership
    const ownership = await pool.query('SELECT user_id FROM puisi WHERE id = $1', [id]);
    if (ownership.rows.length === 0) {
      return res.status(404).json({ error: 'Puisi tidak ditemukan' });
    }
    
    if (ownership.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Tidak bisa edit puisi orang lain' });
    }
    
    const result = await pool.query(
      'UPDATE puisi SET judul=$1, isi=$2, is_public=$3 WHERE id=$4 RETURNING *',
      [judul.trim(), isi.trim(), is_public, id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update puisi error:', err);
    res.status(500).json({ error: 'Gagal update puisi' });
  }
});

// DELETE puisi (protected)
app.delete('/puisi/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check ownership
    const ownership = await pool.query('SELECT user_id FROM puisi WHERE id = $1', [id]);
    if (ownership.rows.length === 0) {
      return res.status(404).json({ error: 'Puisi tidak ditemukan' });
    }
    
    if (ownership.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Tidak bisa hapus puisi orang lain' });
    }
    
    await pool.query('DELETE FROM puisi WHERE id = $1', [id]);
    res.json({ message: 'Puisi berhasil dihapus' });
  } catch (err) {
    console.error('Delete puisi error:', err);
    res.status(500).json({ error: 'Gagal hapus puisi' });
  }
});

console.log('Puisi Service running...');

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Puisi Service running on port ${PORT}`));