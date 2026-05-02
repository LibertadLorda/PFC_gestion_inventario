import { Navigate } from 'react-router-dom';

// Componente que protege rutas que requieren autenticación
function PrivateRoute({ children }) {
  // Comprueba si hay token guardado en el navegador
  const token = localStorage.getItem('token');

  // Si no hay token, redirige al login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Si hay token, muestra el contenido de la ruta
  return children;
}

export default PrivateRoute;