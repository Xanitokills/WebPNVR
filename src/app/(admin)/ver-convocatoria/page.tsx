"use client";
import React, { useState, useEffect } from "react";
import { FaFilePdf, FaFileWord, FaCheck, FaEllipsisV, FaEye, FaBan } from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface ItemConvocatoria {
  id_item_convocatoria: number;
  descripcion: string;
  id_tipo_item_convocatoria: number;
  id_tipo_unidad_medida: number | null;
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
  id_convocatoria_documento: number;
  nombre: string;
  tipo: string;
  formato: string;
  ruta_archivo: string;
  version: number;
  validaciones: Validacion[];
}

interface Convocatoria {
  id_convocatoria: number;
  id_convenio: string;
  id_tipo: number;
  codigo_seace: string;
  titulo: string;
  descripcion: string;
  presupuesto: number;
  fecha_publicacion: string;
  fecha_fin_publicacion: string | null;
  fecha_inicio_ofertas: string | null;
  fecha_otorgamiento_buena_pro: string | null;
  fecha_limite_ofertas: string;
  fecha_apertura_sobre: string | null;
  fecha_estimada_adjudicacion: string;
  duracion_contrato: number;
  created_at: string;
  vigencia: boolean;
  pdf_file_path: string | null;
  word_file_path: string | null;
  id_item_convocatoria: number | null;
  id_tipo_item_convocatoria: number | null;
  cantidad: number | null;
  id_estado: number;
  Anexos: string | null;
  QR_PATH: string | null;
  id_convocatoria_documento: number | null;
  estado_convocatoria: string;
  items: ItemConvocatoria[];
  documentos: Documento[];
}

interface FormData {
  id_convenio: string;
  id_tipo: number;
  codigo_seace: string;
  titulo: string;
  descripcion: string;
  presupuesto: number;
  fecha_publicacion: string;
  fecha_limite_ofertas: string;
  fecha_estimada_adjudicacion: string;
  duracion_contrato: number;
  vigencia: string;
  id_estado: number;
  fecha_fin_publicacion?: string;
  fecha_inicio_ofertas?: string;
  fecha_otorgamiento_buena_pro?: string;
  fecha_apertura_sobre?: string;
  pdf_file_path?: string;
  word_file_path?: string;
  id_item_convocatoria?: number;
  id_tipo_item_convocatoria?: number;
  cantidad?: number;
  Anexos?: string;
  QR_PATH?: string;
  id_convocatoria_documento?: number;
}

const VerConvocatorias = () => {
  const [filterVigencia, setFilterVigencia] = useState<string>("");
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [filteredConvocatorias, setFilteredConvocatorias] = useState<Convocatoria[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [selectedConvocatoriaId, setSelectedConvocatoriaId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    id_convenio: "",
    id_tipo: 0,
    codigo_seace: "",
    titulo: "",
    descripcion: "",
    presupuesto: 0,
    fecha_publicacion: "",
    fecha_limite_ofertas: "",
    fecha_estimada_adjudicacion: "",
    duracion_contrato: 0,
    vigencia: "",
    id_estado: 0,
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
    const filtered = filterVigencia
      ? convocatorias.filter((c) => String(c.vigencia ? 1 : 0) === filterVigencia)
      : convocatorias;
    setFilteredConvocatorias(filtered);
  }, [filterVigencia, convocatorias]);

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
          id_estado: estadoIds[newState],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cambiar el estado");
      }

      const updatedConvocatorias = convocatorias.map((item) =>
        item.id_convocatoria === id
          ? { ...item, estado_convocatoria: newState, id_estado: estadoIds[newState] }
          : item
      );
      setConvocatorias(updatedConvocatorias);
      setFilteredConvocatorias(
        filterVigencia
          ? updatedConvocatorias.filter((c) => String(c.vigencia ? 1 : 0) === filterVigencia)
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
          id_estado: estadoIds[newState],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al finalizar la convocatoria");
      }

      const updatedConvocatorias = convocatorias.map((item) =>
        item.id_convocatoria === selectedConvocatoriaId
          ? { ...item, estado_convocatoria: newState, id_estado: estadoIds[newState] }
          : item
      );
      setConvocatorias(updatedConvocatorias);
      setFilteredConvocatorias(
        filterVigencia
          ? updatedConvocatorias.filter((c) => String(c.vigencia ? 1 : 0) === filterVigencia)
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
      id_convenio: convocatoria.id_convenio,
      id_tipo: convocatoria.id_tipo,
      codigo_seace: convocatoria.codigo_seace,
      titulo: convocatoria.titulo,
      descripcion: convocatoria.descripcion,
      presupuesto: convocatoria.presupuesto,
      fecha_publicacion: convocatoria.fecha_publicacion.split("T")[0],
      fecha_limite_ofertas: convocatoria.fecha_limite_ofertas.split("T")[0],
      fecha_estimada_adjudicacion: convocatoria.fecha_estimada_adjudicacion.split("T")[0],
      duracion_contrato: convocatoria.duracion_contrato,
      vigencia: convocatoria.vigencia ? "1" : "0",
      id_estado: convocatoria.id_estado,
      fecha_fin_publicacion: convocatoria.fecha_fin_publicacion?.split("T")[0] || "",
      fecha_inicio_ofertas: convocatoria.fecha_inicio_ofertas?.split("T")[0] || "",
      fecha_otorgamiento_buena_pro: convocatoria.fecha_otorgamiento_buena_pro?.split("T")[0] || "",
      fecha_apertura_sobre: convocatoria.fecha_apertura_sobre?.split("T")[0] || "",
      pdf_file_path: convocatoria.pdf_file_path || "",
      word_file_path: convocatoria.word_file_path || "",
      id_item_convocatoria: convocatoria.id_item_convocatoria || undefined,
      id_tipo_item_convocatoria: convocatoria.id_tipo_item_convocatoria || undefined,
      cantidad: convocatoria.cantidad || undefined,
      Anexos: convocatoria.Anexos || "",
      QR_PATH: convocatoria.QR_PATH || "",
      id_convocatoria_documento: convocatoria.id_convocatoria_documento || undefined,
    });
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (selectedConvocatoriaId === null) return;

    if (
      !formData.id_convenio ||
      !formData.id_tipo ||
      !formData.codigo_seace ||
      !formData.titulo ||
      !formData.descripcion ||
      !formData.presupuesto ||
      !formData.fecha_publicacion ||
      !formData.fecha_limite_ofertas ||
      !formData.fecha_estimada_adjudicacion ||
      !formData.duracion_contrato ||
      !formData.id_estado
    ) {
      setError("Por favor, completa todos los campos requeridos.");
      return;
    }

    try {
      const response = await fetch(`/api/convocatoria/${selectedConvocatoriaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_convenio: formData.id_convenio,
          id_tipo: formData.id_tipo,
          codigo_seace: formData.codigo_seace,
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          presupuesto: formData.presupuesto,
          fecha_publicacion: formData.fecha_publicacion,
          fecha_limite_ofertas: formData.fecha_limite_ofertas,
          fecha_estimada_adjudicacion: formData.fecha_estimada_adjudicacion,
          duracion_contrato: formData.duracion_contrato,
          vigencia: formData.vigencia === "1" ? true : false,
          id_estado: formData.id_estado,
          fecha_fin_publicacion: formData.fecha_fin_publicacion || null,
          fecha_inicio_ofertas: formData.fecha_inicio_ofertas || null,
          fecha_otorgamiento_buena_pro: formData.fecha_otorgamiento_buena_pro || null,
          fecha_apertura_sobre: formData.fecha_apertura_sobre || null,
          pdf_file_path: formData.pdf_file_path || null,
          word_file_path: formData.word_file_path || null,
          id_item_convocatoria: formData.id_item_convocatoria || null,
          id_tipo_item_convocatoria: formData.id_tipo_item_convocatoria || null,
          cantidad: formData.cantidad || null,
          Anexos: formData.Anexos || null,
          QR_PATH: formData.QR_PATH || null,
          id_convocatoria_documento: formData.id_convocatoria_documento || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar la convocatoria");
      }

      const updatedConvocatoria = await response.json();
      const updatedConvocatorias = convocatorias.map((item) =>
        item.id_convocatoria === selectedConvocatoriaId
          ? { ...item, ...formData, vigencia: formData.vigencia === "1" }
          : item
      );
      setConvocatorias(updatedConvocatorias);
      setFilteredConvocatorias(
        filterVigencia
          ? updatedConvocatorias.filter((c) => String(c.vigencia ? 1 : 0) === filterVigencia)
          : updatedConvocatorias
      );
      setError(null);
    } catch (error) {
      console.error("Error actualizando la convocatoria:", error);
      setError(error instanceof Error ? error.message : "Error al actualizar la convocatoria");
    } finally {
      setEditModalOpen(false);
      setSelectedConvocatoriaId(null);
      setFormData({
        id_convenio: "",
        id_tipo: 0,
        codigo_seace: "",
        titulo: "",
        descripcion: "",
        presupuesto: 0,
        fecha_publicacion: "",
        fecha_limite_ofertas: "",
        fecha_estimada_adjudicacion: "",
        duracion_contrato: 0,
        vigencia: "",
        id_estado: 0,
      });
    }
  };

  const handleCreate = async () => {
    if (
      !formData.id_convenio ||
      !formData.id_tipo ||
      !formData.codigo_seace ||
      !formData.titulo ||
      !formData.descripcion ||
      !formData.presupuesto ||
      !formData.fecha_publicacion ||
      !formData.fecha_limite_ofertas ||
      !formData.fecha_estimada_adjudicacion ||
      !formData.duracion_contrato ||
      !formData.id_estado
    ) {
      setError("Por favor, completa todos los campos requeridos.");
      return;
    }

    try {
      const response = await fetch("/api/convocatoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_convenio: formData.id_convenio,
          id_tipo: formData.id_tipo,
          codigo_seace: formData.codigo_seace,
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          presupuesto: formData.presupuesto,
          fecha_publicacion: formData.fecha_publicacion,
          fecha_limite_ofertas: formData.fecha_limite_ofertas,
          fecha_estimada_adjudicacion: formData.fecha_estimada_adjudicacion,
          duracion_contrato: formData.duracion_contrato,
          created_at: new Date().toISOString(),
          vigencia: formData.vigencia === "1" ? true : false,
          pdf_file_path: formData.pdf_file_path || null,
          word_file_path: formData.word_file_path || null,
          id_item_convocatoria: formData.id_item_convocatoria || null,
          id_tipo_item_convocatoria: formData.id_tipo_item_convocatoria || null,
          cantidad: formData.cantidad || null,
          id_estado: formData.id_estado,
          fecha_fin_publicacion: formData.fecha_fin_publicacion || null,
          fecha_inicio_ofertas: formData.fecha_inicio_ofertas || null,
          fecha_otorgamiento_buena_pro: formData.fecha_otorgamiento_buena_pro || null,
          fecha_apertura_sobre: formData.fecha_apertura_sobre || null,
          Anexos: formData.Anexos || null,
          QR_PATH: formData.QR_PATH || null,
          id_convocatoria_documento: formData.id_convocatoria_documento || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la convocatoria");
      }

      const newConvocatoria = await response.json();
      const updatedConvocatorias = [
        ...convocatorias,
        {
          ...formData,
          id_convocatoria: newConvocatoria.id_convocatoria,
          created_at: new Date().toISOString(),
          vigencia: formData.vigencia === "1",
          estado_convocatoria: "PENDIENTE-APROBACION", // Assuming default state
          items: [],
          documentos: [],
        },
      ];
      setConvocatorias(updatedConvocatorias);
      setFilteredConvocatorias(
        filterVigencia
          ? updatedConvocatorias.filter((c) => String(c.vigencia ? 1 : 0) === filterVigencia)
          : updatedConvocatorias
      );
      setError(null);
    } catch (error) {
      console.error("Error creando la convocatoria:", error);
      setError(error instanceof Error ? error.message : "Error al crear la convocatoria");
    } finally {
      setCreateModalOpen(false);
      setFormData({
        id_convenio: "",
        id_tipo: 0,
        codigo_seace: "",
        titulo: "",
        descripcion: "",
        presupuesto: 0,
        fecha_publicacion: "",
        fecha_limite_ofertas: "",
        fecha_estimada_adjudicacion: "",
        duracion_contrato: 0,
        vigencia: "",
        id_estado: 0,
      });
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
        filterVigencia
          ? updatedConvocatorias.filter((c) => String(c.vigencia ? 1 : 0) === filterVigencia)
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Convocatorias
          </h1>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Crear Convocatoria
          </button>
        </div>

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
            value={filterVigencia}
            onChange={(e) => setFilterVigencia(e.target.value)}
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
                  "Convenio",
                  "Código SEACE",
                  "Título",
                  "Presupuesto",
                  "Fecha Publicación",
                  "Fecha Límite Ofertas",
                  "Fecha Estimada Adjudicación",
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
                          {convocatoria.id_convenio}
                        </td>
                        <td className="py-4 px-6 text-gray-900 dark:text-white">
                          {convocatoria.codigo_seace}
                        </td>
                        <td className="py-4 px-6 text-gray-900 dark:text-white">
                          {convocatoria.titulo}
                        </td>
                        <td className="py-4 px-6 text-gray-900 dark:text-white">
                          {convocatoria.presupuesto.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-gray-900 dark:text-white">
                          {new Date(convocatoria.fecha_publicacion).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-gray-900 dark:text-white">
                          {new Date(convocatoria.fecha_limite_ofertas).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-gray-900 dark:text-white">
                          {new Date(convocatoria.fecha_estimada_adjudicacion).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              convocatoria.vigencia
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {convocatoria.vigencia ? "Activo" : "Inactivo"}
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
                                        onClick={() => handleStateChange(convocatoria.id_convocatoria, action)}
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
                              <td colSpan={14} className="p-4 bg-gray-100 dark:bg-gray-700">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Ítems</h4>
                                <table className="min-w-full mt-2">
                                  <thead>
                                    <tr>
                                      <th className="py-2 px-4 text-left">Descripción</th>
                                      <th className="py-2 px-4 text-left">Cantidad</th>
                                      <th className="py-2 px-4 text-left">Acción</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {convocatoria.items.map((item) => (
                                      <tr key={item.id_item_convocatoria}>
                                        <td className="py-2 px-4">{item.descripcion}</td>
                                        <td className="py-2 px-4">{item.cantidad}</td>
                                        <td className="py-2 px-4">
                                          <button
                                            onClick={() => {
                                              // Implement item deletion if needed
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
                                <tr key={doc.id_convocatoria_documento}>
                                  <td colSpan={14} className="p-4 bg-gray-100 dark:bg-gray-700">
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
                                            <td className="py-2 px-4">{val.estado}</td>
                                            <td className="py-2 px-4">{val.usuario_validador}</td>
                                            <td className="py-2 px-4">{val.comentarios || "Sin comentarios"}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              )
                            ))}
                          {convocatoria.Anexos && (
                            <tr>
                              <td colSpan={14} className="p-4 bg-gray-100 dark:bg-gray-700">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Anexos</h4>
                                <p>{convocatoria.Anexos}</p>
                              </td>
                            </tr>
                          )}
                          {convocatoria.QR_PATH && (
                            <tr>
                              <td colSpan={14} className="p-4 bg-gray-100 dark:bg-gray-700">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">QR</h4>
                                <a
                                  href={`/${convocatoria.QR_PATH}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-600"
                                >
                                  Ver QR
                                </a>
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={14}
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
                  ID Convenio
                </label>
                <input
                  type="text"
                  value={formData.id_convenio}
                  onChange={(e) => setFormData({ ...formData, id_convenio: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  ID Tipo
                </label>
                <input
                  type="number"
                  value={formData.id_tipo}
                  onChange={(e) => setFormData({ ...formData, id_tipo: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Código SEACE
                </label>
                <input
                  type="text"
                  value={formData.codigo_seace}
                  onChange={(e) => setFormData({ ...formData, codigo_seace: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
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
                  Presupuesto
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.presupuesto}
                  onChange={(e) => setFormData({ ...formData, presupuesto: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Fecha de Publicación
                </label>
                <input
                  type="date"
                  value={formData.fecha_publicacion}
                  onChange={(e) => setFormData({ ...formData, fecha_publicacion: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Fecha Límite Ofertas
                </label>
                <input
                  type="date"
                  value={formData.fecha_limite_ofertas}
                  onChange={(e) => setFormData({ ...formData, fecha_limite_ofertas: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Fecha Estimada Adjudicación
                </label>
                <input
                  type="date"
                  value={formData.fecha_estimada_adjudicacion}
                  onChange={(e) => setFormData({ ...formData, fecha_estimada_adjudicacion: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Duración Contrato (días)
                </label>
                <input
                  type="number"
                  value={formData.duracion_contrato}
                  onChange={(e) => setFormData({ ...formData, duracion_contrato: Number(e.target.value) })}
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
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  ID Estado
                </label>
                <input
                  type="number"
                  value={formData.id_estado}
                  onChange={(e) => setFormData({ ...formData, id_estado: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Fecha Fin Publicación
                </label>
                <input
                  type="datetime-local"
                  value={formData.fecha_fin_publicacion}
                  onChange={(e) => setFormData({ ...formData, fecha_fin_publicacion: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Fecha Inicio Ofertas
                </label>
                <input
                  type="datetime-local"
                  value={formData.fecha_inicio_ofertas}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio_ofertas: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Fecha Otorgamiento Buena Pro
                </label>
                <input
                  type="datetime-local"
                  value={formData.fecha_otorgamiento_buena_pro}
                  onChange={(e) => setFormData({ ...formData, fecha_otorgamiento_buena_pro: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Fecha Apertura Sobre
                </label>
                <input
                  type="datetime-local"
                  value={formData.fecha_apertura_sobre}
                  onChange={(e) => setFormData({ ...formData, fecha_apertura_sobre: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  PDF Path
                </label>
                <input
                  type="text"
                  value={formData.pdf_file_path}
                  onChange={(e) => setFormData({ ...formData, pdf_file_path: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Word Path
                </label>
                <input
                  type="text"
                  value={formData.word_file_path}
                  onChange={(e) => setFormData({ ...formData, word_file_path: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Anexos
                </label>
                <input
                  type="text"
                  value={formData.Anexos}
                  onChange={(e) => setFormData({ ...formData, Anexos: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  QR Path
                </label>
                <input
                  type="text"
                  value={formData.QR_PATH}
                  onChange={(e) => setFormData({ ...formData, QR_PATH: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedConvocatoriaId(null);
                  setFormData({
                    id_convenio: "",
                    id_tipo: 0,
                    codigo_seace: "",
                    titulo: "",
                    descripcion: "",
                    presupuesto: 0,
                    fecha_publicacion: "",
                    fecha_limite_ofertas: "",
                    fecha_estimada_adjudicacion: "",
                    duracion_contrato: 0,
                    vigencia: "",
                    id_estado: 0,
                  });
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

      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Crear Convocatoria
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  ID Convenio
                </label>
                <input
                  type="text"
                  value={formData.id_convenio}
                  onChange={(e) => setFormData({ ...formData, id_convenio: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  ID Tipo
                </label>
                <input
                  type="number"
                  value={formData.id_tipo}
                  onChange={(e) => setFormData({ ...formData, id_tipo: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Código SEACE
                </label>
                <input
                  type="text"
                  value={formData.codigo_seace}
                  onChange={(e) => setFormData({ ...formData, codigo_seace: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
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
                  Presupuesto
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.presupuesto}
                  onChange={(e) => setFormData({ ...formData, presupuesto: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Fecha de Publicación
                </label>
                <input
                  type="date"
                  value={formData.fecha_publicacion}
                  onChange={(e) => setFormData({ ...formData, fecha_publicacion: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Fecha Límite Ofertas
                </label>
                <input
                  type="date"
                  value={formData.fecha_limite_ofertas}
                  onChange={(e) => setFormData({ ...formData, fecha_limite_ofertas: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Fecha Estimada Adjudicación
                </label>
                <input
                  type="date"
                  value={formData.fecha_estimada_adjudicacion}
                  onChange={(e) => setFormData({ ...formData, fecha_estimada_adjudicacion: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Duración Contrato (días)
                </label>
                <input
                  type="number"
                  value={formData.duracion_contrato}
                  onChange={(e) => setFormData({ ...formData, duracion_contrato: Number(e.target.value) })}
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
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  ID Estado
                </label>
                <input
                  type="number"
                  value={formData.id_estado}
                  onChange={(e) => setFormData({ ...formData, id_estado: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Fecha Fin Publicación
                </label>
                <input
                  type="datetime-local"
                  value={formData.fecha_fin_publicacion}
                  onChange={(e) => setFormData({ ...formData, fecha_fin_publicacion: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Fecha Inicio Ofertas
                </label>
                <input
                  type="datetime-local"
                  value={formData.fecha_inicio_ofertas}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio_ofertas: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Fecha Otorgamiento Buena Pro
                </label>
                <input
                  type="datetime-local"
                  value={formData.fecha_otorgamiento_buena_pro}
                  onChange={(e) => setFormData({ ...formData, fecha_otorgamiento_buena_pro: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Fecha Apertura Sobre
                </label>
                <input
                  type="datetime-local"
                  value={formData.fecha_apertura_sobre}
                  onChange={(e) => setFormData({ ...formData, fecha_apertura_sobre: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  PDF Path
                </label>
                <input
                  type="text"
                  value={formData.pdf_file_path}
                  onChange={(e) => setFormData({ ...formData, pdf_file_path: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Word Path
                </label>
                <input
                  type="text"
                  value={formData.word_file_path}
                  onChange={(e) => setFormData({ ...formData, word_file_path: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Anexos
                </label>
                <input
                  type="text"
                  value={formData.Anexos}
                  onChange={(e) => setFormData({ ...formData, Anexos: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  QR Path
                </label>
                <input
                  type="text"
                  value={formData.QR_PATH}
                  onChange={(e) => setFormData({ ...formData, QR_PATH: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setCreateModalOpen(false);
                  setFormData({
                    id_convenio: "",
                    id_tipo: 0,
                    codigo_seace: "",
                    titulo: "",
                    descripcion: "",
                    presupuesto: 0,
                    fecha_publicacion: "",
                    fecha_limite_ofertas: "",
                    fecha_estimada_adjudicacion: "",
                    duracion_contrato: 0,
                    vigencia: "",
                    id_estado: 0,
                  });
                  setError(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerConvocatorias;