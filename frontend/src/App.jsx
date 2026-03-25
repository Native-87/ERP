import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Finanzas from './pages/Finanzas';
import Inventario from './pages/Inventario';
import Usuarios from './pages/Usuarios';
import Configuracion from './pages/Configuracion';
import RRHH from './pages/RRHH';
import Compras from './pages/Compras';
import Produccion from './pages/Produccion';
import Mantenimiento from './pages/Mantenimiento';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                background: '#1e293b',
                color: '#f1f5f9',
                fontSize: '14px',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/finanzas"
                element={
                  <ProtectedRoute roles={['admin', 'supervisor', 'contador']}>
                    <Finanzas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventario"
                element={
                  <ProtectedRoute roles={['admin', 'supervisor', 'operario']}>
                    <Inventario />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/compras"
                element={
                  <ProtectedRoute roles={['admin', 'supervisor', 'operario', 'contador']}>
                    <Compras />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <Usuarios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rrhh"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <RRHH />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/configuracion"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <Configuracion />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/produccion"
                element={
                  <ProtectedRoute roles={['admin', 'supervisor', 'operario']}>
                    <Produccion />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mantenimiento"
                element={
                  <ProtectedRoute roles={['admin', 'supervisor', 'operario']}>
                    <Mantenimiento />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
