const express = require('express');
const pool = require('./db');
require('dotenv').config();
const app = express();

app.use(express.json());

// Buat tabel jika belum ada
pool.query(`
  CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    puisi_id INTEGER NOT NULL,
    UNIQUE(user_id, puisi_id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    puisi_id INTEGER NOT NULL,
    isi TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
`);

// Like puisi
app.post('/like', async (req, res) => {
  const { user_id, puisi_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO likes (user_id, puisi_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [user_id, puisi_id]
    );
    res.json({ message: 'Liked' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal like' });
  }
});

// Unlike puisi
app.post('/unlike', async (req, res) => {
  const { user_id, puisi_id } = req.body;
  await pool.query('DELETE FROM likes WHERE user_id=$1 AND puisi_id=$2', [user_id, puisi_id]);
  res.json({ message: 'Unliked' });
});

// Get jumlah like puisi
app.get('/like/count/:puisi_id', async (req, res) => {
  const { puisi_id } = req.params;
  const result = await pool.query('SELECT COUNT(*) FROM likes WHERE puisi_id=$1', [puisi_id]);
  res.json({ total: parseInt(result.rows[0].count) });
});

// Tambah komentar
app.post('/komentar', async (req, res) => {
  const { user_id, puisi_id, isi } = req.body;
  const result = await pool.query(
    'INSERT INTO comments (user_id, puisi_id, isi) VALUES ($1, $2, $3) RETURNING *',
    [user_id, puisi_id, isi]
  );
  res.status(201).json(result.rows[0]);
});

// Ambil komentar untuk puisi
app.get('/komentar/:puisi_id', async (req, res) => {
  const { puisi_id } = req.params;
  const result = await pool.query(
    'SELECT * FROM comments WHERE puisi_id = $1 ORDER BY created_at DESC',
    [puisi_id]
  );
  res.json(result.rows);
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Reaction Service running on port ${PORT}`));
