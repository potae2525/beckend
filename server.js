// server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ตั้งค่าการเชื่อมต่อฐานข้อมูล
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// ✅ ทดสอบเชื่อมต่อ DB
app.get('/ping', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT NOW() AS now');
    res.json({ status: 'ok', time: rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ GET /users - ดึงผู้ใช้ทั้งหมด
app.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, firstname, fullname, lastname, username, status FROM tbl_users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed' });
  }
});

// ✅ GET /users/:id - ดึงผู้ใช้ตาม id
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT id, firstname, fullname, lastname, username, status FROM tbl_users WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed' });
  }
});

// ✅ POST /users - เพิ่มผู้ใช้ใหม่ พร้อม hash password
app.post('/users', async (req, res) => {
  const { firstname, fullname, lastname, username, password, status } = req.body;

  if (!firstname || !username || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO tbl_users (firstname, fullname, lastname, username, password, status) VALUES (?, ?, ?, ?, ?, ?)',
      [firstname, fullname, lastname, username, hashedPassword, status]
    );

    res.json({
      message: 'User added successfully',
      id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

// ✅ PUT /users/:id - แก้ไขผู้ใช้ พร้อม hash password
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'No data provided in request body' });
  }

  const { firstname, fullname, lastname, username, password, status } = req.body;

  try {
    const [exist] = await db.query('SELECT * FROM tbl_users WHERE id = ?', [id]);
    if (exist.length === 0) return res.status(404).json({ message: 'User not found' });

    let query = `UPDATE tbl_users 
                 SET firstname = ?, fullname = ?, lastname = ?, username = ?, status = ?`;
    const params = [firstname, fullname, lastname, username, status];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = ?`;
      params.push(hashedPassword);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    const [result] = await db.query(query, params);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// 🚫 PUT /users - ถ้าไม่มี id จะตอบกลับชัดเจน
app.put('/users', (req, res) => {
  res.status(400).json({ error: 'Please specify user ID, e.g. /users/1' });
});

// ✅ DELETE /users/:id - ลบผู้ใช้
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM tbl_users WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });

    res.json({ message: `User with id ${id} deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// ✅ เริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
