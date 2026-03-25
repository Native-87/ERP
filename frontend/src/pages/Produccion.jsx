import React from 'react';
import { Factory } from 'lucide-react';

const Produccion = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <Factory className="text-primary-500" />
            Producción
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Control y seguimiento de las líneas de producción.
          </p>
        </div>
      </div>
      <div className="bg-white dark:bg-surface-900 p-8 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex items-center justify-center text-center">
        <div>
          <Factory className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-700 dark:text-surface-300">Sección en construcción</h2>
          <p className="text-surface-500 dark:text-surface-400 mt-2 max-w-md mx-auto">
            Estamos trabajando para implementar todas las funcionalidades del módulo de Producción.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Produccion;
