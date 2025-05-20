"use client";
import React, { useState, useEffect } from "react";
import { FaFilePdf, FaFileWord, FaCheck, FaEllipsisV, FaEye, FaBan } from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface ItemConvocatoria {
  id_item: number;
  descripcion: string;
  tipo_material: string | null;
  cantidad: number;
  unidad_medida: string | null;
  precio_referencial: number | null;
  especificaciones_tecnicas: string | null;
}

interface Validacion {
  id_validacion: number;
  nivel_validacion: string;
  estado: string;
  usuario_validador: string;
  fecha_validacion: string;
  comentarios: string | null;
}

interface Documento {
  id_documento: number;
  nombre: string;
  tipo: string;
  formato: string;
  ruta_archivo: string;
  version: number;
  validaciones: Validacion[];
}

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
  items: ItemConvocatoria[];
  documentos: Documento[];
}

interface FormData {
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  vigencia: string;
  items: ItemConvocatoria[];
  documentos: Documento[];
}

const VerConvocatorias = () => {
  const [filtervigencia, setFiltervigencia] = useState<string>("");
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [filteredConvocatorias, setFilteredConvocatorias] = useState<Convocatoria[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedConvocatoriaId, setSelectedConvocatoriaId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    vigencia: "",
    items: [],
    documentos: [],
  });
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

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

  const actionToState: { [key: string]: string } = {
    "Observar": "Observado",
    "Anular": "Anulado",
  };

  const estadoFlujoPrincipal: { [key: string]: string } = {
    "PENDIENTE-APROBACION": "APROBADO-SUPERVISOR",
    "APROBADO-SUPERVISOR": "APROBADO-MONITOR",
    "APROBADO-MONITOR": "APROBADO-REPRESENTANTE",
    "APROBADO-REPRESENTANTE": "FINALIZADO",
  };

  const estadoAccionesSecundarias: { [key: string]: string[] } = {
    "PENDIENTE-APROBACION": ["Observar", "Anular"],
    "APROBADO-SUPERVISOR": ["Observar", "Anular"],
    "APROBADO-MONITOR": ["Observar", "Anular"],
    "APROBADO-REPRESENTANTE": ["Observar", "Anular"],
    "Observado": ["PENDIENTE-APROBACION", "Anular"],
    "FINALIZADO": [],
    "Anulado": [],
  };

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

  useEffect(() => {
    const filtered = filtervigencia
      ? convocatorias.filter((c) => String(c.vigencia) === filtervigencia)
      : convocatorias;
    setFilteredConvocatorias(filtered);
  }, [filtervigencia, convocatorias]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleStateChange = async (id: number, action: string) => {
    setError(null);
    const convocatoria = convocatorias.find((c) => c.id_convocatoria === id);
    if (!convocatoria) return;

    const currentState = convocatoria.estado_convocatoria || "";
    let newState = "";

    if (action === "Aprobar" && estadoFlujoPrincipal[currentState]) {
      if (currentState === "APROBADO-REPRESENTANTE") {
        setSelectedConvocatoriaId(id);
        setModalOpen(true);
        return;
      }
      newState = estadoFlujoPrincipal[currentState];
    } else if (actionToState[action]) {
      newState = actionToState[action];
    } else {
      setError(`No se puede cambiar de ${currentState} a ${action}.`);
      return;
    }

    if (!newState) {
      setError("No se pudo determinar el nuevo estado.");
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

      const updatedConvocatorias = convocatorias.map((item) =>
        item.id_convocatoria === id
          ? { ...item, estado_convocatoria: newState, id_Estado_Convocatoria: estadoIds[newState] }
          : item
      );
      setConvocatorias(updatedConvocatorias);
      setFilteredConvocatorias(
        filtervigencia
          ? updatedConvocatorias.filter((c) => String(c.vigencia) === filtervigencia)
          : updatedConvocatorias
      );
    } catch (error) {
      console.error("Error cambiando el estado:", error);
      setError(error instanceof Error ? error.message : "Error al cambiar el estado");
    } finally {
      setDropdownOpen(null);
    }
  };

  const handleConfirmFinalize = async () => {
    if (selectedConvocatoriaId === null) return;

    const newState = "FINALIZADO";
    try {
      const response = await fetch(`/api/convocatoria/${selectedConvocatoriaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_Estado_Convocatoria: estadoIds[newState],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al finalizar la convocatoria");
      }

      const updatedConvocatorias = convocatorias.map((item) =>
        item.id_convocatoria === selectedConvocatoriaId
          ? { ...item, estado_convocatoria: newState, id_Estado_Convocatoria: estadoIds[newState] }
          : item
      );
      setConvocatorias(updatedConvocatorias);
      setFilteredConvocatorias(
        filtervigencia
          ? updatedConvocatorias.filter((c) => String(c.vigencia) === filtervigencia)
          : updatedConvocatorias
      );
      setError(null);
    } catch (error) {
      console.error("Error finalizando la convocatoria:", error);
      setError(error instanceof Error ? error.message : "Error al finalizar la convocatoria");
    } finally {
      setModalOpen(false);
      setSelectedConvocatoriaId(null);
    }
  };

  const handleEdit = (convocatoria: Convocatoria) => {
    if (convocatoria.estado_convocatoria === "FINALIZADO") {
      setError("No se puede editar una convocatoria finalizada.");
      return;
    }
    setSelectedConvocatoriaId(convocatoria.id_convocatoria);
    setFormData({
      titulo: convocatoria.titulo,
      descripcion: convocatoria.descripcion,
      fecha_inicio: convocatoria.fecha_inicio.split("T")[0],
      fecha_fin: convocatoria.fecha_fin.split("T")[0],
      vigencia: convocatoria.vigencia !== null ? String(convocatoria.vigencia) : "",
      items: convocatoria.items,
      documentos: convocatoria.documentos,
    });
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (selectedConvocatoriaId === null) return;

    if (!formData.titulo || !formData.descripcion || !formData.fecha_inicio || !formData.fecha_fin) {
      setError("Por favor, completa todos los campos requeridos.");
      return;
    }

    const convocatoriaOriginal = convocatorias.find((c) => c.id_convocatoria === selectedConvocatoriaId);
    if (!convocatoriaOriginal) {
      setError("Convocatoria no encontrada.");
      return;
    }

    const vigenciaValue = formData.vigencia === "" ? null : Number(formData.vigencia);

    try {
      const response = await fetch(`/api/convocatoria/${selectedConvocatoriaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin,
          vigencia: vigenciaValue,
          id_Estado_Convocatoria: convocatoriaOriginal.id_Estado_Convocatoria,
          items: formData.items,
          documentos: formData.documentos,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar la convocatoria");
      }

      const updatedConvocatoria = await response.json();
      const updatedConvocatorias = convocatorias.map((item) =>
        item.id_convocatoria === selectedConvocatoriaId
          ? { ...item, ...formData, id_Estado_Convocatoria: convocatoriaOriginal.id_Estado_Convocatoria }
          : item
      );
      setConvocatorias(updatedConvocatorias);
      setFilteredConvocatorias(
        filtervigencia
          ? updatedConvocatorias.filter((c) => String(c.vigencia) === filtervigencia)
          : updatedConvocatorias
      );
      setError(null);
    } catch (error) {
      console.error("Error actualizando la convocatoria:", error);
      setError(error instanceof Error ? error.message : "Error al actualizar la convocatoria");
    } finally {
      setEditModalOpen(false);
      setSelectedConvocatoriaId(null);
      setFormData({ titulo: "", descripcion: "", fecha_inicio: "", fecha_fin: "", vigencia: "", items: [], documentos: [] });
    }
  };

  const handleDelete = async (id: number) => {
    const convocatoria = convocatorias.find((c) => c.id_convocatoria === id);
    if (!convocatoria || convocatoria.estado_convocatoria === "FINALIZADO") {
      setError("No se puede eliminar una convocatoria finalizada.");
      return;
    }

    if (!confirm("¿Estás seguro de eliminar esta convocatoria?")) return;

    try {
      const response = await fetch(`/api/convocatoria/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar la convocatoria");
      const updatedConvocatorias = convocatorias.filter((item) => item.id_convocatoria !== id);
      setConvocatorias(updatedConvocatorias);
      setFilteredConvocatorias(
        filtervigencia
          ? updatedConvocatorias.filter((c) => String(c.vigencia) === filtervigencia)
          : updatedConvocatorias
      );
      setError(null);
    } catch (error) {
      console.error("Error eliminando la convocatoria:", error);
      setError(error instanceof Error ? error.message : "Error al eliminar la convocatoria");
    }
  };

  const toggleDropdown = (id: number) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
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
                  "",
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
                  const isFinalizado = estado === "FINALIZADO";
                  const isExpanded = expandedRows.includes(convocatoria.id_convocatoria);

                  return (
                    <React.Fragment key={convocatoria.id_convocatoria}>
                      <tr
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <button
                            onClick={() => toggleRow(convocatoria.id_convocatoria)}
                            className="text-gray-500 hover:text-gray-600"
                          >
                            {isExpanded ? "▼" : "▶"}
                          </button>
                        </td>
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
                          {nextMainState && (
                            <button
                              onClick={() => handleStateChange(convocatoria.id_convocatoria, "Aprobar")}
                              className="text-green-500 hover:text-green-600 transition-colors"
                              title={`Aprobar (${nextMainState})`}
                            >
                              <FaCheck size={20} />
                            </button>
                          )}
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
                          <button
                            onClick={() => handleEdit(convocatoria)}
                            className={`${
                              isFinalizado ? "opacity-50 cursor-not-allowed" : "text-blue-500 hover:text-blue-600"
                            } transition-colors`}
                            title="Editar"
                            disabled={isFinalizado}
                          >
                            <FiEdit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(convocatoria.id_convocatoria)}
                            className={`${
                              isFinalizado ? "opacity-50 cursor-not-allowed" : "text-red-500 hover:text-red-600"
                            } transition-colors`}
                            title="Eliminar"
                            disabled={isFinalizado}
                          >
                            <FiTrash2 size={20} />
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <>
                          {convocatoria.items.length > 0 && (
                            <tr>
                              <td colSpan={11} className="p-4 bg-gray-100 dark:bg-gray-700">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Ítems</h4>
                                <table className="min-w-full mt-2">
                                  <thead>
                                    <tr>
                                      <th className="py-2 px-4 text-left">Descripción</th>
                                      <th className="py-2 px-4 text-left">Cantidad</th>
                                      <th className="py-2 px-4 text-left">Precio Ref.</th>
                                      <th className="py-2 px-4 text-left">Acción</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {convocatoria.items.map((item) => (
                                      <tr key={item.id_item}>
                                        <td className="py-2 px-4">
                                          <input
                                            type="text"
                                            value={item.descripcion}
                                            onChange={(e) => {
                                              const updatedItems = convocatoria.items.map((i) =>
                                                i.id_item === item.id_item ? { ...i, descripcion: e.target.value } : i
                                              );
                                              setFormData({ ...formData, items: updatedItems });
                                            }}
                                            className="w-full p-1 border rounded"
                                            disabled={isFinalizado}
                                          />
                                        </td>
                                        <td className="py-2 px-4">
                                          <input
                                            type="number"
                                            value={item.cantidad}
                                            onChange={(e) => {
                                              const updatedItems = convocatoria.items.map((i) =>
                                                i.id_item === item.id_item ? { ...i, cantidad: Number(e.target.value) } : i
                                              );
                                              setFormData({ ...formData, items: updatedItems });
                                            }}
                                            className="w-full p-1 border rounded"
                                            disabled={isFinalizado}
                                          />
                                        </td>
                                        <td className="py-2 px-4">
                                          <input
                                            type="number"
                                            step="0.01"
                                            value={item.precio_referencial || ""}
                                            onChange={(e) => {
                                              const updatedItems = convocatoria.items.map((i) =>
                                                i.id_item === item.id_item ? { ...i, precio_referencial: Number(e.target.value) } : i
                                              );
                                              setFormData({ ...formData, items: updatedItems });
                                            }}
                                            className="w-full p-1 border rounded"
                                            disabled={isFinalizado}
                                          />
                                        </td>
                                        <td className="py-2 px-4">
                                          <button
                                            onClick={() => {
                                              const updatedItems = convocatoria.items.filter((i) => i.id_item !== item.id_item);
                                              setFormData({ ...formData, items: updatedItems });
                                            }}
                                            className="text-red-500 hover:text-red-600"
                                            disabled={isFinalizado}
                                          >
                                            <FiTrash2 size={16} />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                          {convocatoria.documentos.length > 0 &&
                            convocatoria.documentos.map((doc) => (
                              doc.validaciones.length > 0 && (
                                <tr key={doc.id_documento}>
                                  <td colSpan={11} className="p-4 bg-gray-100 dark:bg-gray-700">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Validaciones: {doc.nombre}</h4>
                                    <table className="min-w-full mt-2">
                                      <thead>
                                        <tr>
                                          <th className="py-2 px-4 text-left">Nivel</th>
                                          <th className="py-2 px-4 text-left">Estado</th>
                                          <th className="py-2 px-4 text-left">Usuario</th>
                                          <th className="py-2 px-4 text-left">Comentarios</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {doc.validaciones.map((val) => (
                                          <tr key={val.id_validacion}>
                                            <td className="py-2 px-4">{val.nivel_validacion}</td>
                                            <td className="py-2 px-4">
                                              <select
                                                value={val.estado}
                                                onChange={(e) => {
                                                  const updatedValidaciones = doc.validaciones.map((v) =>
                                                    v.id_validacion === val.id_validacion ? { ...v, estado: e.target.value } : v
                                                  );
                                                  const updatedDocumentos = convocatoria.documentos.map((d) =>
                                                    d.id_documento === doc.id_documento ? { ...d, validaciones: updatedValidaciones } : d
                                                  );
                                                  setFormData({ ...formData, documentos: updatedDocumentos });
                                                }}
                                                className="w-full p-1 border rounded"
                                                disabled={isFinalizado}
                                              >
                                                <option value="Pendiente">Pendiente</option>
                                                <option value="Aprobado">Aprobado</option>
                                                <option value="Rechazado">Rechazado</option>
                                              </select>
                                            </td>
                                            <td className="py-2 px-4">
                                              <input
                                                type="text"
                                                value={val.usuario_validador}
                                                onChange={(e) => {
                                                  const updatedValidaciones = doc.validaciones.map((v) =>
                                                    v.id_validacion === val.id_validacion ? { ...v, usuario_validador: e.target.value } : v
                                                  );
                                                  const updatedDocumentos = convocatoria.documentos.map((d) =>
                                                    d.id_documento === doc.id_documento ? { ...d, validaciones: updatedValidaciones } : d
                                                  );
                                                  setFormData({ ...formData, documentos: updatedDocumentos });
                                                }}
                                                className="w-full p-1 border rounded"
                                                disabled={isFinalizado}
                                              />
                                            </td>
                                            <td className="py-2 px-4">
                                              <input
                                                type="text"
                                                value={val.comentarios || ""}
                                                onChange={(e) => {
                                                  const updatedValidaciones = doc.validaciones.map((v) =>
                                                    v.id_validacion === val.id_validacion ? { ...v, comentarios: e.target.value } : v
                                                  );
                                                  const updatedDocumentos = convocatoria.documentos.map((d) =>
                                                    d.id_documento === doc.id_documento ? { ...d, validaciones: updatedValidaciones } : d
                                                  );
                                                  setFormData({ ...formData, documentos: updatedDocumentos });
                                                }}
                                                className="w-full p-1 border rounded"
                                                disabled={isFinalizado}
                                              />
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              )
                            ))}
                        </>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={11}
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
              Confirmar Finalización
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              ¿Desea finalizar la revisión? No se podrá editar ni cambiar los ítems después de esto.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setSelectedConvocatoriaId(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmFinalize}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-lg w-full">
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
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
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
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
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
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Vigencia
                </label>
                <select
                  value={formData.vigencia}
                  onChange={(e) => setFormData({ ...formData, vigencia: e.target.value })}
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
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedConvocatoriaId(null);
                  setFormData({ titulo: "", descripcion: "", fecha_inicio: "", fecha_fin: "", vigencia: "", items: [], documentos: [] });
                  setError(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerConvocatorias;