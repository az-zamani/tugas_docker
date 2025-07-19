const express = require('express');
const pool = require('./db');
const cors = require('cors');
const { verifyToken } = require('./middleware');
const ServiceClient = require('./serviceClient');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Create tables (now with denormalized data)
pool.query(`
  CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username VARCHAR(50) NOT NULL,
    puisi_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, puisi_id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username VARCHAR(50) NOT NULL,
    puisi_id INTEGER NOT NULL,
    isi TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
`);

// Like puisi (protected)
app.post('/like', verifyToken, async (req, res) => {
  const { puisi_id } = req.body;
  
  if (!puisi_id) {
    return res.status(400).json({ error: 'Puisi ID harus diisi' });
  }
  
  try {
    // Verify puisi exists
    const puisiExists = await ServiceClient.verifyPuisiExists(puisi_id);
    if (!puisiExists) {
      return res.status(404).json({ error: 'Puisi tidak ditemukan' });
    }
    
    // Get user details
    const userDetails = await ServiceClient.getUserDetails(req.user.id);
    if (!userDetails) {
      return res.status(400).json({ error: 'User tidak valid' });
    }
    
    await pool.query(
      'INSERT INTO likes (user_id, username, puisi_id) VALUES ($1, $2, $3) ON CONFLICT (user_id, puisi_id) DO NOTHING',
      [req.user.id, userDetails.username, puisi_id]
    );
    
    res.json({ message: 'Berhasil like puisi' });
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ error: 'Gagal like puisi' });
  }
});

// Unlike puisi (protected)
app.post('/unlike', verifyToken, async (req, res) => {
  const { puisi_id } = req.body;
  
  if (!puisi_id) {
    return res.status(400).json({ error: 'Puisi ID harus diisi' });
  }
  
  try {
    const result = await pool.query(
      'DELETE FROM likes WHERE user_id=$1 AND puisi_id=$2', 
      [req.user.id, puisi_id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Like tidak ditemukan' });
    }
    
    res.json({ message: 'Berhasil unlike puisi' });
  } catch (err) {
    console.error('Unlike error:', err);
    res.status(500).json({ error: 'Gagal unlike puisi' });
  }
});

// Get jumlah like puisi
app.get('/like/count/:puisi_id', async (req, res) => {
  const { puisi_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM likes WHERE puisi_id=$1', 
      [puisi_id]
    );
    res.json({ 
      puisi_id: parseInt(puisi_id),
      total: parseInt(result.rows[0].count) 
    });
  } catch (err) {
    console.error('Get like count error:', err);
    res.status(500).json({ error: 'Gagal mengambil jumlah like' });
  }
});

// Check if user liked puisi (protected)
app.get('/like/check/:puisi_id', verifyToken, async (req, res) => {
  const { puisi_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id FROM likes WHERE user_id=$1 AND puisi_id=$2',
      [req.user.id, puisi_id]
    );
    res.json({ 
      liked: result.rows.length > 0 
    });
  } catch (err) {
    console.error('Check like error:', err);
    res.status(500).json({ error: 'Gagal check status like' });
  }
});

// Get likes for a puisi (with user details)
app.get('/like/users/:puisi_id', async (req, res) => {
  const { puisi_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT user_id, username, created_at FROM likes WHERE puisi_id = $1 ORDER BY created_at DESC',
      [puisi_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get likes error:', err);
    res.status(500).json({ error: 'Gagal mengambil daftar like' });
  }
});

// Tambah komentar (protected)
app.post('/komentar', verifyToken, async (req, res) => {
  const { puisi_id, isi } = req.body;
  
  if (!puisi_id || !isi) {
    return res.status(400).json({ error: 'Puisi ID dan isi komentar harus diisi' });
  }
  
  try {
    // Verify puisi exists
    const puisiExists = await ServiceClient.verifyPuisiExists(puisi_id);
    if (!puisiExists) {
      return res.status(404).json({ error: 'Puisi tidak ditemukan' });
    }
    
    // Get user details
    const userDetails = await ServiceClient.getUserDetails(req.user.id);
    if (!userDetails) {
      return res.status(400).json({ error: 'User tidak valid' });
    }
    
    const result = await pool.query(
      'INSERT INTO comments (user_id, username, puisi_id, isi) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, userDetails.username, puisi_id, isi.trim()]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ error: 'Gagal menambah komentar' });
  }
});

// Ambil komentar untuk puisi
app.get('/komentar/:puisi_id', async (req, res) => {
  const { puisi_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM comments WHERE puisi_id = $1 ORDER BY created_at DESC',
      [puisi_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ error: 'Gagal mengambil komentar' });
  }
});

// Delete komentar (protected)
app.delete('/komentar/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check ownership
    const ownership = await pool.query('SELECT user_id FROM comments WHERE id = $1', [id]);
    if (ownership.rows.length === 0) {
      return res.status(404).json({ error: 'Komentar tidak ditemukan' });
    }
    
    if (ownership.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Tidak bisa hapus komentar orang lain' });
    }
    
    await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    res.json({ message: 'Komentar berhasil dihapus' });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ error: 'Gagal hapus komentar' });
  }
});

// Update komentar (protected)
app.put('/komentar/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { isi } = req.body;
  
  if (!isi) {
    return res.status(400).json({ error: 'Isi komentar harus diisi' });
  }
  
  try {
    // Check ownership
    const ownership = await pool.query('SELECT user_id FROM comments WHERE id = $1', [id]);
    if (ownership.rows.length === 0) {
      return res.status(404).json({ error: 'Komentar tidak ditemukan' });
    }
    
    if (ownership.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Tidak bisa edit komentar orang lain' });
    }
    
    const result = await pool.query(
      'UPDATE comments SET isi = $1 WHERE id = $2 RETURNING *',
      [isi.trim(), id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update comment error:', err);
    res.status(500).json({ error: 'Gagal update komentar' });
  }
});

// Get comment count for a puisi
app.get('/komentar/count/:puisi_id', async (req, res) => {
  const { puisi_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM comments WHERE puisi_id = $1',
      [puisi_id]
    );
    res.json({
      puisi_id: parseInt(puisi_id),
      total: parseInt(result.rows[0].count)
    });
  } catch (err) {
    console.error('Get comment count error:', err);
    res.status(500).json({ error: 'Gagal mengambil jumlah komentar' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'reaction-service',
    timestamp: new Date().toISOString()
  });
});

console.log('Reaction Service running...');

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Reaction Service running on port ${PORT}`));