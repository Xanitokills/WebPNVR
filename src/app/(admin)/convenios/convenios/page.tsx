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
  id_grupo: string;
  id_tipo_intervencion: string;
  id_programa_presupuestal: string;
  id_tipo_fenomeno: string;
  id_tipo_material: string;
  id_estado: string;
  id_sub_estado: string;
  id_priorizacion: string;
  id_tipo_meta: string;
  id_Localidad: string;
  id_Distrito: string;
  id_Provincia: string;
  id_Departamento: string;
  fecha_Convenios: string;
  fecha_transferencia: string;
  fecha_limite_inicio: string;
  fecha_inicio: string;
  plazo_ejecucion: string;
  dias_paralizados: string;
  dias_ampliacion: string;
  fecha_termino: string;
  fecha_acta_termino: string;
  motivo_atraso: string;
  accion_mitigacion: string;
  fecha_inicio_estimada: string;
  fecha_termino_estimada: string;
  anio_intervencion: string;
  Entidad: string;
  Programa: string;
  Proyectista: string;
  Evaluador: string;
  PresupuestoBase: string;
  PresupuestoFinanciamiento: string;
  AporteBeneficiario: string;
  SimboloMonetario: string;
  IGV: string;
  PlazoEjecucionMeses: string;
  PlazoEjecucionDias: string;
  NumeroBeneficiarios: string;
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
    id_grupo: "",
    id_tipo_intervencion: "",
    id_programa_presupuestal: "",
    id_tipo_fenomeno: "",
    id_tipo_material: "",
    id_estado: "",
    id_sub_estado: "",
    id_priorizacion: "",
    id_tipo_meta: "",
    id_Localidad: "",
    id_Distrito: "",
    id_Provincia: "",
    id_Departamento: "",
    fecha_Convenios: "",
    fecha_transferencia: "",
    fecha_limite_inicio: "",
    fecha_inicio: "",
    plazo_ejecucion: "",
    dias_paralizados: "",
    dias_ampliacion: "",
    fecha_termino: "",
    fecha_acta_termino: "",
    motivo_atraso: "",
    accion_mitigacion: "",
    fecha_inicio_estimada: "",
    fecha_termino_estimada: "",
    anio_intervencion: "",
    Entidad: "",
    Programa: "",
    Proyectista: "",
    Evaluador: "",
    PresupuestoBase: "",
    PresupuestoFinanciamiento: "",
    AporteBeneficiario: "",
    SimboloMonetario: "",
    IGV: "",
    PlazoEjecucionMeses: "",
    PlazoEjecucionDias: "",
    NumeroBeneficiarios: "",
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
        const response = await fetch("/api/groconvenios/convenios");
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
      id_grupo: convenio.id_grupo !== null ? String(convenio.id_grupo) : "",
      id_tipo_intervencion: convenio.id_tipo_intervencion !== null ? String(convenio.id_tipo_intervencion) : "",
      id_programa_presupuestal: convenio.id_programa_presupuestal !== null ? String(convenio.id_programa_presupuestal) : "",
      id_tipo_fenomeno: convenio.id_tipo_fenomeno !== null ? String(convenio.id_tipo_fenomeno) : "",
      id_tipo_material: convenio.id_tipo_material !== null ? String(convenio.id_tipo_material) : "",
      id_estado: convenio.id_estado !== null ? String(convenio.id_estado) : "",
      id_sub_estado: convenio.id_sub_estado !== null ? String(convenio.id_sub_estado) : "",
      id_priorizacion: convenio.id_priorizacion !== null ? String(convenio.id_priorizacion) : "",
      id_tipo_meta: convenio.id_tipo_meta !== null ? String(convenio.id_tipo_meta) : "",
      id_Localidad: convenio.id_Localidad !== null ? String(convenio.id_Localidad) : "",
      id_Distrito: convenio.id_Distrito !== null ? String(convenio.id_Distrito) : "",
      id_Provincia: convenio.id_Provincia !== null ? String(convenio.id_Provincia) : "",
      id_Departamento: convenio.id_Departamento !== null ? String(convenio.id_Departamento) : "",
      fecha_Convenios: convenio.fecha_Convenios ? convenio.fecha_Convenios.split("T")[0] : "",
      fecha_transferencia: convenio.fecha_transferencia ? convenio.fecha_transferencia.split("T")[0] : "",
      fecha_limite_inicio: convenio.fecha_limite_inicio ? convenio.fecha_limite_inicio.split("T")[0] : "",
      fecha_inicio: convenio.fecha_inicio ? convenio.fecha_inicio.split("T")[0] : "",
      plazo_ejecucion: convenio.plazo_ejecucion !== null ? String(convenio.plazo_ejecucion) : "",
      dias_paralizados: convenio.dias_paralizados !== null ? String(convenio.dias_paralizados) : "",
      dias_ampliacion: convenio.dias_ampliacion !== null ? String(convenio.dias_ampliacion) : "",
      fecha_termino: convenio.fecha_termino ? convenio.fecha_termino.split("T")[0] : "",
      fecha_acta_termino: convenio.fecha_acta_termino ? convenio.fecha_acta_termino.split("T")[0] : "",
      motivo_atraso: convenio.motivo_atraso || "",
      accion_mitigacion: convenio.accion_mitigacion || "",
      fecha_inicio_estimada: convenio.fecha_inicio_estimada ? convenio.fecha_inicio_estimada.split("T")[0] : "",
      fecha_termino_estimada: convenio.fecha_termino_estimada ? convenio.fecha_termino_estimada.split("T")[0] : "",
      anio_intervencion: convenio.anio_intervencion !== null ? String(convenio.anio_intervencion) : "",
      Entidad: convenio.Entidad || "",
      Programa: convenio.Programa || "",
      Proyectista: convenio.Proyectista || "",
      Evaluador: convenio.Evaluador || "",
      PresupuestoBase: convenio.PresupuestoBase !== null ? String(convenio.PresupuestoBase) : "",
      PresupuestoFinanciamiento: convenio.PresupuestoFinanciamiento !== null ? String(convenio.PresupuestoFinanciamiento) : "",
      AporteBeneficiario: convenio.AporteBeneficiario !== null ? String(convenio.AporteBeneficiario) : "",
      SimboloMonetario: convenio.SimboloMonetario || "",
      IGV: convenio.IGV !== null ? String(convenio.IGV) : "",
      PlazoEjecucionMeses: convenio.PlazoEjecucionMeses !== null ? String(convenio.PlazoEjecucionMeses) : "",
      PlazoEjecucionDias: convenio.PlazoEjecucionDias !== null ? String(convenio.PlazoEjecucionDias) : "",
      NumeroBeneficiarios: convenio.NumeroBeneficiarios !== null ? String(convenio.NumeroBeneficiarios) : "",
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
    const fechaTransferencia = formData.fecha_transferencia ? new Date(formData.fecha_transferencia) : null;
    const fechaLimiteInicio = formData.fecha_limite_inicio ? new Date(formData.fecha_limite_inicio) : null;
    const fechaInicio = formData.fecha_inicio ? new Date(formData.fecha_inicio) : null;
    const fechaTermino = formData.fecha_termino ? new Date(formData.fecha_termino) : null;
    const fechaActaTermino = formData.fecha_acta_termino ? new Date(formData.fecha_acta_termino) : null;
    const fechaInicioEstimada = formData.fecha_inicio_estimada ? new Date(formData.fecha_inicio_estimada) : null;
    const fechaTerminoEstimada = formData.fecha_termino_estimada ? new Date(formData.fecha_termino_estimada) : null;

    const invalidDates = [
      fechaConvenios, fechaTransferencia, fechaLimiteInicio, fechaInicio,
      fechaTermino, fechaActaTermino, fechaInicioEstimada, fechaTerminoEstimada
    ].filter(date => date && isNaN(date.getTime()));

    if (invalidDates.length > 0) {
      setError("Formato de fecha inválido.");
      return;
    }

    if (fechaInicio && fechaTermino && fechaInicio > fechaTermino) {
      setError("La fecha de inicio no puede ser posterior a la fecha de término.");
      return;
    }

    const numericFields = {
      id_grupo: Number(formData.id_grupo) || null,
      id_tipo_intervencion: Number(formData.id_tipo_intervencion) || null,
      id_programa_presupuestal: Number(formData.id_programa_presupuestal) || null,
      id_tipo_fenomeno: Number(formData.id_tipo_fenomeno) || null,
      id_tipo_material: Number(formData.id_tipo_material) || null,
      id_estado: Number(formData.id_estado) || null,
      id_sub_estado: Number(formData.id_sub_estado) || null,
      id_priorizacion: Number(formData.id_priorizacion) || null,
      id_tipo_meta: Number(formData.id_tipo_meta) || null,
      id_Localidad: Number(formData.id_Localidad) || null,
      id_Distrito: Number(formData.id_Distrito) || null,
      id_Provincia: Number(formData.id_Provincia) || null,
      id_Departamento: Number(formData.id_Departamento) || null,
      plazo_ejecucion: Number(formData.plazo_ejecucion) || null,
      dias_paralizados: Number(formData.dias_paralizados) || null,
      dias_ampliacion: Number(formData.dias_ampliacion) || null,
      anio_intervencion: Number(formData.anio_intervencion) || null,
      PresupuestoBase: Number(formData.PresupuestoBase) || null,
      PresupuestoFinanciamiento: Number(formData.PresupuestoFinanciamiento) || null,
      AporteBeneficiario: Number(formData.AporteBeneficiario) || null,
      IGV: Number(formData.IGV) || null,
      PlazoEjecucionMeses: Number(formData.PlazoEjecucionMeses) || null,
      PlazoEjecucionDias: Number(formData.PlazoEjecucionDias) || null,
      NumeroBeneficiarios: Number(formData.NumeroBeneficiarios) || null,
    };

    try {
      console.log("Saving convenio with id:", selectedConvenioId);
      console.log("Form data to save:", formData);
      const response = await fetch(`/api/groconvenios/convenios/${selectedConvenioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ...numericFields,
          fecha_Convenios: formData.fecha_Convenios || null,
          fecha_transferencia: formData.fecha_transferencia || null,
          fecha_limite_inicio: formData.fecha_limite_inicio || null,
          fecha_inicio: formData.fecha_inicio || null,
          fecha_termino: formData.fecha_termino || null,
          fecha_acta_termino: formData.fecha_acta_termino || null,
          motivo_atraso: formData.motivo_atraso || null,
          accion_mitigacion: formData.accion_mitigacion || null,
          fecha_inicio_estimada: formData.fecha_inicio_estimada || null,
          fecha_termino_estimada: formData.fecha_termino_estimada || null,
          Entidad: formData.Entidad || null,
          Programa: formData.Programa || null,
          Proyectista: formData.Proyectista || null,
          Evaluador: formData.Evaluador || null,
          SimboloMonetario: formData.SimboloMonetario || null,
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
        id_grupo: "",
        id_tipo_intervencion: "",
        id_programa_presupuestal: "",
        id_tipo_fenomeno: "",
        id_tipo_material: "",
        id_estado: "",
        id_sub_estado: "",
        id_priorizacion: "",
        id_tipo_meta: "",
        id_Localidad: "",
        id_Distrito: "",
        id_Provincia: "",
        id_Departamento: "",
        fecha_Convenios: "",
        fecha_transferencia: "",
        fecha_limite_inicio: "",
        fecha_inicio: "",
        plazo_ejecucion: "",
        dias_paralizados: "",
        dias_ampliacion: "",
        fecha_termino: "",
        fecha_acta_termino: "",
        motivo_atraso: "",
        accion_mitigacion: "",
        fecha_inicio_estimada: "",
        fecha_termino_estimada: "",
        anio_intervencion: "",
        Entidad: "",
        Programa: "",
        Proyectista: "",
        Evaluador: "",
        PresupuestoBase: "",
        PresupuestoFinanciamiento: "",
        AporteBeneficiario: "",
        SimboloMonetario: "",
        IGV: "",
        PlazoEjecucionMeses: "",
        PlazoEjecucionDias: "",
        NumeroBeneficiarios: "",
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
      const response = await fetch(`/api/groconvenios/convenios/${id}`, { method: "DELETE" });
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-3xl w-full overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Editar Convenio
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Código UGT</label>
                <input
                  type="text"
                  value={formData.cod_ugt}
                  onChange={(e) => setFormData({ ...formData, cod_ugt: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Código Convenio</label>
                <input
                  type="text"
                  value={formData.cod_Convenio}
                  onChange={(e) => setFormData({ ...formData, cod_Convenio: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Nombre Convenio</label>
                <input
                  type="text"
                  value={formData.nombre_Convenio}
                  onChange={(e) => setFormData({ ...formData, nombre_Convenio: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">ID Grupo</label>
                <input
                  type="number"
                  value={formData.id_grupo}
                  onChange={(e) => setFormData({ ...formData, id_grupo: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">ID Tipo Intervención</label>
                <input
                  type="number"
                  value={formData.id_tipo_intervencion}
                  onChange={(e) => setFormData({ ...formData, id_tipo_intervencion: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">ID Programa Presupuestal</label>
                <input
                  type="number"
                  value={formData.id_programa_presupuestal}
                  onChange={(e) => setFormData({ ...formData, id_programa_presupuestal: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">ID Tipo Fenómeno</label>
                <input
                  type="number"
                  value={formData.id_tipo_fenomeno}
                  onChange={(e) => setFormData({ ...formData, id_tipo_fenomeno: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">ID Tipo Material</label>
                <input
                  type="number"
                  value={formData.id_tipo_material}
                  onChange={(e) => setFormData({ ...formData, id_tipo_material: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">ID Estado</label>
                <input
                  type="number"
                  value={formData.id_estado}
                  onChange={(e) => setFormData({ ...formData, id_estado: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">ID Sub Estado</label>
                <input
                  type="number"
                  value={formData.id_sub_estado}
                  onChange={(e) => setFormData({ ...formData, id_sub_estado: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">ID Priorización</label>
                <input
                  type="number"
                  value={formData.id_priorizacion}
                  onChange={(e) => setFormData({ ...formData, id_priorizacion: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">ID Tipo Meta</label>
                <input
                  type="number"
                  value={formData.id_tipo_meta}
                  onChange={(e) => setFormData({ ...formData, id_tipo_meta: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">ID Localidad</label>
                <input
                  type="number"
                  value={formData.id_Localidad}
                  onChange={(e) => setFormData({ ...formData, id_Localidad: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">ID Distrito</label>
                <input
                  type="number"
                  value={formData.id_Distrito}
                  onChange={(e) => setFormData({ ...formData, id_Distrito: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">ID Provincia</label>
                <input
                  type="number"
                  value={formData.id_Provincia}
                  onChange={(e) => setFormData({ ...formData, id_Provincia: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">ID Departamento</label>
                <input
                  type="number"
                  value={formData.id_Departamento}
                  onChange={(e) => setFormData({ ...formData, id_Departamento: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Fecha Convenios</label>
                <input
                  type="date"
                  value={formData.fecha_Convenios}
                  onChange={(e) => setFormData({ ...formData, fecha_Convenios: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Fecha Transferencia</label>
                <input
                  type="date"
                  value={formData.fecha_transferencia}
                  onChange={(e) => setFormData({ ...formData, fecha_transferencia: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Fecha Límite Inicio</label>
                <input
                  type="date"
                  value={formData.fecha_limite_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_limite_inicio: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Plazo Ejecución</label>
                <input
                  type="number"
                  value={formData.plazo_ejecucion}
                  onChange={(e) => setFormData({ ...formData, plazo_ejecucion: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Días Paralizados</label>
                <input
                  type="number"
                  value={formData.dias_paralizados}
                  onChange={(e) => setFormData({ ...formData, dias_paralizados: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Días Ampliación</label>
                <input
                  type="number"
                  value={formData.dias_ampliacion}
                  onChange={(e) => setFormData({ ...formData, dias_ampliacion: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Fecha Término</label>
                <input
                  type="date"
                  value={formData.fecha_termino}
                  onChange={(e) => setFormData({ ...formData, fecha_termino: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Fecha Acta Término</label>
                <input
                  type="date"
                  value={formData.fecha_acta_termino}
                  onChange={(e) => setFormData({ ...formData, fecha_acta_termino: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Motivo Atraso</label>
                <input
                  type="text"
                  value={formData.motivo_atraso}
                  onChange={(e) => setFormData({ ...formData, motivo_atraso: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Acción Mitigación</label>
                <input
                  type="text"
                  value={formData.accion_mitigacion}
                  onChange={(e) => setFormData({ ...formData, accion_mitigacion: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Fecha Inicio Estimada</label>
                <input
                  type="date"
                  value={formData.fecha_inicio_estimada}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio_estimada: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Fecha Término Estimada</label>
                <input
                  type="date"
                  value={formData.fecha_termino_estimada}
                  onChange={(e) => setFormData({ ...formData, fecha_termino_estimada: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Año Intervención</label>
                <input
                  type="number"
                  value={formData.anio_intervencion}
                  onChange={(e) => setFormData({ ...formData, anio_intervencion: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Entidad</label>
                <input
                  type="text"
                  value={formData.Entidad}
                  onChange={(e) => setFormData({ ...formData, Entidad: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Programa</label>
                <input
                  type="text"
                  value={formData.Programa}
                  onChange={(e) => setFormData({ ...formData, Programa: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Proyectista</label>
                <input
                  type="text"
                  value={formData.Proyectista}
                  onChange={(e) => setFormData({ ...formData, Proyectista: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Evaluador</label>
                <input
                  type="text"
                  value={formData.Evaluador}
                  onChange={(e) => setFormData({ ...formData, Evaluador: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Presupuesto Base</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.PresupuestoBase}
                  onChange={(e) => setFormData({ ...formData, PresupuestoBase: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Presupuesto Financiamiento</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.PresupuestoFinanciamiento}
                  onChange={(e) => setFormData({ ...formData, PresupuestoFinanciamiento: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Aporte Beneficiario</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.AporteBeneficiario}
                  onChange={(e) => setFormData({ ...formData, AporteBeneficiario: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Símbolo Monetario</label>
                <input
                  type="text"
                  value={formData.SimboloMonetario}
                  onChange={(e) => setFormData({ ...formData, SimboloMonetario: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">IGV</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.IGV}
                  onChange={(e) => setFormData({ ...formData, IGV: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Plazo Ejecución Meses</label>
                <input
                  type="number"
                  value={formData.PlazoEjecucionMeses}
                  onChange={(e) => setFormData({ ...formData, PlazoEjecucionMeses: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Plazo Ejecución Días</label>
                <input
                  type="number"
                  value={formData.PlazoEjecucionDias}
                  onChange={(e) => setFormData({ ...formData, PlazoEjecucionDias: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Número Beneficiarios</label>
                <input
                  type="number"
                  value={formData.NumeroBeneficiarios}
                  onChange={(e) => setFormData({ ...formData, NumeroBeneficiarios: e.target.value })}
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
                    id_grupo: "",
                    id_tipo_intervencion: "",
                    id_programa_presupuestal: "",
                    id_tipo_fenomeno: "",
                    id_tipo_material: "",
                    id_estado: "",
                    id_sub_estado: "",
                    id_priorizacion: "",
                    id_tipo_meta: "",
                    id_Localidad: "",
                    id_Distrito: "",
                    id_Provincia: "",
                    id_Departamento: "",
                    fecha_Convenios: "",
                    fecha_transferencia: "",
                    fecha_limite_inicio: "",
                    fecha_inicio: "",
                    plazo_ejecucion: "",
                    dias_paralizados: "",
                    dias_ampliacion: "",
                    fecha_termino: "",
                    fecha_acta_termino: "",
                    motivo_atraso: "",
                    accion_mitigacion: "",
                    fecha_inicio_estimada: "",
                    fecha_termino_estimada: "",
                    anio_intervencion: "",
                    Entidad: "",
                    Programa: "",
                    Proyectista: "",
                    Evaluador: "",
                    PresupuestoBase: "",
                    PresupuestoFinanciamiento: "",
                    AporteBeneficiario: "",
                    SimboloMonetario: "",
                    IGV: "",
                    PlazoEjecucionMeses: "",
                    PlazoEjecucionDias: "",
                    NumeroBeneficiarios: "",
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