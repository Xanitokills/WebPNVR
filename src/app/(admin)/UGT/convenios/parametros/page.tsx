"use client";
import React, { useState } from "react";
import TableAdmin from "../../../../../components/TableAdmin";


interface Grupo {
  id_grupo: number;
  nombre: string;
  estado: number | null;
}

interface Tipometa {
  id_tipo_meta: number;
  descripcion: string;
  estado: number | null;
}

interface TipoIntervencion {
  id_Tipo_Intervencion: number;
  descripcion: string;
  estado: number | null;
}

interface TipoMaterial {
  id_Tipo_Material: number;
  descripcion: string;
  estado: number | null;
}

interface TipoFenomeno {
  id_tipo_fenomeno: number;
  descripcion: string;
  estado: number | null;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("grupo");

  const tabs = [
    { id: "grupo", label: "Grupos", apiUrl: "groconvenios/grupo", component: (
      <TableAdmin<Grupo>
        apiUrl="groconvenios/grupo"
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
          { key: "id_grupo", label: "ID" },
          { key: "nombre", label: "Nombre" },
          { key: "estado", label: "Estado", transform: (value: number | null) => value === 1 ? "Activo" : value === 0 ? "Inactivo" : "No definido" },
        ]}
      />
    )},
    { id: "tipometa", label: "Tipos Meta", apiUrl: "groconvenios/tipometa", component: (
      <TableAdmin<Tipometa>
        apiUrl="groconvenios/tipometa"
        entityName="TipoMeta"
        fields={[
          { key: "descripcion", label: "Descripción del tipo de meta" },
          { key: "estado", label: "Estado", type: "select", options: [
            { value: "", label: "Seleccione estado" },
            { value: "1", label: "Activo" },
            { value: "0", label: "Inactivo" },
          ]},
        ]}
        keyField="id_tipo_meta"
        displayFields={[
          { key: "id_tipo_meta", label: "ID" },
          { key: "descripcion", label: "Descripción" },
          { 
            key: "estado", 
            label: "Estado", 
            transform: (value: number | null) => value === 1 ? "Activo" : value === 0 ? "Inactivo" : "No definido" 
          },
        ]}
      />
    )},
    { id: "tipointervencion", label: "Tipos Intervención", apiUrl: "groconvenios/tipointervencion", component: (
      <TableAdmin<TipoIntervencion>
        apiUrl="groconvenios/tipointervencion"
        entityName="Tipo Intervención"
        fields={[
          { key: "descripcion", label: "Descripción del tipo de intervención" },
          { key: "estado", label: "Estado", type: "select", options: [
            { value: "", label: "Seleccione estado" },
            { value: "1", label: "Activo" },
            { value: "0", label: "Inactivo" },
          ]},      
        ]}
        keyField="id_tipo_intervencion"
        displayFields={[
          { key: "id_tipo_intervencion", label: "ID" },
          { key: "descripcion", label: "Descripción" },
          { 
            key: "estado", 
            label: "Estado", 
            transform: (value: number | null) => value === 1 ? "Activo" : value === 0 ? "Inactivo" : "No definido" 
          },
        ]}
      />
    )},
    { id: "tipomaterial", label: "Tipos Material", apiUrl: "groconvenios/tipomaterial", component: (
      <TableAdmin<TipoMaterial>
        apiUrl="groconvenios/tipomaterial"
        entityName="Tipo Material"
        fields={[{ key: "descripcion", label: "Descripción del tipo de material" },
          { key: "estado", label: "Estado", type: "select", options: [
            { value: "", label: "Seleccione estado" },
            { value: "1", label: "Activo" },
            { value: "0", label: "Inactivo" },
          ]},      
        ]}
        keyField="id_tipo_material"
        displayFields={[
          { key: "id_tipo_material", label: "ID" },
          { key: "descripcion", label: "Descripción" },
          { 
            key: "estado", 
            label: "Estado", 
            transform: (value: number | null) => value === 1 ? "Activo" : value === 0 ? "Inactivo" : "No definido" 
          },
        ]}
      />
    )},
    { id: "tipofenomeno", label: "Tipos Fenómeno", apiUrl: "groconvenios/tipofenomeno", component: (
      <TableAdmin<TipoFenomeno>
        apiUrl="groconvenios/tipofenomeno"
        entityName="TipoFenomeno"
        fields={[
          { key: "descripcion", label: "Descripción del tipo de fenómeno" },
          { key: "estado", label: "Estado", type: "select", options: [
            { value: "", label: "Seleccione estado" },
            { value: "1", label: "Activo" },
            { value: "0", label: "Inactivo" },
          ]},
        
        ]}
          
        keyField="id_tipo_fenomeno"
        displayFields={[
          { key: "id_tipo_fenomeno", label: "ID" },
          { key: "descripcion", label: "Descripción" },
          { 
            key: "estado", 
            label: "Estado", 
            transform: (value: number | null) => value === 1 ? "Activo" : value === 0 ? "Inactivo" : "No definido" 
          },
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