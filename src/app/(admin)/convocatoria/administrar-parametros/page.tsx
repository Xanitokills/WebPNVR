"use client";
import React, { useState } from "react";
import TableAdmin from "../../../../components/TableAdmin";

// Update the interface to match the item_convocatoria API response
interface ItemConvocatoria {
  id_item_convocatoria: number;
  descripcion: string;
  cantidad: number;
  id_unidad_medida: number;
  precio_referencial: number;
  especificaciones_tecnicas: string | null;
  id_convocatoria: number;
}

// Interface for tipo_convocatoria, aligned with the API
interface TipoConvocatoria {
  id_tipo: number;
  nombre: string;
  descripcion: string;
  estado: number;
}

const ConvocatoriaParametros = () => {
  const [activeTab, setActiveTab] = useState("tipo-convocatoria");

  const tabs = [
    {
      id: "tipo-convocatoria",
      label: "Tipo Convocatoria",
      apiUrl: "tipoconvocatoria",
      component: (
        <TableAdmin<TipoConvocatoria>
          apiUrl="tipoconvocatoria"
          entityName="Tipo Convocatoria"
          fields={[
            { key: "nombre", label: "Nombre" },
            { key: "descripcion", label: "Descripción" },
            { key: "estado", label: "Estado" },
          ]}
          keyField="id_tipo"
          displayFields={[
            { key: "id_tipo", label: "ID" },
            { key: "nombre", label: "Nombre" },
            { key: "descripcion", label: "Descripción" },
            { key: "estado", label: "Estado" },
          ]}
        />
      ),
    },
    {
      id: "item-convocatoria",
      label: "Ítem Convocatoria",
      apiUrl: "itemconvocatoria",
      component: (
        <TableAdmin<ItemConvocatoria>
          apiUrl="itemconvocatoria"
          entityName="Ítem Convocatoria"
          fields={[
            { key: "descripcion", label: "Descripción" },
            { key: "id_unidad_medida", label: "ID Unidad Medida", type: "number" },
            { key: "precio_referencial", label: "Precio Referencial", type: "number" },
            { key: "especificaciones_tecnicas", label: "Especificaciones Técnicas" },
            { key: "id_convocatoria", label: "ID Convocatoria", type: "number" },
          ]}
          keyField="id_item_convocatoria"
          displayFields={[
            { key: "id_item_convocatoria", label: "ID" },
            { key: "descripcion", label: "Descripción" },
            { key: "id_unidad_medida", label: "ID Unidad Medida" },
            { key: "precio_referencial", label: "Precio Referencial" },
            { key: "especificaciones_tecnicas", label: "Especificaciones Técnicas" },
            { key: "id_convocatoria", label: "ID Convocatoria" },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="ml-0 lg:ml-[90px] transition-all duration-300 ease-in-out p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Administrar Parámetros de Convocatorias
        </h1>
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
            {tabs.map((tab) => (
              <li key={tab.id} className="mr-2">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-block p-4 rounded-t-lg border-b-2 ${
                    activeTab === tab.id
                      ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>{tabs.find((tab) => tab.id === activeTab)?.component}</div>
      </div>
    </div>
  );
};

export default ConvocatoriaParametros;