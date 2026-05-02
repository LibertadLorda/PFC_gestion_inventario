const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/database');

// ─── REGISTRO ────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password, companyName } = req.body;

  if (!name || !email || !password || !companyName) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Comprobar si el nombre de usuario ya existe
    const nameExists = await pool.query('SELECT id FROM users WHERE name = $1', [name]);
    if (nameExists.rows.length > 0) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Comprobar si el email ya existe
    const emailExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailExists.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Buscar si la empresa ya existe
    const companyResult = await pool.query('SELECT id FROM companies WHERE name = $1', [companyName]);

    let companyId;
    let role;

    if (companyResult.rows.length > 0) {
      // La empresa existe → el usuario se une como trabajador
      companyId = companyResult.rows[0].id;
      role = 'user';
    } else {
      // La empresa no existe → se crea y el usuario es admin
      const newCompany = await pool.query('INSERT INTO companies (name) VALUES ($1) RETURNING id', [companyName]);
      companyId = newCompany.rows[0].id;
      role = 'admin';
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password, role, company_id) VALUES ($1, $2, $3, $4, $5)',
      [name, email, hashedPassword, role, companyId]
    );

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── LOGIN ───────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario por email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Email o contraseña incorrectos' });
    }

    const user = result.rows[0];

    // Comprobar que la contraseña es correcta
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Email o contraseña incorrectos' });
    }

    // Buscar el nombre de la empresa
    const company = await pool.query('SELECT name FROM companies WHERE id = $1', [user.company_id]);

    // Generar token con id, nombre, rol y empresa del usuario
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role, company_id: user.company_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, name: user.name, role: user.role, companyName: company.rows[0].name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;