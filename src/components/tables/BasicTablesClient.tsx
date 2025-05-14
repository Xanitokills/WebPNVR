'use client';

import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import BasicTableOne from '@/components/tables/BasicTableOne';
import React, { Suspense, useState, useMemo } from 'react';

interface Convenio {
  'Número de Convenio': string;
  Departamento: string;
  Provincia: string;
  'Año Intervención': number;
  Ubigeo: string;
}

export default function BasicTablesClient({ initialData }: { initialData: Convenio[] }) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    if (!searchTerm) return initialData;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return initialData.filter((convenio) =>
      Object.values(convenio).some((value) =>
        String(value).toLowerCase().includes(lowerSearchTerm)
      )
    );
  }, [initialData, searchTerm]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Basic Table" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar convenios..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full max-w-md p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>

          <Suspense fallback={<div>Cargando tabla inicial...</div>}>
            <BasicTableOne data={paginatedData} />
          </Suspense>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600"
            >
              Anterior
            </button>
            <span className="text-gray-600 dark:text-gray-400">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600"
            >
              Siguiente
            </button>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}