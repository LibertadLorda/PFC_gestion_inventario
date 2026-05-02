import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar({ lowStock = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const name = localStorage.getItem('name');
  const companyName = localStorage.getItem('companyName');
  const isAdmin = localStorage.getItem('role') === 'admin';

  // Controla si la sidebar está abierta en móvil
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Comprueba si una ruta está activa para resaltarla
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Topbar móvil */}
      <div className="topbar-mobile">
        <h1>📦 Inventario</h1>
        <button className="hamburger-btn" onClick={() => setOpen(true)}>☰</button>
      </div>

      {/* Overlay móvil */}
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />

      {/* Sidebar */}
      <div className={`sidebar bg-dark ${open ? 'open' : ''}`}>

        {/* Logo y empresa */}
        <div className="sidebar-logo">
          <h1>📦 Inventario</h1>
          <p>{companyName}</p>
        </div>

        {/* Navegación */}
        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => { navigate('/dashboard'); setOpen(false); }}
          >
            📋 Productos
            {/* Badge rojo con el número de productos con stock bajo */}
            {lowStock > 0 && (
              <span className="badge bg-danger ms-auto">{lowStock}</span>
            )}
          </button>

          {/* Solo visible para admins */}
          {isAdmin && (
            <button
              className={`sidebar-nav-item ${isActive('/admin') ? 'active' : ''}`}
              onClick={() => { navigate('/admin'); setOpen(false); }}
            >
              ⚙️ Administración
            </button>
          )}
        </nav>

        {/* Usuario y logout */}
        <div className="sidebar-footer">
          <p className="text-white fw-semibold mb-0">{name}</p>
          <p className="text-secondary small text-uppercase mb-3" style={{ letterSpacing: '1px' }}>
            {isAdmin ? 'Administrador' : 'Trabajador'}
          </p>
          <button className="btn btn-outline-warning btn-sm w-100" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;