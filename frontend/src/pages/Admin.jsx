import { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

function Admin() {
  const [activeSection, setActiveSection] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const name = localStorage.getItem('name');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catsRes, usersRes] = await Promise.all([
          api.get('/categories'),
          api.get('/users')
        ]);
        setCategories(catsRes.data);
        setUsers(usersRes.data);
      } catch {
        setError('Error al cargar los datos');
      }
    };
    loadData();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/categories', { name: newCategory, description: newDescription });
      setSuccess('Categoría creada correctamente');
      setNewCategory(''); setNewDescription('');
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la categoría');
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.put(`/categories/${editingCategory.id}`, {
        name: editingCategory.name,
        description: editingCategory.description
      });
      setSuccess('Categoría actualizada correctamente');
      setEditingCategory(null);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar la categoría');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta categoría?')) return;
    try {
      await api.delete(`/categories/${id}`);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch {
      setError('Error al eliminar la categoría');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.put(`/users/${editingUser.id}`, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role
      });
      setSuccess('Usuario actualizado correctamente');
      setEditingUser(null);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar el usuario');
    }
  };

  return (
    <div>
      <Sidebar />

      <div className="main-content">
        <h4 className="fw-bold mb-4">Panel de administración</h4>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Navegación entre secciones */}
        <ul className="nav nav-pills mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeSection === 'categories' ? 'bg-warning text-dark fw-semibold' : 'text-dark'}`}
              onClick={() => setActiveSection('categories')}
            >
              Categorías
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeSection === 'users' ? 'bg-warning text-dark fw-semibold' : 'text-dark'}`}
              onClick={() => setActiveSection('users')}
            >
              Usuarios
            </button>
          </li>
        </ul>

        {/* ── CATEGORÍAS ── */}
        {activeSection === 'categories' && (
          <>
            <div className="card border-warning-subtle mb-4">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">Nueva categoría</h5>
                <form onSubmit={handleCreateCategory}>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">Nombre *</label>
                      <input type="text" className="form-control" value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)} required />
                    </div>
                    <div className="col-md-5 mb-3">
                      <label className="form-label fw-semibold">Descripción</label>
                      <input type="text" className="form-control" value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)} />
                    </div>
                    <div className="col-md-3 mb-3 d-flex align-items-end">
                      <button type="submit" className="btn btn-warning fw-semibold w-100">Añadir</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {editingCategory && (
              <div className="card border-warning-subtle mb-4">
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-3">Editar categoría</h5>
                  <form onSubmit={handleEditCategory}>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label for="form-control" className="form-label fw-semibold">Nombre *</label>
                        <input type="text" className="form-control" value={editingCategory.name}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Descripción</label>
                        <input type="text" className="form-control" value={editingCategory.description || ''}
                          onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })} />
                      </div>
                      <div className="col-md-2 mb-3 d-flex align-items-end">
                        <button type="submit" className="btn btn-warning fw-semibold w-100">Guardar</button>
                      </div>
                    </div>
                    <button type="button" className="btn btn-outline-secondary btn-sm"
                      onClick={() => setEditingCategory(null)}>Cancelar</button>
                  </form>
                </div>
              </div>
            )}

            <h5 className="fw-bold mb-3">Categorías existentes</h5>
            {categories.length === 0 ? (
              <p className="text-muted">No hay categorías todavía.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id}>
                        <td className="fw-semibold">{cat.name}</td>
                        <td className="text-muted">{cat.description || '-'}</td>
                        <td>
                          <button className="btn btn-outline-dark btn-sm me-2"
                            onClick={() => setEditingCategory(cat)}>Editar</button>
                          <button className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteCategory(cat.id)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── USUARIOS ── */}
        {activeSection === 'users' && (
          <>
            {editingUser && (
              <div className="card border-warning-subtle mb-4">
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-3">Editar usuario</h5>
                  <form onSubmit={handleEditUser}>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">Nombre *</label>
                        <input type="text" className="form-control" value={editingUser.name}
                          onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} required />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">Email *</label>
                        <input type="email" className="form-control" value={editingUser.email}
                          onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} required />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">Rol</label>
                        <select className="form-select" value={editingUser.role}
                          onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}>
                          <option value="user">Trabajador</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-warning fw-semibold">Guardar</button>
                      <button type="button" className="btn btn-outline-secondary"
                        onClick={() => setEditingUser(null)}>Cancelar</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <h5 className="fw-bold mb-3">Usuarios de la empresa</h5>
            {users.length === 0 ? (
              <p className="text-muted">No hay usuarios todavía.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="fw-semibold">{user.name}</td>
                        <td className="text-muted">{user.email}</td>
                        <td>
                          <span className={`badge ${user.role === 'admin' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'}`}>
                            {user.role === 'admin' ? 'Administrador' : 'Trabajador'}
                          </span>
                        </td>
                        <td>
                          {user.name !== name && (
                            <button className="btn btn-outline-secondary btn-sm"
                              onClick={() => setEditingUser(user)}>Editar</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Admin;