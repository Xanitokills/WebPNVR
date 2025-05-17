"use client";
import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface Convocatoria {
  id_convocatoria: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  vigencia: number | null;
  pdf_file_path: string | null;
  word_file_path: string | null;
  estado_convocatoria: string | null; // Este campo ahora viene de ec.descripcion
}

const VerConvocatorias = () => {
  const [filtervigencia, setFiltervigencia] = useState<string>("");
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [filteredConvocatorias, setFilteredConvocatorias] = useState<Convocatoria[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<Convocatoria | null>(null);
  const [formData, setFormData] = useState<{
    titulo?: string;
    descripcion?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    vigencia?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);

  // Definición de colores para cada estado
  const estadoColores: { [key: string]: { bg: string; text: string } } = {
    "PENDIENTE-APROBACION": { bg: "bg-yellow-100 dark:bg-yellow-900", text: "text-yellow-800 dark:text-yellow-200" },
    "APROBADO-SUPERVISOR": { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-800 dark:text-blue-200" },
    "APROBADO-MONITOR": { bg: "bg-indigo-100 dark:bg-indigo-900", text: "text-indigo-800 dark:text-indigo-200" },
    "APROBADO-REPRESENTANTE": { bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-800 dark:text-purple-200" },
    "OBSERVADO": { bg: "bg-orange-100 dark:bg-orange-900", text: "text-orange-800 dark:text-orange-200" },
    "ANULADO": { bg: "bg-red-100 dark:bg-red-900", text: "text-red-800 dark:text-red-200" },
    "FINALIZADO": { bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-800 dark:text-gray-200" },
    "PRUEBA": { bg: "bg-green-100 dark:bg-green-900", text: "text-green-800 dark:text-green-200" },
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

  // Handle edit
  const handleEdit = (convocatoria: Convocatoria) => {
    setSelectedConvocatoria(convocatoria);
    setFormData({
      titulo: convocatoria.titulo,
      descripcion: convocatoria.descripcion,
      fecha_inicio: convocatoria.fecha_inicio.split("T")[0],
      fecha_fin: convocatoria.fecha_fin.split("T")[0],
      vigencia: convocatoria.vigencia !== null ? String(convocatoria.vigencia) : "",
    });
    setModalOpen(true);
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save changes
  const handleSave = async () => {
    if (!selectedConvocatoria) return;

    try {
      // Validate form data
      if (!formData.titulo || !formData.descripcion || !formData.fecha_inicio || !formData.fecha_fin) {
        throw new Error("Por favor, completa todos los campos requeridos");
      }

      // Convert vigencia to number | null for the API
      const vigenciaValue = formData.vigencia === "" ? null : Number(formData.vigencia);

      const response = await fetch(`/api/convocatoria/${selectedConvocatoria.id_convocatoria}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin,
          vigencia: vigenciaValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar la convocatoria");
      }

      const updatedConvocatoria = await response.json();

      setConvocatorias((prev) =>
        prev.map((item) =>
          item.id_convocatoria === updatedConvocatoria.id_convocatoria ? updatedConvocatoria : item
        )
      );
      setModalOpen(false);
      setSelectedConvocatoria(null);
      setError(null);
    } catch (error) {
      console.error("Error actualizando la convocatoria:", error);
      setError(error instanceof Error ? error.message : "Error al actualizar la convocatoria");
    }
  };

  // Delete convocatoria
  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta convocatoria?")) return;

    try {
      const response = await fetch(`/api/convocatoria/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar la convocatoria");
      setConvocatorias((prev) => prev.filter((item) => item.id_convocatoria !== id));
      setError(null);
    } catch (error) {
      console.error("Error eliminando la convocatoria:", error);
      setError(error instanceof Error ? error.message : "Error al eliminar la convocatoria");
    }
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
                  "Acciones",
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
                            className="text-blue-500 hover:text-blue-600 underline"
                          >
                            Ver PDF
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
                            className="text-blue-500 hover:text-blue-600 underline"
                          >
                            Ver Word
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
                      <td className="py-4 px-6 flex space-x-2">
                        <button
                          onClick={() => handleEdit(convocatoria)}
                          className="text-blue-500 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <FiEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(convocatoria.id_convocatoria)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <FiTrash2 size={20} />
                        </button>
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Editar Convocatoria
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Título
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Vigencia
                </label>
                <select
                  name="vigencia"
                  value={formData.vigencia || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione vigencia</option>
                  <option value="1">Activo</option>
                  <option value="0">Inactivo</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setError(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerConvocatorias;