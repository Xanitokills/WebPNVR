'use client';

import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import BasicTableOne from '@/components/tables/BasicTableOne';
import BeneficiariosTable from '@/components/tables/BeneficiariosTable';
import React, { Suspense, useState } from 'react';

// Definimos la interfaz para los datos de los convenios
interface Convenio {
  'Número de Convenio': string;
  Departamento: string;
  Provincia: string;
  'Año Intervención': number;
  Ubigeo: string;
}

export default function BasicTablesClient({ initialData }: { initialData: Convenio[] }) {
  const [selectedConvenio, setSelectedConvenio] = useState<string | null>(null);

  const handleSelectConvenio = (convenio: string) => {
    setSelectedConvenio(convenio);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Basic Table" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <Suspense fallback={<div>Cargando tabla inicial...</div>}>
            <BasicTableOne data={initialData} onSelectConvenio={handleSelectConvenio} />
          </Suspense>
          {selectedConvenio && (
            <Suspense fallback={<div>Cargando beneficiarios...</div>}>
              <BeneficiariosTable numeroConvenio={selectedConvenio} />
            </Suspense>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}