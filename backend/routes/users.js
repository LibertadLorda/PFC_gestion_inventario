const express = require('express');
const router = express.Router();
const pool = require('../db/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// ─── LISTAR USUARIOS (solo admin) ────────────────────────────
router.get('/', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE company_id = $1',
      [req.user.company_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── EDITAR USUARIO (solo admin) ─────────────────────────────
router.put('/:id', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }

  const { name, email, role } = req.body;

  if (req.user.id === parseInt(req.params.id) && role !== 'admin') {
    return res.status(400).json({ error: 'No puedes cambiar tu propio rol' });
  }

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND company_id = $2',
      [req.params.id, req.user.company_id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const nameExists = await pool.query(
      'SELECT id FROM users WHERE name = $1 AND id != $2',
      [name, req.params.id]
    );
    if (nameExists.rows.length > 0) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    const emailExists = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, req.params.id]
    );
    if (emailExists.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está en uso' });
    }

    await pool.query(
      'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4',
      [name, email, role, req.params.id]
    );

    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── CAMBIAR ROL DE USUARIO (solo admin) ─────────────────────
router.put('/:id/role', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }

  const { role } = req.body;

  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Rol no válido' });
  }

  if (req.user.id === parseInt(req.params.id)) {
    return res.status(400).json({ error: 'No puedes cambiar tu propio rol' });
  }

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND company_id = $2',
      [req.params.id, req.user.company_id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);

    res.json({ message: 'Rol actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;