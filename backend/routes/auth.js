const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/database');

// REGISTRO DE USUARIOS 
router.post('/register', async (req, res) => {
  let { name, email, password, companyName } = req.body;

  if (!name || !email || !password || !companyName) {
    return res.status(400).json({
      error: 'Todos los campos son obligatorios'
    });
  }

  // Se valida la contraseña
  const passwordValidation = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

  if (!passwordValidation.test(password)) {
    return res.status(400).json({
      error: 'La contraseña debe tener al menos 8 caracteres, incluyendo una letra y un número'
    });
  }

  try {
    // Se limpian los datos de entrada para evitar problemas de formato/seguridad
    name = name.trim();
    email = email.trim().toLowerCase();
    companyName = companyName.trim();

    // Se comprueba q el nombre de usuario no exista
    const nameExists = await pool.query(
      'SELECT id FROM users WHERE name = $1',
      [name]
    );

    if (nameExists.rows.length > 0) {
      return res.status(400).json({
        error: 'El nombre de usuario ya está en uso'
      });
    }

    // Se comprueba q el email no exista
    const emailExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (emailExists.rows.length > 0) {
      return res.status(400).json({
        error: 'El email ya está registrado'
      });
    }

    /* Se comprueba si la empresa existe, 
    si no, se crea y se crea el usuario como admin */
    const companyResult = await pool.query(
      'SELECT id FROM companies WHERE name = $1',
      [companyName]
    );

    let companyId;
    let role;

    if (companyResult.rows.length > 0) {
      companyId = companyResult.rows[0].id;
      role = 'user';
    } else {
      const newCompany = await pool.query(
        'INSERT INTO companies (name) VALUES ($1) RETURNING id',
        [companyName]
      );

      companyId = newCompany.rows[0].id;
      role = 'admin';
    }

    // Se "encripta" la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (name, email, password, role, company_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, email, hashedPassword, role, companyId]
    );

    return res.status(201).json({
      message: 'Usuario registrado correctamente'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// LOGIN DE USUARIO
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Se busca el usuario por email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Email o contraseña incorrectos' });
    }

    const user = result.rows[0];

    // Se comprueba q la contraseña es correcta
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Email o contraseña incorrectos' });
    }

    // Se busca la empresa
    const company = await pool.query('SELECT name FROM companies WHERE id = $1', [user.company_id]);

    // Se crea token con id, nombre, rol y empresa del usuario
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