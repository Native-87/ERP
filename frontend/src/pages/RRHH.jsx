import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { toast } from 'react-hot-toast';
import { Users, Calendar, DollarSign, FileText } from 'lucide-react';
import Modal from '../components/Modal';

function RRHH() {
  const [activeTab, setActiveTab] = useState('directorio');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const res = await apiClient.get('/hr/employees');
      setEmployees(res.data);
    } catch (error) {
      toast.error('Error cargando empleados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Recursos Humanos</h1>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`pb-2 px-4 font-medium text-sm flex items-center gap-2 ${activeTab === 'directorio' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('directorio')}
        >
          <Users className="w-4 h-4" /> Directorio
        </button>
        <button
          className={`pb-2 px-4 font-medium text-sm flex items-center gap-2 ${activeTab === 'asistencia' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('asistencia')}
        >
          <Calendar className="w-4 h-4" /> Asistencia
        </button>
        <button
          className={`pb-2 px-4 font-medium text-sm flex items-center gap-2 ${activeTab === 'licencias' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('licencias')}
        >
          <FileText className="w-4 h-4" /> Licencias
        </button>
        <button
          className={`pb-2 px-4 font-medium text-sm flex items-center gap-2 ${activeTab === 'nominas' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('nominas')}
        >
          <DollarSign className="w-4 h-4" /> Nóminas
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'directorio' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Directorio de Empleados</h2>
                {employees.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No hay empleados registrados.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employees.map(emp => (
                      <div key={emp.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 flex items-center justify-center font-bold text-lg shrink-0">
                          {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{emp.firstName} {emp.lastName}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{emp.role || 'Sin cargo'}</p>
                          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1 font-medium">{emp.sector || 'General'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'asistencia' && (
              <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Módulo de Control de Asistencia en desarrollo.</p>
              </div>
            )}

            {activeTab === 'licencias' && (
              <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Módulo de Gestión de Licencias en desarrollo.</p>
              </div>
            )}

            {activeTab === 'nominas' && (
              <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Módulo de Liquidación de Sueldos en desarrollo.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default RRHH;
