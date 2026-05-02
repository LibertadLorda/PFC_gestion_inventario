/* Qué hace este archivo: crea una instancia de axios 
configurada para apuntar siempre a tu backend. 
El interceptor añade automáticamente el token en 
cada petición, así no tienes que ponerlo manualmente
en cada llamada. */
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Añade el token automáticamente a
// todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el servidor devuelve 401 
// (token expirado o inválido), 
// redirige al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;