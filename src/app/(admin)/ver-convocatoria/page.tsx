"use client";
import React, { useState, useEffect } from "react";
import { FaFilePdf, FaFileWord, FaCheck, FaEllipsisV, FaEye, FaBan } from "react-icons/fa"; // Añadimos FaEye y FaBan

interface Convocatoria {
  id_convocatoria: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  vigencia: number | null;
  pdf_file_path: string | null;
  word_file_path: string | null;
  estado_convocatoria: string | null;
  id_Estado_Convocatoria: number;
}

const VerConvocatorias = () => {
  const [filtervigencia, setFiltervigencia] = useState<string>("");
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [filteredConvocatorias, setFilteredConvocatorias] = useState<Convocatoria[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // Definición de colores para cada estado
  const estadoColores: { [key: string]: { bg: string; text: string } } = {
    "PENDIENTE-APROBACION": { bg: "bg-yellow-100 dark:bg-yellow-900", text: "text-yellow-800 dark:text-yellow-200" },
    "APROBADO-SUPERVISOR": { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-800 dark:text-blue-200" },
    "APROBADO-MONITOR": { bg: "bg-indigo-100 dark:bg-indigo-900", text: "text-indigo-800 dark:text-indigo-200" },
    "APROBADO-REPRESENTANTE": { bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-800 dark:text-purple-200" },
    "Observado": { bg: "bg-orange-100 dark:bg-orange-900", text: "text-orange-800 dark:text-orange-200" },
    "Anulado": { bg: "bg-red-100 dark:bg-red-900", text: "text-red-800 dark:text-red-200" },
    "FINALIZADO": { bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-800 dark:text-gray-200" },
    "PRUEBA": { bg: "bg-green-100 dark:bg-green-900", text: "text-green-800 dark:text-green-200" },
  };

  // Mapeo de ID de estado a descripción (valores reales en la base)
  const estadoIds: { [key: string]: number } = {
    "PENDIENTE-APROBACION": 1,
    "APROBADO-SUPERVISOR": 2,
    "APROBADO-MONITOR": 3,
    "APROBADO-REPRESENTANTE": 4,
    "Observado": 5,
    "Anulado": 6,
    "FINALIZADO": 7,
    "PRUEBA": 8,
  };

  // Mapeo de acciones de interfaz a estados reales
  const actionToState: { [key: string]: string } = {
    "Observar": "Observado",
    "Anular": "Anulado",
  };

  // Flujo de estados principal
  const estadoFlujoPrincipal: { [key: string]: string } = {
    "PENDIENTE-APROBACION": "APROBADO-SUPERVISOR",
    "APROBADO-SUPERVISOR": "APROBADO-MONITOR",
    "APROBADO-MONITOR": "APROBADO-REPRESENTANTE",
    "APROBADO-REPRESENTANTE": "FINALIZADO",
  };

  // Acciones secundarias (interfaz)
  const estadoAccionesSecundarias: { [key: string]: string[] } = {
    "PENDIENTE-APROBACION": ["Observar", "Anular"],
    "APROBADO-SUPERVISOR": ["Observar", "Anular"],
    "APROBADO-MONITOR": ["Observar", "Anular"],
    "APROBADO-REPRESENTANTE": ["Observar", "Anular"],
    "Observado": ["PENDIENTE-APROBACION", "Anular"],
    "FINALIZADO": [],
    "Anulado": [],
  };

  // Fetch convocatorias with error handling
  useEffect(() => {
    const fetchConvocatorias = async () => {
      try {
        const response = await fetch("/api/convocatoria");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Datos recibidos no son un array");
        }
        setConvocatorias(data);
        setFilteredConvocatorias(data);
      } catch (error) {
        console.error("Error fetching convocatorias:", error);
        setError("No se pudieron cargar las convocatorias");
      }
    };
    fetchConvocatorias();
  }, []);

  // Filter convocatorias
  useEffect(() => {
    const filtered = filtervigencia
      ? convocatorias.filter((c) => String(c.vigencia) === filtervigencia)
      : convocatorias;
    setFilteredConvocatorias(filtered);
  }, [filtervigencia, convocatorias]);

  // Handle state change
  const handleStateChange = async (id: number, action: string) => {
    const convocatoria = convocatorias.find((c) => c.id_convocatoria === id);
    if (!convocatoria) return;

    const currentState = convocatoria.estado_convocatoria || "";
    let newState = "";

    if (action === "Aprobar" && estadoFlujoPrincipal[currentState]) {
      newState = estadoFlujoPrincipal[currentState];
    } else if (actionToState[action]) {
      newState = actionToState[action];
    } else {
      alert(`No se puede cambiar de ${currentState} a ${action}.`);
      return;
    }

    try {
      const response = await fetch(`/api/convocatoria/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_Estado_Convocatoria: estadoIds[newState],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cambiar el estado");
      }

      // Actualizar automáticamente la lista de convocatorias
      const updatedConvocatorias = convocatorias.map((item) =>
        item.id_convocatoria === id ? { ...item, estado_convocatoria: newState, id_Estado_Convocatoria: estadoIds[newState] } : item
      );
      setConvocatorias(updatedConvocatorias);
      setFilteredConvocatorias(updatedConvocatorias);
      setError(null);
      setDropdownOpen(null); // Cerrar el dropdown después de la acción
    } catch (error) {
      console.error("Error cambiando el estado:", error);
      setError(error instanceof Error ? error.message : "Error al cambiar el estado");
    }
  };

  // Toggle dropdown for secondary actions
  const toggleDropdown = (id: number) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="ml-0 lg:ml-[90px] transition-all duration-300 ease-in-out p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Convocatorias
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="mr-2 text-gray-700 dark:text-gray-300 font-medium">
            Filtrar por vigencia:
          </label>
          <select
            value={filtervigencia}
            onChange={(e) => setFiltervigencia(e.target.value)}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {[
                  "ID",
                  "Título",
                  "Descripción",
                  "Fecha Inicio",
                  "Fecha Fin",
                  "Vigencia",
                  "Archivo PDF",
                  "Archivo Word",
                  "Estado Convocatoria",
                  "Acción",
                ].map((header) => (
                  <th
                    key={header}
                    className="py-3 px-6 text-left text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredConvocatorias.length > 0 ? (
                filteredConvocatorias.map((convocatoria) => {
                  const estado = convocatoria.estado_convocatoria || "No definido";
                  const colores = estadoColores[estado] || {
                    bg: "bg-gray-100 dark:bg-gray-700",
                    text: "text-gray-800 dark:text-gray-200",
                  };
                  const nextMainState = estadoFlujoPrincipal[estado];
                  const secondaryActions = estadoAccionesSecundarias[estado] || [];

                  return (
                    <tr
                      key={convocatoria.id_convocatoria}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="py-4 px-6 text-gray-900 dark:text-white">
                        {convocatoria.id_convocatoria}
                      </td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white">
                        {convocatoria.titulo}
                      </td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white">
                        {convocatoria.descripcion}
                      </td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white">
                        {new Date(convocatoria.fecha_inicio).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white">
                        {new Date(convocatoria.fecha_fin).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            convocatoria.vigencia === 1
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : convocatoria.vigencia === 0
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {convocatoria.vigencia === 1
                            ? "Activo"
                            : convocatoria.vigencia === 0
                            ? "Inactivo"
                            : "No definido"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white">
                        {convocatoria.pdf_file_path ? (
                          <a
                            href={`/${convocatoria.pdf_file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-500 hover:text-red-600 transition-colors"
                            title="Ver PDF"
                          >
                            <FaFilePdf size={20} />
                          </a>
                        ) : (
                          "No disponible"
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white">
                        {convocatoria.word_file_path ? (
                          <a
                            href={`/${convocatoria.word_file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 transition-colors"
                            title="Ver Word"
                          >
                            <FaFileWord size={20} />
                          </a>
                        ) : (
                          "No disponible"
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${colores.bg} ${colores.text}`}
                        >
                          {estado}
                        </span>
                      </td>
                      <td className="py-4 px-6 flex space-x-2 relative">
                        {/* Botón de check para el flujo principal */}
                        {nextMainState && (
                          <button
                            onClick={() => handleStateChange(convocatoria.id_convocatoria, "Aprobar")}
                            className="text-green-500 hover:text-green-600 transition-colors"
                            title={`Aprobar (${nextMainState})`}
                          >
                            <FaCheck size={20} />
                          </button>
                        )}
                        {/* Menú desplegable para acciones secundarias */}
                        {secondaryActions.length > 0 && (
                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown(convocatoria.id_convocatoria)}
                              className="text-gray-500 hover:text-gray-600 transition-colors"
                              title="Más acciones"
                            >
                              <FaEllipsisV size={20} />
                            </button>
                            {dropdownOpen === convocatoria.id_convocatoria && (
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10">
                                {secondaryActions.map((action) => {
                                  const realState = actionToState[action] || action;
                                  const Icon = action === "Observar" ? FaEye : FaBan;
                                  return (
                                    <button
                                      key={action}
                                      onClick={() => {
                                        handleStateChange(convocatoria.id_convocatoria, action);
                                      }}
                                      className="flex items-center w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      <Icon className="mr-2" size={16} />
                                      {action}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="py-4 px-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No se encontraron convocatorias
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VerConvocatorias;