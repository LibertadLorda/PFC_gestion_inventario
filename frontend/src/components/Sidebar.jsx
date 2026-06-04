import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar({ lowStock = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const name = localStorage.getItem('name');
  const companyName = localStorage.getItem('companyName');
  const isAdmin = localStorage.getItem('role') === 'admin';

  // Controla si la barra lateral está abierta en móvil
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Si una ruta está activa se resalta
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Barra superior en móvil */}
      <div className="topbar-mobile">
        <h1>📦 Inventario</h1>
        <button className="hamburger-btn" onClick={() => setOpen(true)}>☰</button>
      </div>

      {/* Overlay móvil */}
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />

      {/* Barra lateral */}
      <div className={`sidebar bg-dark ${open ? 'open' : ''}`}>

        {/* Empresa */}
        <div className="sidebar-logo">
          <h1>📦 Inventario</h1>
          <p>{companyName}</p>
        </div>

        {/* Navbar */}
        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => { navigate('/dashboard'); setOpen(false); }}
          >
            📋 Productos
            {/* Número de productos con stock bajo */}
            {lowStock > 0 && (
              <span className="badge bg-danger ms-auto">{lowStock}</span>
            )}
          </button>

          {/* Panel de administración */}
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