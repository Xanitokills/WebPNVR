"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

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
  const [filesByCategory, setFilesByCategory] = useState<FilesByCategory>({});
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const convenioId = "1"; // Hardcoded for now; adjust based on your app logic
      const response = await fetch(`/api/expediente/files?convenioId=${convenioId}`);
      const data = await response.json();
      if (response.ok) {
        setFilesByCategory(data);
        setError("");
      } else {
        setError(data.error || "Error al cargar los archivos.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {loading && <p className="text-gray-500">Cargando archivos...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && Object.keys(filesByCategory).length === 0 && (
          <p className="text-gray-500">No hay archivos disponibles.</p>
        )}
        {!loading && Object.keys(filesByCategory).length > 0 && (
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
    </div>
  );
};

export default VerExpedientes;
