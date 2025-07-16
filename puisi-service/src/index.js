const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

// Buat tabel jika belum ada
pool.query(`
  CREATE TABLE IF NOT EXISTS puisi (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    judul TEXT NOT NULL,
    isi TEXT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
  );
`);

// GET all public puisi
app.get('/puisi', async (req, res) => {
  const result = await pool.query('SELECT * FROM puisi WHERE is_public = TRUE ORDER BY created_at DESC');
  res.json(result.rows);
});

// GET puisi by user (private + public)
app.get('/puisi/user/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const result = await pool.query('SELECT * FROM puisi WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
  res.json(result.rows);
});

// POST puisi
app.post('/puisi', async (req, res) => {
  const { user_id, judul, isi, is_public } = req.body;
  const result = await pool.query(
    'INSERT INTO puisi (user_id, judul, isi, is_public) VALUES ($1, $2, $3, $4) RETURNING *',
    [user_id, judul, isi, is_public ?? true]
  );
  res.status(201).json(result.rows[0]);
});

// PUT puisi (edit)
app.put('/puisi/:id', async (req, res) => {
  const { id } = req.params;
  const { judul, isi, is_public } = req.body;
  const result = await pool.query(
    'UPDATE puisi SET judul=$1, isi=$2, is_public=$3 WHERE id=$4 RETURNING *',
    [judul, isi, is_public, id]
  );
  res.json(result.rows[0]);
});

// DELETE puisi
app.delete('/puisi/:id', async (req, res) => {
  await pool.query('DELETE FROM puisi WHERE id = $1', [req.params.id]);
  res.json({ message: 'Puisi dihapus' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Puisi Service running on port ${PORT}`));
