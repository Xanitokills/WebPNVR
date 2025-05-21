"use client";
import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface Convenio {
  id_convenio: string;
  cod_ugt: string | null;
  cod_Convenio: string | null;
  nombre_Convenio: string;
  id_grupo: number | null;
  id_tipo_intervencion: number | null;
  id_programa_presupuestal: number | null;
  id_tipo_fenomeno: number | null;
  id_tipo_material: number | null;
  id_estado: number | null;
  id_sub_estado: number | null;
  id_priorizacion: number | null;
  id_tipo_meta: number | null;
  id_Localidad: number | null;
  id_Distrito: number | null;
  id_Provincia: number | null;
  id_Departamento: number | null;
  fecha_Convenios: string | null;
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
  Entidad: string | null;
  Programa: string | null;
  Proyectista: string | null;
  Evaluador: string | null;
  PresupuestoBase: number | null;
  PresupuestoFinanciamiento: number | null;
  AporteBeneficiario: number | null;
  SimboloMonetario: string | null;
  IGV: number | null;
  PlazoEjecucionMeses: number | null;
  PlazoEjecucionDias: number | null;
  NumeroBeneficiarios: number | null;
  CreadoEn: string | null;
  ActualizadoEn: string | null;
  Grupo: string | null;
  Interevencion: string | null;
  Programa_Presupuestal: string | null;
  Tipo_Fenomeno: string | null;
  Tipo_Material: string | null;
  Estado_Convenio: string | null;
  Sub_Estado_Convenio: string | null;
  Priorizacion: string | null;
  Meta: string | null;
  Localidad: string | null;
  Distrito: string | null;
  Provincia: string | null;
  Departamento: string | null;
}

interface FormData {
  cod_ugt: string;
  cod_Convenio: string;
  nombre_Convenio: string;
  fecha_Convenios: string;
  fecha_inicio: string;
  fecha_termino: string;
  anio_intervencion: string;
  Entidad: string;
  Programa: string;
  Proyectista: string;
  Evaluador: string;
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
    cod_Convenio: "",
    nombre_Convenio: "",
    fecha_Convenios: "",
    fecha_inicio: "",
    fecha_termino: "",
    anio_intervencion: "",
    Entidad: "",
    Programa: "",
    Proyectista: "",
    Evaluador: "",
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
        const response = await fetch("/api/groconvenios/convenios2");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log("Raw data from API:", data);
        if (!Array.isArray(data)) throw new Error("Received data is not an array");

        const conveniosWithEstado = data.map((convenio: Convenio) => ({
          ...convenio,
          Estado_Convenio: convenio.Estado_Convenio || Object.keys(estadoIds).find(
            (key) => estadoIds[key] === convenio.id_estado
          ) || "PENDIENTE",
        }));
        console.log("Processed convenios:", conveniosWithEstado);
        setConvenios(conveniosWithEstado);
        setFilteredConvenios(conveniosWithEstado);
      } catch (error) {
        console.error("Error fetching convenios:", error);
        setError("No se pudieron cargar los convenios");
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
    if (convenio.Estado_Convenio === "FINALIZADO") {
      setError("No se puede editar un convenio finalizado.");
      return;
    }
    console.log("Editing convenio with id:", convenio.id_convenio);
    setSelectedConvenioId(convenio.id_convenio);
    setFormData({
      cod_ugt: convenio.cod_ugt || "",
      cod_Convenio: convenio.cod_Convenio || "",
      nombre_Convenio: convenio.nombre_Convenio || "",
      fecha_Convenios: convenio.fecha_Convenios ? convenio.fecha_Convenios.split("T")[0] : "",
      fecha_inicio: convenio.fecha_inicio ? convenio.fecha_inicio.split("T")[0] : "",
      fecha_termino: convenio.fecha_termino ? convenio.fecha_termino.split("T")[0] : "",
      anio_intervencion: convenio.anio_intervencion !== null ? String(convenio.anio_intervencion) : "",
      Entidad: convenio.Entidad || "",
      Programa: convenio.Programa || "",
      Proyectista: convenio.Proyectista || "",
      Evaluador: convenio.Evaluador || "",
    });
    console.log("Form data initialized:", formData);
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (selectedConvenioId === null) {
      setError("El ID del convenio no es válido.");
      return;
    }

    if (!formData.nombre_Convenio) {
      setError("El nombre del convenio es obligatorio.");
      return;
    }

    const convenioOriginal = convenios.find((c) => c.id_convenio === selectedConvenioId);
    if (!convenioOriginal) {
      setError("Convenio no encontrado.");
      return;
    }

    const fechaConvenios = formData.fecha_Convenios ? new Date(formData.fecha_Convenios) : null;
    const fechaInicio = formData.fecha_inicio ? new Date(formData.fecha_inicio) : null;
    const fechaTermino = formData.fecha_termino ? new Date(formData.fecha_termino) : null;

    if ((fechaConvenios && isNaN(fechaConvenios.getTime())) ||
        (fechaInicio && isNaN(fechaInicio.getTime())) ||
        (fechaTermino && isNaN(fechaTermino.getTime()))) {
      setError("Formato de fecha inválido.");
      return;
    }

    if (fechaInicio && fechaTermino && fechaInicio > fechaTermino) {
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
          cod_Convenio: formData.cod_Convenio,
          nombre_Convenio: formData.nombre_Convenio,
          fecha_Convenios: formData.fecha_Convenios || null,
          fecha_inicio: formData.fecha_inicio || null,
          fecha_termino: formData.fecha_termino || null,
          anio_intervencion: anioIntervencionValue,
          Entidad: formData.Entidad || null,
          Programa: formData.Programa || null,
          Proyectista: formData.Proyectista || null,
          Evaluador: formData.Evaluador || null,
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
        Estado_Convenio: convenioOriginal.Estado_Convenio,
        id_estado: updatedConvenio.id_estado || convenioOriginal.id_estado,
        Grupo: convenioOriginal.Grupo,
        Interevencion: convenioOriginal.Interevencion,
        Programa_Presupuestal: convenioOriginal.Programa_Presupuestal,
        Tipo_Fenomeno: convenioOriginal.Tipo_Fenomeno,
        Tipo_Material: convenioOriginal.Tipo_Material,
        Sub_Estado_Convenio: convenioOriginal.Sub_Estado_Convenio,
        Priorizacion: convenioOriginal.Priorizacion,
        Meta: convenioOriginal.Meta,
        Localidad: convenioOriginal.Localidad,
        Distrito: convenioOriginal.Distrito,
        Provincia: convenioOriginal.Provincia,
        Departamento: convenioOriginal.Departamento,
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
        cod_Convenio: "",
        nombre_Convenio: "",
        fecha_Convenios: "",
        fecha_inicio: "",
        fecha_termino: "",
        anio_intervencion: "",
        Entidad: "",
        Programa: "",
        Proyectista: "",
        Evaluador: "",
      });
    } catch (error) {
      console.error("Error al actualizar el convenio:", error);
      setError(error instanceof Error ? error.message : "Error al actualizar el convenio");
    }
  };

  const handleDelete = async (id: string) => {
    const convenio = convenios.find((c) => c.id_convenio === id);
    if (!convenio || convenio.Estado_Convenio === "FINALIZADO") {
      setError("No se puede eliminar un convenio finalizado.");
      return;
    }

    if (!confirm("¿Estás seguro de que quieres eliminar este convenio?")) return;

    try {
      console.log("Deleting convenio with id:", id);
      const response = await fetch(`/api/convenios/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el convenio");
      }
      const updatedConvenios = convenios.filter((item) => item.id_convenio !== id);
      setConvenios(updatedConvenios);
      setFilteredConvenios(
        filterAnio
          ? updatedConvenios.filter((c) => String(c.anio_intervencion) === filterAnio)
          : updatedConvenios
      );
    } catch (error) {
      console.error("Error al eliminar el convenio:", error);
      setError(error instanceof Error ? error.message : "Error al eliminar el convenio");
    }
  };

  const tableHeaders = [
    "ID Convenio",
    "Código UGT",
    "Código Convenio",
    "Nombre Convenio",
    "Grupo",
    "Tipo Intervención",
    "Programa Presupuestal",
    "Tipo Fenómeno",
    "Tipo Material",
    "Estado",
    "Sub Estado",
    "Priorización",
    "Tipo Meta",
    "Localidad",
    "Distrito",
    "Provincia",
    "Departamento",
    "Fecha Convenios",
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
    "Entidad",
    "Programa",
    "Proyectista",
    "Evaluador",
    "Presupuesto Base",
    "Presupuesto Financiamiento",
    "Aporte Beneficiario",
    "Símbolo Monetario",
    "IGV",
    "Plazo Ejecución Meses",
    "Plazo Ejecución Días",
    "Número Beneficiarios",
    "Creado En",
    "Actualizado En",
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
                  const estado = convenio.Estado_Convenio || "No definido";
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
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.cod_ugt ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.cod_Convenio ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.nombre_Convenio}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Grupo ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Interevencion ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Programa_Presupuestal ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Tipo_Fenomeno ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Tipo_Material ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Estado_Convenio ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Sub_Estado_Convenio ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Priorizacion ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Meta ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Localidad ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Distrito ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Provincia ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Departamento ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">
                        {convenio.fecha_Convenios ? new Date(convenio.fecha_Convenios).toLocaleDateString() : "N/A"}
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
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Entidad ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Programa ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Proyectista ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Evaluador ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.PresupuestoBase ? convenio.PresupuestoBase.toFixed(2) : "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.PresupuestoFinanciamiento ? convenio.PresupuestoFinanciamiento.toFixed(2) : "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.AporteBeneficiario ? convenio.AporteBeneficiario.toFixed(2) : "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.SimboloMonetario ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.IGV ? convenio.IGV.toFixed(2) : "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.PlazoEjecucionMeses ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.PlazoEjecucionDias ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.NumeroBeneficiarios ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">
                        {convenio.CreadoEn ? new Date(convenio.CreadoEn).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">
                        {convenio.ActualizadoEn ? new Date(convenio.ActualizadoEn).toLocaleDateString() : "N/A"}
                      </td>
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
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Código Convenio
                </label>
                <input
                  type="text"
                  value={formData.cod_Convenio}
                  onChange={(e) => setFormData({ ...formData, cod_Convenio: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Nombre Convenio
                </label>
                <input
                  type="text"
                  value={formData.nombre_Convenio}
                  onChange={(e) => setFormData({ ...formData, nombre_Convenio: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Fecha Convenios
                </label>
                <input
                  type="date"
                  value={formData.fecha_Convenios}
                  onChange={(e) => setFormData({ ...formData, fecha_Convenios: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Entidad
                </label>
                <input
                  type="text"
                  value={formData.Entidad}
                  onChange={(e) => setFormData({ ...formData, Entidad: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Programa
                </label>
                <input
                  type="text"
                  value={formData.Programa}
                  onChange={(e) => setFormData({ ...formData, Programa: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Proyectista
                </label>
                <input
                  type="text"
                  value={formData.Proyectista}
                  onChange={(e) => setFormData({ ...formData, Proyectista: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Evaluador
                </label>
                <input
                  type="text"
                  value={formData.Evaluador}
                  onChange={(e) => setFormData({ ...formData, Evaluador: e.target.value })}
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
                    cod_Convenio: "",
                    nombre_Convenio: "",
                    fecha_Convenios: "",
                    fecha_inicio: "",
                    fecha_termino: "",
                    anio_intervencion: "",
                    Entidad: "",
                    Programa: "",
                    Proyectista: "",
                    Evaluador: "",
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