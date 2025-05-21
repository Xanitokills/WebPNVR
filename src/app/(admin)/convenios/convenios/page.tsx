"use client";
import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface Convenio {
  id_convenio: string;
  cod_ugt: string;
  nombre_proyecto: string;
  id_grupo: number | null;
  id_tipo_intervencion: number | null;
  id_programa_presupuestal: number | null;
  id_tipo_fenomeno: number | null;
  id_tipo_material: number | null;
  id_estado: number | null;
  id_sub_estado: number | null;
  id_priorizacion: number | null;
  id_tipo_meta: number | null;
  id_ubicacion: number | null;
  fecha_convenio: string | null;
  fecha_transferencia: string | null;
  fecha_limite_inicio: string | null;
  fecha_inicio: string | null;
  plazo_ejecucion: number | null;
  dias_paralizados: number | null;
  dias_ampliacion: number | null;
  fecha_termino: string | null;
  fecha_acta_termino: string | null;
  motivo_atraso: string | null;
  accion_mitigacion: string | null;
  fecha_inicio_estimada: string | null;
  fecha_termino_estimada: string | null;
  anio_intervencion: number | null;
  estado_convenio?: string | null;
}

interface FormData {
  cod_ugt: string;
  nombre_proyecto: string;
  fecha_inicio: string;
  fecha_termino: string;
  anio_intervencion: string;
}

const VerConvenios = () => {
  const [filterAnio, setFilterAnio] = useState<string>("");
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [filteredConvenios, setFilteredConvenios] = useState<Convenio[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedConvenioId, setSelectedConvenioId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    cod_ugt: "",
    nombre_proyecto: "",
    fecha_inicio: "",
    fecha_termino: "",
    anio_intervencion: "",
  });

  const estadoColores: { [key: string]: { bg: string; text: string } } = {
    PENDIENTE: { bg: "bg-yellow-100 dark:bg-yellow-900", text: "text-yellow-800 dark:text-yellow-200" },
    EN_PROGRESO: { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-800 dark:text-blue-200" },
    FINALIZADO: { bg: "bg-green-100 dark:bg-green-900", text: "text-green-800 dark:text-green-200" },
    OBSERVADO: { bg: "bg-orange-100 dark:bg-orange-900", text: "text-orange-800 dark:text-orange-200" },
    ANULADO: { bg: "bg-red-100 dark:bg-red-900", text: "text-red-800 dark:text-red-200" },
  };

  const estadoIds: { [key: string]: number } = {
    PENDIENTE: 1,
    EN_PROGRESO: 2,
    FINALIZADO: 3,
    OBSERVADO: 4,
    ANULADO: 5,
  };

  useEffect(() => {
    const fetchConvenios = async () => {
      try {
        console.log("Fetching convenios...");
        const response = await fetch("/api/convenios");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log("Raw data from API:", data);
        if (!Array.isArray(data)) throw new Error("Received data is not an array");

        const conveniosWithEstado = data.map((convenio: Convenio) => {
          const estadoKey = Object.keys(estadoIds).find(
            (key) => estadoIds[key] === convenio.id_estado
          );
          return {
            ...convenio,
            estado_convenio: estadoKey || "PENDIENTE",
          };
        });
        console.log("Processed convenios:", conveniosWithEstado);
        setConvenios(conveniosWithEstado);
        setFilteredConvenios(conveniosWithEstado);
      } catch (error) {
        console.error("Error fetching convenios:", error);
        setError("Failed to load convenios");
      }
    };
    fetchConvenios();
  }, []);

  useEffect(() => {
    const filtered = filterAnio
      ? convenios.filter((c) => String(c.anio_intervencion) === filterAnio)
      : convenios;
    console.log("Filtered convenios by year:", filtered);
    setFilteredConvenios(filtered);
  }, [filterAnio, convenios]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleEdit = (convenio: Convenio) => {
    if (convenio.estado_convenio === "FINALIZADO") {
      setError("No se puede editar un convenio finalizado.");
      return;
    }
    console.log("Editing convenio with id:", convenio.id_convenio);
    setSelectedConvenioId(convenio.id_convenio);
    setFormData({
      cod_ugt: convenio.cod_ugt || "",
      nombre_proyecto: convenio.nombre_proyecto || "",
      fecha_inicio: convenio.fecha_inicio ? convenio.fecha_inicio.split("T")[0] : "",
      fecha_termino: convenio.fecha_termino ? convenio.fecha_termino.split("T")[0] : "",
      anio_intervencion: convenio.anio_intervencion !== null ? String(convenio.anio_intervencion) : "",
    });
    console.log("Form data initialized:", formData);
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (selectedConvenioId === null) {
      setError("El ID del convenio no es válido.");
      return;
    }

    if (!formData.cod_ugt || !formData.nombre_proyecto || !formData.fecha_inicio || !formData.fecha_termino) {
      setError("Por favor, completa todos los campos requeridos.");
      return;
    }

    const convenioOriginal = convenios.find((c) => c.id_convenio === selectedConvenioId);
    if (!convenioOriginal) {
      setError("Convenio no encontrado.");
      return;
    }

    const fechaInicio = new Date(formData.fecha_inicio);
    const fechaTermino = new Date(formData.fecha_termino);
    if (isNaN(fechaInicio.getTime()) || isNaN(fechaTermino.getTime())) {
      setError("Formato de fecha inválido.");
      return;
    }
    if (fechaInicio > fechaTermino) {
      setError("La fecha de inicio no puede ser posterior a la fecha de término.");
      return;
    }

    const anioIntervencionValue = formData.anio_intervencion ? Number(formData.anio_intervencion) : null;

    try {
      console.log("Saving convenio with id:", selectedConvenioId);
      console.log("Form data to save:", formData);
      const response = await fetch(`/api/convenios/${selectedConvenioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cod_ugt: formData.cod_ugt,
          nombre_proyecto: formData.nombre_proyecto,
          fecha_inicio: formData.fecha_inicio,
          fecha_termino: formData.fecha_termino,
          anio_intervencion: anioIntervencionValue,
          id_estado: convenioOriginal.id_estado,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || "Error al actualizar el convenio");
      }

      const updatedConvenio = await response.json();
      const finalConvenio = {
        ...updatedConvenio,
        estado_convenio: convenioOriginal.estado_convenio,
        id_estado: updatedConvenio.id_estado || convenioOriginal.id_estado,
      };

      const updatedConvenios = convenios.map((item) =>
        item.id_convenio === finalConvenio.id_convenio ? finalConvenio : item
      );
      setConvenios(updatedConvenios);
      setFilteredConvenios(
        filterAnio
          ? updatedConvenios.filter((c) => String(c.anio_intervencion) === filterAnio)
          : updatedConvenios
      );
      setEditModalOpen(false);
      setSelectedConvenioId(null);
      setFormData({
        cod_ugt: "",
        nombre_proyecto: "",
        fecha_inicio: "",
        fecha_termino: "",
        anio_intervencion: "",
      });
    } catch (error) {
      console.error("Error al actualizar el convenio:", error);
      setError(error instanceof Error ? error.message : "Error al actualizar el convenio");
    }
  };

  const handleDelete = async (id: string) => {
    const convenio = convenios.find((c) => c.id_convenio === id);
    if (!convenio || convenio.estado_convenio === "FINALIZADO") {
      setError("No se puede eliminar un convenio finalizado.");
      return;
    }

    if (!confirm("¿Estás seguro de que quieres eliminar este convenio?")) return;

    try {
      console.log("Deleting convenio with id:", id);
      const response = await fetch(`/api/convenios/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error deleting convenio");
      }
      const updatedConvenios = convenios.filter((item) => item.id_convenio !== id);
      setConvenios(updatedConvenios);
      setFilteredConvenios(
        filterAnio
          ? updatedConvenios.filter((c) => String(c.anio_intervencion) === filterAnio)
          : updatedConvenios
      );
    } catch (error) {
      console.error("Error deleting convenio:", error);
      setError(error instanceof Error ? error.message : "Error deleting convenio");
    }
  };

  const tableHeaders = [
    "ID Convenio",
    "Código UGT",
    "Nombre Proyecto",
    "ID Grupo",
    "ID Tipo Intervención",
    "ID Programa Presupuestal",
    "ID Tipo Fenómeno",
    "ID Tipo Material",
    "ID Estado",
    "ID Sub Estado",
    "ID Priorización",
    "ID Tipo Meta",
    "ID Ubicación",
    "Fecha Convenio",
    "Fecha Transferencia",
    "Fecha Límite Inicio",
    "Fecha Inicio",
    "Plazo Ejecución",
    "Días Paralizados",
    "Días Ampliación",
    "Fecha Término",
    "Fecha Acta Término",
    "Motivo Atraso",
    "Acción Mitigación",
    "Fecha Inicio Estimada",
    "Fecha Término Estimada",
    "Año Intervención",
    "Estado Convenio",
    "Acción",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="ml-0 lg:ml-[90px] transition-all duration-300 ease-in-out p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Convenios
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="mr-2 text-gray-700 dark:text-gray-300 font-medium">
            Filtrar por Año Intervención:
          </label>
          <input
            type="number"
            value={filterAnio}
            onChange={(e) => setFilterAnio(e.target.value)}
            placeholder="Ingresa el año"
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {tableHeaders.map((header, index) => (
                  <th
                    key={header}
                    className={`py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap ${
                      index === tableHeaders.length - 1
                        ? "sticky right-0 bg-gray-50 dark:bg-gray-700 z-10"
                        : ""
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredConvenios.length > 0 ? (
                filteredConvenios.map((convenio) => {
                  const estado = convenio.estado_convenio || "No definido";
                  const colores = estadoColores[estado] || {
                    bg: "bg-gray-100 dark:bg-gray-700",
                    text: "text-gray-800 dark:text-gray-200",
                  };
                  const isFinalizado = estado === "FINALIZADO";

                  return (
                    <tr
                      key={convenio.id_convenio}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.id_convenio}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.cod_ugt}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.nombre_proyecto}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.id_grupo ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.id_tipo_intervencion ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.id_programa_presupuestal ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.id_tipo_fenomeno ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.id_tipo_material ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.id_estado ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.id_sub_estado ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.id_priorizacion ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.id_tipo_meta ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.id_ubicacion ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">
                        {convenio.fecha_convenio ? new Date(convenio.fecha_convenio).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">
                        {convenio.fecha_transferencia ? new Date(convenio.fecha_transferencia).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">
                        {convenio.fecha_limite_inicio ? new Date(convenio.fecha_limite_inicio).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">
                        {convenio.fecha_inicio ? new Date(convenio.fecha_inicio).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.plazo_ejecucion ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.dias_paralizados ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.dias_ampliacion ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">
                        {convenio.fecha_termino ? new Date(convenio.fecha_termino).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">
                        {convenio.fecha_acta_termino ? new Date(convenio.fecha_acta_termino).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.motivo_atraso ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.accion_mitigacion ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">
                        {convenio.fecha_inicio_estimada ? new Date(convenio.fecha_inicio_estimada).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">
                        {convenio.fecha_termino_estimada ? new Date(convenio.fecha_termino_estimada).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.anio_intervencion ?? "N/A"}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${colores.bg} ${colores.text}`}
                        >
                          {estado}
                        </span>
                      </td>
                      <td className="py-4 px-4 flex space-x-2 sticky right-0 bg-white dark:bg-gray-800 z-10">
                        <button
                          onClick={() => handleEdit(convenio)}
                          className={`${
                            isFinalizado
                              ? "opacity-50 cursor-not-allowed"
                              : "text-blue-500 hover:text-blue-600"
                          } transition-colors`}
                          title="Editar"
                          disabled={isFinalizado}
                        >
                          <FiEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(convenio.id_convenio)}
                          className={`${
                            isFinalizado
                              ? "opacity-50 cursor-not-allowed"
                              : "text-red-500 hover:text-red-600"
                          } transition-colors`}
                          title="Eliminar"
                          disabled={isFinalizado}
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
                    colSpan={tableHeaders.length}
                    className="py-4 px-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No se encontraron convenios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Editar Convenio
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Código UGT
                </label>
                <input
                  type="text"
                  value={formData.cod_ugt}
                  onChange={(e) => setFormData({ ...formData, cod_ugt: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Nombre Proyecto
                </label>
                <input
                  type="text"
                  value={formData.nombre_proyecto}
                  onChange={(e) => setFormData({ ...formData, nombre_proyecto: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                  Fecha de Término
                </label>
                <input
                  type="date"
                  value={formData.fecha_termino}
                  onChange={(e) => setFormData({ ...formData, fecha_termino: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Año Intervención
                </label>
                <input
                  type="number"
                  value={formData.anio_intervencion}
                  onChange={(e) => setFormData({ ...formData, anio_intervencion: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedConvenioId(null);
                  setFormData({
                    cod_ugt: "",
                    nombre_proyecto: "",
                    fecha_inicio: "",
                    fecha_termino: "",
                    anio_intervencion: "",
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
    </div>
  );
};

export default VerConvenios;