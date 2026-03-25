import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { dashboardAPI } from '../api/client';
import {
  LayoutDashboard, DollarSign, Package, ClipboardList,
  Users, Settings, LogOut, Menu, X, Moon, Sun, Building2, Briefcase, ShoppingCart,
  Factory, Wrench
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, hasRole } = useAuth();
  const { darkMode, toggleDarkMode, companySettings } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alerts, setAlerts] = useState({ financial: 'green', workOrders: 'green', inventory: 'green' });
  const location = useLocation();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data } = await dashboardAPI.getSummary();
        setAlerts(data.alerts);
      } catch {
        // Ignore errors
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Administrador actualiza cada 60s
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'supervisor', 'operario', 'contador'],
      alertKey: null,
    },
    {
      path: '/finanzas',
      label: 'Finanzas',
      icon: DollarSign,
      roles: ['admin', 'supervisor', 'contador'],
      alertKey: 'financial',
    },
    {
      path: '/inventario',
      label: 'Inventario',
      icon: Package,
      roles: ['admin', 'supervisor', 'operario'],
      alertKey: 'inventory',
    },
    {
      path: '/produccion',
      label: 'Producción',
      icon: Factory,
      roles: ['admin', 'supervisor', 'operario'],
      alertKey: null,
    },
    {
      path: '/mantenimiento',
      label: 'Mantenimiento',
      icon: Wrench,
      roles: ['admin', 'supervisor', 'operario'],
      alertKey: null,
    },
    {
      path: '/compras',
      label: 'Compras',
      icon: ShoppingCart,
      roles: ['admin', 'supervisor', 'operario', 'contador'],
      alertKey: 'purchasing',
    },
    {
      path: '/usuarios',
      label: 'Usuarios',
      icon: Users,
      roles: ['admin'],
      alertKey: null,
    },
    {
      path: '/rrhh',
      label: 'RRHH',
      icon: Briefcase,
      roles: ['admin'],
      alertKey: null,
    },
    {
      path: '/configuracion',
      label: 'Configuración',
      icon: Settings,
      roles: ['admin'],
      alertKey: null,
    },
  ];

  const getAlertDot = (key) => {
    if (!key || !alerts[key] || alerts[key] === 'green') return null;
    const color = alerts[key] === 'red' ? 'bg-red-500' : 'bg-yellow-500';
    return <span className={`absolute top-0 right-0 w-2 h-2 rounded-full ${color}`} />;
  };

  const getRoleLabel = (role) => {
    const map = { admin: 'Administrador', supervisor: 'Supervisor', operario: 'Operario', contador: 'Contador' };
    return map[role] || role;
  };

  // Cierra el menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 shadow-sm transition-colors duration-300">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[1920px]">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Company */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Building2 size={18} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-surface-900 dark:text-white truncate">
                {companySettings?.company_name || 'Mi Empresa'}
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center flex-1 mx-8 overflow-x-auto overflow-y-hidden" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            <div className="flex space-x-1 no-scrollbar overflow-x-auto">
              {menuItems
                .filter((item) => item.roles.some((r) => hasRole(r)))
                .map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `relative px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                          : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-300 dark:hover:bg-surface-800 dark:hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                    {getAlertDot(item.alertKey)}
                  </NavLink>
                ))}
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User menu (Desktop) */}
            <div className="hidden sm:flex items-center gap-3 border-l pl-4 border-surface-200 dark:border-surface-700">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-surface-900 dark:text-white leading-tight">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="text-xs text-surface-500">
                  {getRoleLabel(user?.role)}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-surface-400 hover:text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute w-full bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems
              .filter((item) => item.roles.some((r) => hasRole(r)))
              .map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3 relative overflow-hidden transition-all ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-300 dark:hover:bg-surface-800 dark:hover:text-white'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                  {getAlertDot(item.alertKey)}
                </NavLink>
              ))}
          </div>
          <div className="pt-4 pb-3 border-t border-surface-200 dark:border-surface-700">
            <div className="flex items-center px-5 gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-lg font-bold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="flex flex-col ml-3 flex-1 min-w-0">
                <p className="text-base font-medium text-surface-900 dark:text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-sm text-surface-500 font-medium truncate">
                  {getRoleLabel(user?.role)}
                </p>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <button
                onClick={logout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
