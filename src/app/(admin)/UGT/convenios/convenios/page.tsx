
"use client";
import React, { useState, useEffect } from "react";
import { FiEye } from "react-icons/fi";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

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
  personal_asignado: {
    id_persona: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    cargo: string;
    fecha_inicio: string;
    fecha_fin: string | null;
  }[];
}

const VerConvenios = () => {
  const [filterAnio, setFilterAnio] = useState<string>("2025");
  const [filterCodConvenio, setFilterCodConvenio] = useState<string>("");
  const [filterEstado, setFilterEstado] = useState<string>("");
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [filteredConvenios, setFilteredConvenios] = useState<Convenio[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(15);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedPersonal, setSelectedPersonal] = useState<Convenio["personal_asignado"]>([]);
  const [selectedEstado, setSelectedEstado] = useState<string>("");
  const router = useRouter();

  const estadoColores: { [key: string]: { bg: string; text: string } } = {
    "POR INICIAR": { bg: "bg-yellow-100 dark:bg-yellow-900", text: "text-yellow-800 dark:text-yellow-200" },
    "EN EJECUCION": { bg: "bg-green-100 dark:bg-green-900", text: "text-green-800 dark:text-green-200" },
    CONCLUIDO: { bg: "bg-gray-100 dark:bg-gray-900", text: "text-gray-800 dark:text-gray-200" },
    PARALIZADA: { bg: "bg-red-100 dark:bg-red-900", text: "text-red-800 dark:text-red-200" },
    LIQUIDADO: { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-800 dark:text-blue-200" },
  };

  const estadoIds: { [key: string]: number } = {
    "POR INICIAR": 1,
    "EN EJECUCION": 2,
    CONCLUIDO: 3,
    PARALIZADA: 4,
    LIQUIDADO: 5,
  };

  const priorityRoles = ["Representante", "Coordinador", "Supervisor", "Residente", "Asistente Técnico de Planta"];

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
          ) || "POR INICIAR",
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
    let filtered = convenios;
    
    if (filterAnio) {
      filtered = filtered.filter((c) => String(c.anio_intervencion) === filterAnio);
    }
    
    if (filterCodConvenio) {
      filtered = filtered.filter((c) =>
        c.cod_Convenio?.toLowerCase().includes(filterCodConvenio.toLowerCase())
      );
    }
    
    if (filterEstado) {
      filtered = filtered.filter((c) => c.Estado_Convenio === filterEstado);
    }
    
    console.log("Filtered convenios:", filtered);
    setFilteredConvenios(filtered);
    setCurrentPage(1);
  }, [filterAnio, filterCodConvenio, filterEstado, convenios]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleView = (id: string) => {
    const convenio = convenios.find((c) => c.id_convenio === id);
    if (convenio?.Estado_Convenio === "CONCLUIDO") {
      setError("No se puede editar un convenio concluido.");
      return;
    }
    setSelectedEstado(convenio?.Estado_Convenio || "No definido");
    router.push(`/UGT/convenios/${id}/detalle`);
  };

  const handleViewMore = (personal: Convenio["personal_asignado"], estado: string) => {
    setSelectedPersonal(personal);
    setSelectedEstado(estado);
    setShowModal(true);
  };

  const handleExportToExcel = () => {
    const exportData = filteredConvenios.map((convenio) => ({
      "ID Convenio": convenio.id_convenio,
      "Código UGRESS": convenio.cod_ugt ?? "N/A",
      "Estado Convenio": convenio.Estado_Convenio ?? "N/A",
      "Código Convenio": convenio.cod_Convenio ?? "N/A",
      "Nombre Convenio": convenio.nombre_Convenio,
      "Grupo": convenio.Grupo ?? "N/A",
      "Tipo Intervención": convenio.Interevencion ?? "N/A",
      "Programa Presupuestal": convenio.Programa_Presupuestal ?? "N/A",
      "Tipo Fenómeno": convenio.Tipo_Fenomeno ?? "N/A",
      "Tipo Material": convenio.Tipo_Material ?? "N/A",
      "Sub Estado": convenio.Sub_Estado_Convenio ?? "N/A",
      "Priorización": convenio.Priorizacion ?? "N/A",
      "Tipo Meta": convenio.Meta ?? "N/A",
      "Localidad": convenio.Localidad ?? "N/A",
      "Distrito": convenio.Distrito ?? "N/A",
      "Provincia": convenio.Provincia ?? "N/A",
      "Departamento": convenio.Departamento ?? "N/A",
      "Fecha Convenios": convenio.fecha_Convenios ? new Date(convenio.fecha_Convenios).toLocaleDateString() : "N/A",
      "Fecha Transferencia": convenio.fecha_transferencia ? new Date(convenio.fecha_transferencia).toLocaleDateString() : "N/A",
      "Fecha Límite Inicio": convenio.fecha_limite_inicio ? new Date(convenio.fecha_limite_inicio).toLocaleDateString() : "N/A",
      "Fecha Inicio": convenio.fecha_inicio ? new Date(convenio.fecha_inicio).toLocaleDateString() : "N/A",
      "Plazo Ejecución": convenio.plazo_ejecucion ?? "N/A",
      "Días Paralizados": convenio.dias_paralizados ?? "N/A",
      "Días Ampliación": convenio.dias_ampliacion ?? "N/A",
      "Fecha Término": convenio.fecha_termino ? new Date(convenio.fecha_termino).toLocaleDateString() : "N/A",
      "Fecha Acta Término": convenio.fecha_acta_termino ? new Date(convenio.fecha_acta_termino).toLocaleDateString() : "N/A",
      "Motivo Atraso": convenio.motivo_atraso ?? "N/A",
      "Acción Mitigación": convenio.accion_mitigacion ?? "N/A",
      "Fecha Inicio Estimada": convenio.fecha_inicio_estimada ? new Date(convenio.fecha_inicio_estimada).toLocaleDateString() : "N/A",
      "Fecha Término Estimada": convenio.fecha_termino_estimada ? new Date(convenio.fecha_termino_estimada).toLocaleDateString() : "N/A",
      "Año Intervención": convenio.anio_intervencion ?? "N/A",
      "Entidad": convenio.Entidad ?? "N/A",
      "Programa": convenio.Programa ?? "N/A",
      "Proyectista": convenio.Proyectista ?? "N/A",
      "Evaluador": convenio.Evaluador ?? "N/A",
      "Presupuesto Base": convenio.PresupuestoBase ? convenio.PresupuestoBase.toFixed(2) : "N/A",
      "Presupuesto Financiamiento": convenio.PresupuestoFinanciamiento ? convenio.PresupuestoFinanciamiento.toFixed(2) : "N/A",
      "Aporte Beneficiario": convenio.AporteBeneficiario ? convenio.AporteBeneficiario.toFixed(2) : "N/A",
      "Símbolo Monetario": convenio.SimboloMonetario ?? "N/A",
      "IGV": convenio.IGV ? convenio.IGV.toFixed(2) : "N/A",
      "Plazo Ejecución Meses": convenio.PlazoEjecucionMeses ?? "N/A",
      "Plazo Ejecución Días": convenio.PlazoEjecucionDias ?? "N/A",
      "Número Beneficiarios": convenio.NumeroBeneficiarios ?? "N/A",
      "Creado En": convenio.CreadoEn ? new Date(convenio.CreadoEn).toLocaleDateString() : "N/A",
      "Actualizado En": convenio.ActualizadoEn ? new Date(convenio.ActualizadoEn).toLocaleDateString() : "N/A",
      "Personal Asignado": convenio.personal_asignado && convenio.personal_asignado.length > 0
        ? convenio.personal_asignado.map(p => `${p.nombre} ${p.apellido_paterno} (${p.cargo})`).join(", ")
        : "Sin personal asignado",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, "Convenios");
    XLSX.writeFile(wb, "Convenios_Export.xlsx");
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredConvenios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredConvenios.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const tableHeaders = [
    "ID Convenio",
    "Código UGRESS",
    "Estado Convenio",
    "Código Convenio",
    "Nombre Convenio",
    "Grupo",
    "Tipo Intervención",
    "Programa Presupuestal",
    "Tipo Fenómeno",
    "Tipo Material",
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
    "Personal Asignado",
    "Acción",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full">
      <div className="p-6 w-full max-w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Convenios
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row sm:space-x-4">
          <button
            onClick={handleExportToExcel}
            className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Exportar a Excel
          </button>
          <div>
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
          <div>
            <label className="mr-2 text-gray-700 dark:text-gray-300 font-medium">
              Filtrar por Código Convenio:
            </label>
            <input
              type="text"
              value={filterCodConvenio}
              onChange={(e) => setFilterCodConvenio(e.target.value)}
              placeholder="Ingresa el código"
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mr-2 text-gray-700 dark:text-gray-300 font-medium">
              Filtrar por Estado Convenio:
            </label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="POR INICIAR">Por Iniciar</option>
              <option value="EN EJECUCION">En Ejecución</option>
              <option value="CONCLUIDO">Concluido</option>
              <option value="PARALIZADA">Paralizada</option>
              <option value="LIQUIDADO">Liquidado</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg shadow-lg w-full">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
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
              {currentItems.length > 0 ? (
                currentItems.map((convenio) => {
                  const estado = convenio.Estado_Convenio || "No definido";
                  const colores = estadoColores[estado] || {
                    bg: "bg-gray-100 dark:bg-gray-700",
                    text: "text-gray-800 dark:text-gray-200",
                  };
                  const isConcluido = estado === "CONCLUIDO";
                  const nombreTruncated = convenio.nombre_Convenio
                    ? convenio.nombre_Convenio.length > 20
                      ? `${convenio.nombre_Convenio.slice(0, 20)}...`
                      : convenio.nombre_Convenio
                    : "N/A";
                  
                  const prioritizedPersonal = convenio.personal_asignado
                    .filter((persona) => priorityRoles.includes(persona.cargo))
                    .sort((a, b) => priorityRoles.indexOf(a.cargo) - priorityRoles.indexOf(b.cargo));
                  
                  const otherPersonal = convenio.personal_asignado
                    .filter((persona) => !priorityRoles.includes(persona.cargo));

                  return (
                    <tr
                      key={convenio.id_convenio}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.id_convenio}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.cod_ugt ?? "N/A"}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${colores.bg} ${colores.text}`}
                        >
                          {estado}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.cod_Convenio ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{nombreTruncated}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Grupo ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Interevencion ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Programa_Presupuestal ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Tipo_Fenomeno ?? "N/A"}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white">{convenio.Tipo_Material ?? "N/A"}</td>
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
                      <td className="py-4 px-4 text-gray-900 dark:text-white">
                        {convenio.personal_asignado && convenio.personal_asignado.length > 0 ? (
                          <div>
                            <ul className="list-disc pl-4">
                              {prioritizedPersonal.map((persona, index) => (
                                <li key={index}>
                                  {`${persona.nombre} ${persona.apellido_paterno} (${persona.cargo})`}
                                </li>
                              ))}
                            </ul>
                            {otherPersonal.length > 0 && (
                              <button
                                onClick={() => handleViewMore(convenio.personal_asignado, estado)}
                                className="text-blue-500 hover:text-blue-600 flex items-center mt-1 text-sm"
                              >
                                <FiEye size={16} className="mr-1" />
                                Ver más
                              </button>
                            )}
                          </div>
                        ) : (
                          "Sin personal asignado"
                        )}
                      </td>
                      <td className="py-4 px-4 flex space-x-2 sticky right-0 bg-white dark:bg-gray-800 z-10">
                        <button
                          onClick={() => handleView(convenio.id_convenio)}
                          className={`${
                            isConcluido
                              ? "opacity-50 cursor-not-allowed"
                              : "text-blue-500 hover:text-blue-600"
                          } transition-colors`}
                          title="Ver"
                          disabled={isConcluido}
                        >
                          <FiEye size={20} />
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

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                Personal Asignado Completo
              </h2>
              <div className="mb-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    estadoColores[selectedEstado]?.bg || "bg-gray-100 dark:bg-gray-700"
                  } ${
                    estadoColores[selectedEstado]?.text || "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {selectedEstado}
                </span>
              </div>
              <ul className="list-disc pl-4 text-gray-900 dark:text-white">
                {selectedPersonal.map((persona, index) => (
                  <li key={index}>
                    {`${persona.nombre} ${persona.apellido_paterno} (${persona.cargo})`}
                  </li>
                ))}
              </ul>
              <button
                onChange={() => setShowModal(false)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center space-x-2 w-full overflow-x-auto max-w-full">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
              const startPage = Math.max(1, currentPage - 2);
              const pageNumber = startPage + index;
              if (pageNumber <= totalPages) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === pageNumber
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              }
              return null;
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerConvenios;
