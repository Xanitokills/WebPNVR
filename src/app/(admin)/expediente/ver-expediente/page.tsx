"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Convenio = {
  convenioID: number;
  NombreProyecto: string;
  Localidad: string;
  Distrito: string;
  Provincia: string;
  Departamento: string;
  Entidad: string;
  Programa: string;
  Proyectista: string;
  Evaluador: string;
  PresupuestoBase: number | null;
  PresupuestoFinanciamiento: number | null;
  AporteBeneficiario: number | null;
  SimboloMonetario: string | null;
  IGV: number | null;
  PlazoEjecucionMeses: number | null;
  PlazoEjecucionDias: number | null;
  NumeroBeneficiarios: number | null;
  CreadoEn: string;
  ActualizadoEn: string;
};

type ExpedienteFile = {
  NombreArchivo: string;
  TipoArchivo: string;
  RutaArchivo: string;
  TamañoArchivo: number;
  Descripcion: string;
  FechaCarga: string;
  CreadoEn: string;
  ActualizadoEn: string;
};

type FilesByCategory = {
  [category: string]: ExpedienteFile[];
};

const VerExpedientes: React.FC = () => {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [selectedConvenioId, setSelectedConvenioId] = useState<number | null>(null);
  const [loadingConvenios, setLoadingConvenios] = useState<boolean>(true);
  const [errorConvenios, setErrorConvenios] = useState<string>("");
  const [filesByCategory, setFilesByCategory] = useState<FilesByCategory>({});
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [errorFiles, setErrorFiles] = useState<string>("");

  // Fetch convenios from the API
  const fetchConvenios = useCallback(async () => {
    try {
      setLoadingConvenios(true);
      const response = await fetch("http://localhost:3003/api/groconvenios/convenios2");
      const data = await response.json();
      if (response.ok) {
        setConvenios(data);
        setErrorConvenios("");
      } else {
        setErrorConvenios(data.error || "Error al cargar los convenios.");
      }
    } catch (err) {
      setErrorConvenios("Error de conexión con el servidor.");
    } finally {
      setLoadingConvenios(false);
    }
  }, []);

  // Fetch files based on selected convenioId
  const fetchFiles = useCallback(async (convenioId: number) => {
    try {
      setLoadingFiles(true);
      const response = await fetch(`/api/expediente/files?convenioId=${convenioId}`);
      const data = await response.json();
      if (response.ok) {
        setFilesByCategory(data);
        setErrorFiles("");
      } else {
        setErrorFiles(data.error || "Error al cargar los archivos.");
      }
    } catch (err) {
      setErrorFiles("Error de conexión con el servidor.");
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  // Load convenios on component mount
  useEffect(() => {
    fetchConvenios();
  }, [fetchConvenios]);

  // Load files when a convenio is selected
  useEffect(() => {
    if (selectedConvenioId) {
      fetchFiles(selectedConvenioId);
    }
  }, [selectedConvenioId, fetchFiles]);

  // Toggle expand/collapse for a category
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ver Expedientes</h1>

      {/* Convenio Dropdown */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Selecciona un Convenio
        </label>
        {loadingConvenios && <p className="text-gray-500">Cargando convenios...</p>}
        {errorConvenios && <p className="text-red-500">{errorConvenios}</p>}
        {!loadingConvenios && !errorConvenios && (
          <select
            value={selectedConvenioId || ""}
            onChange={(e) => setSelectedConvenioId(parseInt(e.target.value) || null)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="" disabled>
              Selecciona un convenio
            </option>
            {convenios.map((convenio) => (
              <option key={convenio.convenioID} value={convenio.convenioID}>
                {convenio.NombreProyecto} (ID: {convenio.convenioID})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Submenus (Categories and Files) */}
      {selectedConvenioId && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          {loadingFiles && <p className="text-gray-500">Cargando archivos...</p>}
          {errorFiles && <p className="text-red-500">{errorFiles}</p>}
          {!loadingFiles && !errorFiles && Object.keys(filesByCategory).length === 0 && (
            <p className="text-gray-500">No hay archivos disponibles.</p>
          )}
          {!loadingFiles && Object.keys(filesByCategory).length > 0 && (
            <div className="space-y-4">
              {Object.keys(filesByCategory).map((category) => (
                <div
                  key={category}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full p-4 flex justify-between items-center text-left text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <span>{category}</span>
                    <span>{expandedCategories[category] ? "▼" : "▶"}</span>
                  </button>

                  {/* Category Content (Expandable) */}
                  {expandedCategories[category] && (
                    <div className="p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                              <th className="px-6 py-3">Nombre</th>
                              <th className="px-6 py-3">Tipo</th>
                              <th className="px-6 py-3">Tamaño (KB)</th>
                              <th className="px-6 py-3">Descripción</th>
                              <th className="px-6 py-3">Fecha de Carga</th>
                              <th className="px-6 py-3">Creado</th>
                              <th className="px-6 py-3">Actualizado</th>
                              <th className="px-6 py-3">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filesByCategory[category].map((file, index) => (
                              <tr
                                key={index}
                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                              >
                                <td className="px-6 py-4">{file.NombreArchivo}</td>
                                <td className="px-6 py-4">{file.TipoArchivo}</td>
                                <td className="px-6 py-4">{file.TamañoArchivo.toFixed(2)}</td>
                                <td className="px-6 py-4">{file.Descripcion}</td>
                                <td className="px-6 py-4">
                                  {new Date(file.FechaCarga).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                  {new Date(file.CreadoEn).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                  {new Date(file.ActualizadoEn).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                  <Link
                                    href={file.RutaArchivo}
                                    target="_blank"
                                    className="text-brand-500 hover:underline"
                                  >
                                    Descargar
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerExpedientes;
