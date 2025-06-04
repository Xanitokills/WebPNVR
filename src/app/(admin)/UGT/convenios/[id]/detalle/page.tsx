"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// Interfaces
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
  AporteBeneficiario: string | null;
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

interface Grupo {
  id_grupo: number;
  nombre: string;
  estado: number | string;
}

interface TipoIntervencion {
  id_tipo_intervencion: number;
  descripcion: string;
}

interface TipoFenomeno {
  id_tipo_fenomeno: number;
  descripcion: string;
}

interface TipoMaterial {
  id_tipo_material: number;
  descripcion: string;
}

interface Cargo {
  id_cargo: number;
  descripcion: string;
}

interface Persona {
  id_personal: number;
  id_cargo: number;
  descripcion: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  dni: string;
  celular: string;
  correo: string;
  profesion: string | null;
}

const DetalleConvenio = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [convenio, setConvenio] = useState<Convenio | null>(null);
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
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [tipoIntervenciones, setTipoIntervenciones] = useState<TipoIntervencion[]>([]);
  const [tipoFenomenos, setTipoFenomenos] = useState<TipoFenomeno[]>([]);
  const [tipoMateriales, setTipoMateriales] = useState<TipoMaterial[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [personasDisponibles, setPersonasDisponibles] = useState<Persona[]>([]);
  const [personasFiltradas, setPersonasFiltradas] = useState<Persona[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fechaFiltroInicio, setFechaFiltroInicio] = useState<string>("");
  const [fechaFiltroFin, setFechaFiltroFin] = useState<string>("");

  // Estado para manejar las asignaciones temporales (antes de guardar)
  const [personalAsignadoTemporal, setPersonalAsignadoTemporal] = useState<
    Convenio["personal_asignado"]
  >([]);

  // Estados para manejar la asignación de personal
  const [selectedCargo, setSelectedCargo] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [fechaInicioAsignacion, setFechaInicioAsignacion] = useState<string>("");
  const [fechaFinAsignacion, setFechaFinAsignacion] = useState<string>("");

  // Cargar datos iniciales
  useEffect(() => {
    const fetchConvenio = async () => {
      try {
        const response = await fetch(`/api/groconvenios/convenios/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const convenioEncontrado = await response.json();
        if (!convenioEncontrado) {
          throw new Error("Convenio no encontrado");
        }
        setConvenio(convenioEncontrado);
        setPersonalAsignadoTemporal(convenioEncontrado.personal_asignado || []);

        // Inicializar formData con los datos del convenio
        setFormData({
          cod_ugt: convenioEncontrado.cod_ugt || "",
          cod_Convenio: convenioEncontrado.cod_Convenio || "",
          nombre_Convenio: convenioEncontrado.nombre_Convenio || "",
          id_grupo: convenioEncontrado.id_grupo !== null ? String(convenioEncontrado.id_grupo) : "",
          id_tipo_intervencion: convenioEncontrado.id_tipo_intervencion !== null ? String(convenioEncontrado.id_tipo_intervencion) : "",
          id_programa_presupuestal: convenioEncontrado.id_programa_presupuestal !== null ? String(convenioEncontrado.id_programa_presupuestal) : "",
          id_tipo_fenomeno: convenioEncontrado.id_tipo_fenomeno !== null ? String(convenioEncontrado.id_tipo_fenomeno) : "",
          id_tipo_material: convenioEncontrado.id_tipo_material !== null ? String(convenioEncontrado.id_tipo_material) : "",
          id_estado: convenioEncontrado.id_estado !== null ? String(convenioEncontrado.id_estado) : "",
          id_sub_estado: convenioEncontrado.id_sub_estado !== null ? String(convenioEncontrado.id_sub_estado) : "",
          id_priorizacion: convenioEncontrado.id_priorizacion !== null ? String(convenioEncontrado.id_priorizacion) : "",
          id_tipo_meta: convenioEncontrado.id_tipo_meta !== null ? String(convenioEncontrado.id_tipo_meta) : "",
          id_Localidad: convenioEncontrado.id_Localidad !== null ? String(convenioEncontrado.id_Localidad) : "",
          id_Distrito: convenioEncontrado.id_Distrito !== null ? String(convenioEncontrado.id_Distrito) : "",
          id_Provincia: convenioEncontrado.id_Provincia !== null ? String(convenioEncontrado.id_Provincia) : "",
          id_Departamento: convenioEncontrado.id_Departamento !== null ? String(convenioEncontrado.id_Departamento) : "",
          fecha_Convenios: convenioEncontrado.fecha_Convenios ? convenioEncontrado.fecha_Convenios.split("T")[0] : "",
          fecha_transferencia: convenioEncontrado.fecha_transferencia ? convenioEncontrado.fecha_transferencia.split("T")[0] : "",
          fecha_limite_inicio: convenioEncontrado.fecha_limite_inicio ? convenioEncontrado.fecha_limite_inicio.split("T")[0] : "",
          fecha_inicio: convenioEncontrado.fecha_inicio ? convenioEncontrado.fecha_inicio.split("T")[0] : "",
          plazo_ejecucion: convenioEncontrado.plazo_ejecucion !== null ? String(convenioEncontrado.plazo_ejecucion) : "",
          dias_paralizados: convenioEncontrado.dias_paralizados !== null ? String(convenioEncontrado.dias_paralizados) : "",
          dias_ampliacion: convenioEncontrado.dias_ampliacion !== null ? String(convenioEncontrado.dias_ampliacion) : "",
          fecha_termino: convenioEncontrado.fecha_termino ? convenioEncontrado.fecha_termino.split("T")[0] : "",
          fecha_acta_termino: convenioEncontrado.fecha_acta_termino ? convenioEncontrado.fecha_acta_termino.split("T")[0] : "",
          motivo_atraso: convenioEncontrado.motivo_atraso || "",
          accion_mitigacion: convenioEncontrado.accion_mitigacion || "",
          fecha_inicio_estimada: convenioEncontrado.fecha_inicio_estimada ? convenioEncontrado.fecha_inicio_estimada.split("T")[0] : "",
          fecha_termino_estimada: convenioEncontrado.fecha_termino_estimada ? convenioEncontrado.fecha_termino_estimada.split("T")[0] : "",
          anio_intervencion: convenioEncontrado.anio_intervencion !== null ? String(convenioEncontrado.anio_intervencion) : "",
          Entidad: convenioEncontrado.Entidad || "",
          Programa: convenioEncontrado.Programa || "",
          Proyectista: convenioEncontrado.Proyectista || "",
          Evaluador: convenioEncontrado.Evaluador || "",
          PresupuestoBase: convenioEncontrado.PresupuestoBase !== null ? String(convenioEncontrado.PresupuestoBase) : "",
          PresupuestoFinanciamiento: convenioEncontrado.PresupuestoFinanciamiento !== null ? String(convenioEncontrado.PresupuestoFinanciamiento) : "",
          AporteBeneficiario: convenioEncontrado.AporteBeneficiario !== null ? String(convenioEncontrado.AporteBeneficiario) : "",
          SimboloMonetario: convenioEncontrado.SimboloMonetario || "",
          IGV: convenioEncontrado.IGV !== null ? String(convenioEncontrado.IGV) : "",
          PlazoEjecucionMeses: convenioEncontrado.PlazoEjecucionMeses !== null ? String(convenioEncontrado.PlazoEjecucionMeses) : "",
          PlazoEjecucionDias: convenioEncontrado.PlazoEjecucionDias !== null ? String(convenioEncontrado.PlazoEjecucionDias) : "",
          NumeroBeneficiarios: convenioEncontrado.NumeroBeneficiarios !== null ? String(convenioEncontrado.NumeroBeneficiarios) : "",
        });
      } catch (error) {
        console.error("Error fetching convenio:", error);
        setError("No se pudo cargar el convenio");
      }
    };

    const fetchGrupos = async () => {
      try {
        const response = await fetch("/api/groconvenios/grupo");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const activeGroups = data.filter((grupo: Grupo) => grupo.estado === 1 || grupo.estado === "vigente");
        setGrupos(activeGroups);
      } catch (error) {
        console.error("Error fetching grupos:", error);
        setError("No se pudieron cargar los grupos");
      }
    };

    const fetchTipoIntervenciones = async () => {
      try {
        const response = await fetch("/api/groconvenios/tipointervencion");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setTipoIntervenciones(data);
      } catch (error) {
        console.error("Error fetching tipo intervenciones:", error);
        setError("No se pudieron cargar los tipos de intervención");
      }
    };

    const fetchTipoFenomenos = async () => {
      try {
        const response = await fetch("/api/groconvenios/tipofenomeno");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setTipoFenomenos(data);
      } catch (error) {
        console.error("Error fetching tipo fenomenos:", error);
        setError("No se pudieron cargar los tipos de fenómeno");
      }
    };

    const fetchTipoMateriales = async () => {
      try {
        const response = await fetch("/api/groconvenios/tipomaterial");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setTipoMateriales(data);
      } catch (error) {
        console.error("Error fetching tipo materiales:", error);
        setError("No se pudieron cargar los tipos de material");
      }
    };

    const fetchCargos = async () => {
      try {
        const response = await fetch("/api/groconvenios/cargo");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCargos(data);
      } catch (error) {
        console.error("Error fetching cargos:", error);
        setError("No se pudieron cargar los cargos");
      }
    };

    const fetchPersonasDisponibles = async () => {
      try {
        const response = await fetch("/api/groconvenios/personal");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setPersonasDisponibles(data);
        setPersonasFiltradas([]); // Inicialmente no hay personas filtradas
      } catch (error) {
        console.error("Error fetching personal:", error);
        setError("No se pudo cargar el personal disponible");
      }
    };

    fetchConvenio();
    fetchGrupos();
    fetchTipoIntervenciones();
    fetchTipoFenomenos();
    fetchTipoMateriales();
    fetchCargos();
    fetchPersonasDisponibles();
  }, [id]);

  // Filtrar personas cuando cambia el cargo seleccionado
  useEffect(() => {
    if (selectedCargo) {
      const filtered = personasDisponibles.filter(
        (persona) => persona.descripcion && persona.descripcion.toLowerCase() === selectedCargo.toLowerCase()
      );
      console.log("Cargo seleccionado:", selectedCargo);
      console.log("Personas disponibles para filtrar:", personasDisponibles.map(p => ({ id: p.id_personal, descripcion: p.descripcion })));
      console.log("Personas filtradas:", filtered);
      setPersonasFiltradas(filtered);
    } else {
      setPersonasFiltradas([]);
    }
    setSelectedPersona(""); // Resetear la persona seleccionada al cambiar el cargo
  }, [selectedCargo, personasDisponibles]);

  // Manejar errores temporales
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Manejar asignación de personal
  const handleAsignar = () => {
    if (!selectedCargo || !selectedPersona || !fechaInicioAsignacion) {
      setError("Debe seleccionar un cargo, una persona y una fecha de inicio");
      return;
    }

    const persona = personasFiltradas.find((p) => String(p.id_personal) === selectedPersona);
    if (!persona) {
      setError("Persona no encontrada");
      return;
    }

    // Verificar si el cargo ya está asignado a otra persona
    const cargoOcupado = personalAsignadoTemporal.some(
      (p) => p.cargo === selectedCargo && !p.fecha_fin
    );
    if (cargoOcupado) {
      setError("Este cargo ya está asignado a otra persona");
      return;
    }

    const nuevaAsignacion = {
      id_persona: persona.id_personal,
      nombre: persona.nombre,
      apellido_paterno: persona.apellido_paterno,
      apellido_materno: persona.apellido_materno,
      cargo: selectedCargo,
      fecha_inicio: fechaInicioAsignacion,
      fecha_fin: fechaFinAsignacion || null,
    };

    setPersonalAsignadoTemporal([...personalAsignadoTemporal, nuevaAsignacion]);

    // Limpiar el formulario de asignación
    setSelectedCargo("");
    setSelectedPersona("");
    setFechaInicioAsignacion("");
    setFechaFinAsignacion("");
  };

  // Manejar desasignación de personal
  const handleDesasignar = (idPersona: number, cargo: string) => {
    const asignacion = personalAsignadoTemporal.find(
      (p) => p.id_persona === idPersona && p.cargo === cargo && !p.fecha_fin
    );
    if (!asignacion) return;

    // Si no tiene fecha de fin, establecerla como la fecha actual
    const updatedAsignaciones = personalAsignadoTemporal.map((p) =>
      p.id_persona === idPersona && p.cargo === cargo && !p.fecha_fin
        ? { ...p, fecha_fin: new Date().toISOString().split("T")[0] }
        : p
    );
    setPersonalAsignadoTemporal(updatedAsignaciones);
  };

  // Guardar cambios (edición y asignaciones)
  const handleSave = async () => {
    if (!id) {
      setError("El ID del convenio no es válido.");
      return;
    }

    if (!formData.nombre_Convenio) {
      setError("El nombre del convenio es obligatorio.");
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
      fechaConvenios,
      fechaTransferencia,
      fechaLimiteInicio,
      fechaInicio,
      fechaTermino,
      fechaActaTermino,
      fechaInicioEstimada,
      fechaTerminoEstimada,
    ].filter((date) => date && isNaN(date.getTime()));

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
      const response = await fetch(`/api/groconvenios/convenios/update/${id}`, {
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
          personal_asignado: personalAsignadoTemporal,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || "Error al actualizar el convenio");
      }

      router.push("/UGT/convenios/convenios"); // Redirigir de vuelta a la lista de convenios
    } catch (error) {
      console.error("Error al actualizar el convenio:", error);
      setError(error instanceof Error ? error.message : "Error al actualizar el convenio");
    }
  };

  // Filtrar el histórico por rango de fechas
  const historialFiltrado = personalAsignadoTemporal.filter((asignacion) => {
    const fechaInicio = new Date(asignacion.fecha_inicio);
    const fechaFin = asignacion.fecha_fin ? new Date(asignacion.fecha_fin) : new Date();
    const filtroInicio = fechaFiltroInicio ? new Date(fechaFiltroInicio) : null;
    const filtroFin = fechaFiltroFin ? new Date(fechaFiltroFin) : null;

    if (filtroInicio && fechaFin < filtroInicio) return false;
    if (filtroFin && fechaInicio > filtroFin) return false;
    return true;
  });

  if (!convenio) {
    return <div className="p-6 text-gray-900 dark:text-white">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="ml-0 lg:ml-[90px] transition-all duration-300 ease-in-out p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Detalle del Convenio: {convenio.nombre_Convenio}
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Sección de Edición del Convenio */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Editar Datos del Convenio
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <select
                value={formData.id_grupo}
                onChange={(e) => setFormData({ ...formData, id_grupo: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un grupo</option>
                {grupos.map((grupo) => (
                  <option key={grupo.id_grupo} value={String(grupo.id_grupo)}>
                    {grupo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Tipo Intervención</label>
              <select
                value={formData.id_tipo_intervencion}
                onChange={(e) => setFormData({ ...formData, id_tipo_intervencion: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un tipo de intervención</option>
                {tipoIntervenciones.map((tipo) => (
                  <option key={tipo.id_tipo_intervencion} value={String(tipo.id_tipo_intervencion)}>
                    {tipo.descripcion}
                  </option>
                ))}
              </select>
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
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Tipo Fenómeno</label>
              <select
                value={formData.id_tipo_fenomeno}
                onChange={(e) => setFormData({ ...formData, id_tipo_fenomeno: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un tipo de fenómeno</option>
                {tipoFenomenos.map((fenomeno) => (
                  <option key={fenomeno.id_tipo_fenomeno} value={String(fenomeno.id_tipo_fenomeno)}>
                    {fenomeno.descripcion}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Tipo Material</label>
              <select
                value={formData.id_tipo_material}
                onChange={(e) => setFormData({ ...formData, id_tipo_material: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un tipo de material</option>
                {tipoMateriales.map((material) => (
                  <option key={material.id_tipo_material} value={String(material.id_tipo_material)}>
                    {material.descripcion}
                  </option>
                ))}
              </select>
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
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Aporte Beneficiario</label>
              <input
                type="number"
                step="0.01"
                value={formData.AporteBeneficiario}
                onChange={(e) => setFormData({ ...formData, AporteBeneficiario: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Símbolo Monetario</label>
              <input
                type="text"
                value={formData.SimboloMonetario}
                onChange={(e) => setFormData({ ...formData, SimboloMonetario: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">IGV</label>
              <input
                type="number"
                step="0.01"
                value={formData.IGV}
                onChange={(e) => setFormData({ ...formData, IGV: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Plazo Ejecución Meses</label>
              <input
                type="number"
                value={formData.PlazoEjecucionMeses}
                onChange={(e) => setFormData({ ...formData, PlazoEjecucionMeses: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Plazo Ejecución Días</label>
              <input
                type="number"
                value={formData.PlazoEjecucionDias}
                onChange={(e) => setFormData({ ...formData, PlazoEjecucionDias: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Número Beneficiarios</label>
              <input
                type="number"
                value={formData.NumeroBeneficiarios}
                onChange={(e) => setFormData({ ...formData, NumeroBeneficiarios: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sección de Asignación de Personal */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Asignar Personal
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Cargo</label>
              <select
                value={selectedCargo}
                onChange={(e) => setSelectedCargo(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un cargo</option>
                {cargos.map((cargo) => (
                  <option key={cargo.id_cargo} value={cargo.descripcion}>
                    {cargo.descripcion}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Persona</label>
              <select
                value={selectedPersona}
                onChange={(e) => setSelectedPersona(e.target.value)}
                disabled={!selectedCargo || personasFiltradas.length === 0}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Seleccione una persona</option>
                {personasFiltradas.map((persona) => (
                  <option key={persona.id_personal} value={String(persona.id_personal)}>
                    {`${persona.nombre} ${persona.apellido_paterno} ${persona.apellido_materno}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicioAsignacion}
                onChange={(e) => setFechaInicioAsignacion(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Fecha Final</label>
              <input
                type="date"
                value={fechaFinAsignacion}
                onChange={(e) => setFechaFinAsignacion(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleAsignar}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Asignar Personal
          </button>
        </div>

        {/* Sección de Personal Asignado */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Personal Asignado Actual
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Nombre</th>
                  <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Cargo</th>
                  <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Fecha Inicio</th>
                  <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Fecha Fin</th>
                  <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {personalAsignadoTemporal
                  .filter((asignacion) => !asignacion.fecha_fin)
                  .map((asignacion) => (
                    <tr key={`${asignacion.id_persona}-${asignacion.cargo}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200">
                        {`${asignacion.nombre} ${asignacion.apellido_paterno} ${asignacion.apellido_materno}`}
                      </td>
                      <td className="py-2 px-4 border-b text-gray-600 dark:text-gray-300">{asignacion.cargo}</td>
                      <td className="py-2 px-4 border-b text-gray-600 dark:text-gray-300">{asignacion.fecha_inicio}</td>
                      <td className="py-2 px-4 border-b text-gray-600 dark:text-gray-300">{asignacion.fecha_fin || "N/A"}</td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => handleDesasignar(asignacion.id_persona, asignacion.cargo)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                        >
                          Desasignar
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sección de Historial de Asignaciones */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Historial de Asignaciones
          </h2>
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Fecha Desde</label>
              <input
                type="date"
                value={fechaFiltroInicio}
                onChange={(e) => setFechaFiltroInicio(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={fechaFiltroFin}
                onChange={(e) => setFechaFiltroFin(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Nombre</th>
                  <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Cargo</th>
                  <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Fecha Inicio</th>
                  <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Fecha Fin</th>
                </tr>
              </thead>
              <tbody>
                {historialFiltrado.map((asignacion) => (
                  <tr key={`${asignacion.id_persona}-${asignacion.cargo}-${asignacion.fecha_inicio}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200">
                      {`${asignacion.nombre} ${asignacion.apellido_paterno} ${asignacion.apellido_materno}`}
                    </td>
                    <td className="py-2 px-4 border-b text-gray-600 dark:text-gray-300">{asignacion.cargo}</td>
                    <td className="py-2 px-4 border-b text-gray-600 dark:text-gray-300">{asignacion.fecha_inicio}</td>
                    <td className="py-2 px-4 border-b text-gray-600 dark:text-gray-300">{asignacion.fecha_fin || "En curso"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Guardar Cambios
          </button>
          <button
            onClick={() => router.push("/UGT/convenios/convenios")}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleConvenio;