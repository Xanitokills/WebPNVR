"use client";
import React, { useState } from "react";
import TableAdmin from "../../components/TableAdmin";

interface Grupo {
  id_grupo: number;
  nombre: string;
  estado: number | null;
}

interface TiposMeta {
  id_Tipo_Meta: number;
  descripcion: string;
}

interface TipoIntervencion {
  id_Tipo_Intervencion: number;
  descripcion: string;
}

interface TipoMaterial {
  id_Tipo_Material: number;
  descripcion: string;
}

interface TipoFenomeno {
  id_Tipo_Fenomeno: number;
  descripcion: string;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("grupo");

  const tabs = [
    { id: "grupo", label: "Grupos", apiUrl: "grupo", component: (
      <TableAdmin<Grupo>
        apiUrl="grupo"
        entityName="Grupo"
        fields={[
          { key: "nombre", label: "Nombre del grupo" },
          { key: "estado", label: "Estado", type: "select", options: [
            { value: "", label: "Seleccione estado" },
            { value: "1", label: "Activo" },
            { value: "0", label: "Inactivo" },
          ]},
        ]}
        keyField="id_grupo"
        displayFields={[
          { key: "id_grupo", label: "ID Grupo" },
          { key: "nombre", label: "Nombre" },
          { key: "estado", label: "Estado", transform: (value) => value === 1 ? "Activo" : value === 0 ? "Inactivo" : "N/A" },
        ]}
      />
    )},
    { id: "tiposmeta", label: "Tipos Meta", apiUrl: "tiposmeta", component: (
      <TableAdmin<TiposMeta>
        apiUrl="tipo-meta"
        entityName="Tipo Meta"
        fields={[{ key: "descripcion", label: "Descripción del tipo de meta" }]}
        keyField="id_Tipo_Meta"
        displayFields={[
          { key: "id_Tipo_Meta", label: "ID" },
          { key: "descripcion", label: "Descripción" },
        ]}
      />
    )},
    { id: "tipointervencion", label: "Tipos Intervención", apiUrl: "tipointervencion", component: (
      <TableAdmin<TipoIntervencion>
        apiUrl="tipo-intervencion"
        entityName="Tipo Intervención"
        fields={[{ key: "descripcion", label: "Descripción del tipo de intervención" }]}
        keyField="id_Tipo_Intervencion"
        displayFields={[
          { key: "id_Tipo_Intervencion", label: "ID" },
          { key: "descripcion", label: "Descripción" },
        ]}
      />
    )},
    { id: "tipomaterial", label: "Tipos Material", apiUrl: "tipomaterial", component: (
      <TableAdmin<TipoMaterial>
        apiUrl="tipo-material"
        entityName="Tipo Material"
        fields={[{ key: "descripcion", label: "Descripción del tipo de material" }]}
        keyField="id_Tipo_Material"
        displayFields={[
          { key: "id_Tipo_Material", label: "ID" },
          { key: "descripcion", label: "Descripción" },
        ]}
      />
    )},
    { id: "tipofenomeno", label: "Tipos Fenómeno", apiUrl: "tipofenomeno", component: (
      <TableAdmin<TipoFenomeno>
        apiUrl="tipo-fenomeno"
        entityName="Tipo Fenómeno"
        fields={[{ key: "descripcion", label: "Descripción del tipo de fenómeno" }]}
        keyField="id_Tipo_Fenomeno"
        displayFields={[
          { key: "id_Tipo_Fenomeno", label: "ID" },
          { key: "descripcion", label: "Descripción" },
        ]}
      />
    )},
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="ml-0 lg:ml-[90px] transition-all duration-300 ease-in-out p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Administrar Parámetros</h1>
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
        <div>
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;