import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Truck, FileSignature } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Compras() {
  const [activeTab, setActiveTab] = useState('proveedores');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hasRole } = useAuth();

  const fetchProviders = async () => {
    try {
      const res = await apiClient.get('/compras/providers');
      setProviders(res.data);
    } catch (error) {
      toast.error('Error cargando proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestión de Compras</h1>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button
          className={`shrink-0 pb-2 px-4 font-medium text-sm flex items-center gap-2 ${activeTab === 'proveedores' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('proveedores')}
        >
          <Truck className="w-4 h-4" /> Proveedores
        </button>
        <button
          className={`shrink-0 pb-2 px-4 font-medium text-sm flex items-center gap-2 ${activeTab === 'solicitudes' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('solicitudes')}
        >
          <FileSignature className="w-4 h-4" /> Solicitudes de Compra
        </button>
        {(hasRole('admin') || hasRole('contador')) && (
          <button
            className={`shrink-0 pb-2 px-4 font-medium text-sm flex items-center gap-2 ${activeTab === 'ordenes' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('ordenes')}
          >
            <ShoppingCart className="w-4 h-4" /> Órdenes de Compra
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'proveedores' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Directorio de Proveedores</h2>
                {providers.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No hay proveedores registrados.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {providers.map(prov => (
                      <div key={prov.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col gap-2 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-900 dark:text-white">{prov.name}</h3>
                          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full font-medium">Activo</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <p><span className="font-medium">Contacto:</span> {prov.contactName}</p>
                          <p><span className="font-medium">Email:</span> {prov.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'solicitudes' && (
              <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                <FileSignature className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Módulo de Emisión y Aprobación de Solicitudes en desarrollo.</p>
              </div>
            )}

            {activeTab === 'ordenes' && (
              <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Módulo de Recepción de Órdenes y Actualización de Inventario en desarrollo.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Compras;
