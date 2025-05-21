<<<<<<< HEAD:src/app/(admin)/crear-convocatoria/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";

interface ItemConvocatoria {
  id_item_convocatoria: number;
  descripcion: string;
  id_tipo_item_convocatoria: number;
  id_tipo_unidad_medida: number | null;
}

interface TipoConvocatoria {
  id_tipo: number;
  nombre: string;
  descripcion: string;
  estado: number;
}

interface EstadoConvocatoria {
  id_estado: number;
  estado: string;
}

const CrearConvocatoria = () => {
  const [formData, setFormData] = useState({
    id_convenio: "",
    id_tipo: "",
    codigo_seace: "",
    titulo: "",
    descripcion: "",
    presupuesto: "",
    fecha_publicacion: null as Dayjs | null,
    fecha_limite_ofertas: null as Dayjs | null,
    fecha_estimada_adjudicacion: null as Dayjs | null,
    duracion_contrato: "",
    vigencia: "",
    id_estado: "",
    fecha_fin_publicacion: null as Dayjs | null,
    fecha_inicio_ofertas: null as Dayjs | null,
    fecha_otorgamiento_buena_pro: null as Dayjs | null,
    fecha_apertura_sobre: null as Dayjs | null,
    id_item_convocatoria: "",
    id_tipo_item_convocatoria: "",
    cantidad: "",
    Anexos: "",
    QR_PATH: "",
    wordFile: null as File | null,
    pdfFile: null as File | null,
  });
  const [itemsConvocatoria, setItemsConvocatoria] = useState<ItemConvocatoria[]>([]);
  const [tiposConvocatoria, setTiposConvocatoria] = useState<TipoConvocatoria[]>([]);
  const [estadosConvocatoria, setEstadosConvocatoria] = useState<EstadoConvocatoria[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsResponse, tiposResponse, estadosResponse] = await Promise.all([
          fetch("/api/itemconvocatoria"),
          fetch("/api/tipoconvocatoria"),
          fetch("/api/estadoconvocatoria"),
        ]);
        if (!itemsResponse.ok) throw new Error("Error al obtener ítems de convocatoria");
        if (!tiposResponse.ok) throw new Error("Error al obtener tipos de convocatoria");
        if (!estadosResponse.ok) throw new Error("Error al obtener estados de convocatoria");
        setItemsConvocatoria(await itemsResponse.json());
        setTiposConvocatoria(await tiposResponse.json());
        setEstadosConvocatoria(await estadosResponse.json());
        setLoading(false);
      } catch (error) {
        setMessage("Error al cargar los datos iniciales: " + (error instanceof Error ? error.message : "Error desconocido"));
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleDateChange = (name: string, date: Dayjs | null) => {
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: date };
      setDateError(null);

      if (name === "fecha_publicacion" && date) {
        if (date.isBefore(dayjs().startOf("day"))) {
          setDateError("La fecha de publicación no puede ser anterior a hoy");
        }
      }
      if (
        name === "fecha_limite_ofertas" &&
        date &&
        prev.fecha_estimada_adjudicacion &&
        date.isAfter(prev.fecha_estimada_adjudicacion)
      ) {
        setDateError("La fecha límite de ofertas no puede ser posterior a la fecha estimada de adjudicación");
        newFormData.fecha_estimada_adjudicacion = null;
      }
      if (
        name === "fecha_fin_publicacion" &&
        date &&
        prev.fecha_publicacion &&
        date.isBefore(prev.fecha_publicacion)
      ) {
        setDateError("La fecha de fin de publicación no puede ser anterior a la fecha de publicación");
      }
      if (
        name === "fecha_inicio_ofertas" &&
        date &&
        prev.fecha_publicacion &&
        date.isBefore(prev.fecha_publicacion)
      ) {
        setDateError("La fecha de inicio de ofertas no puede ser anterior a la fecha de publicación");
      }
      if (
        name === "fecha_otorgamiento_buena_pro" &&
        date &&
        prev.fecha_limite_ofertas &&
        date.isBefore(prev.fecha_limite_ofertas)
      ) {
        setDateError("La fecha de otorgamiento de buena pro no puede ser anterior a la fecha límite de ofertas");
      }
      if (
        name === "fecha_apertura_sobre" &&
        date &&
        prev.fecha_inicio_ofertas &&
        date.isBefore(prev.fecha_inicio_ofertas)
      ) {
        setDateError("La fecha de apertura de sobre no puede ser anterior a la fecha de inicio de ofertas");
      }

      return newFormData;
    });
  };

const uploadFile = async (file: File, type: string): Promise<string | null> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error(`Error al subir archivo ${type}`);
    const data = await response.json();
    return data.filePath;
  } catch (error) {
    setMessage(`Error al subir archivo ${type}: ${error instanceof Error ? error.message : "Error desconocido"}`);
    return null;
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setDateError(null);

    try {
      // Validar campos requeridos
      const requiredFields = [
        { field: "id_convenio", value: formData.id_convenio.trim(), label: "ID Convenio" },
        { field: "id_tipo", value: formData.id_tipo, label: "Tipo de Convocatoria" },
        { field: "codigo_seace", value: formData.codigo_seace.trim(), label: "Código SEACE" },
        { field: "titulo", value: formData.titulo.trim(), label: "Título" },
        { field: "descripcion", value: formData.descripcion.trim(), label: "Descripción" },
        { field: "presupuesto", value: formData.presupuesto, label: "Presupuesto" },
        { field: "fecha_publicacion", value: formData.fecha_publicacion, label: "Fecha de Publicación" },
        { field: "fecha_limite_ofertas", value: formData.fecha_limite_ofertas, label: "Fecha Límite de Ofertas" },
        { field: "fecha_estimada_adjudicacion", value: formData.fecha_estimada_adjudicacion, label: "Fecha Estimada de Adjudicación" },
        { field: "duracion_contrato", value: formData.duracion_contrato, label: "Duración del Contrato" },
        { field: "id_estado", value: formData.id_estado, label: "Estado" },
      ];
      const missingFields = requiredFields.filter(({ value }) => !value);
      if (missingFields.length > 0) {
        throw new Error(`Por favor, completa los siguientes campos requeridos: ${missingFields.map(f => f.label).join(", ")}`);
      }

      // Validar campos numéricos
      const presupuesto = parseFloat(formData.presupuesto);
      if (isNaN(presupuesto) || presupuesto <= 0) {
        throw new Error("El presupuesto debe ser un número positivo");
      }
      const id_tipo = parseInt(formData.id_tipo);
      if (isNaN(id_tipo) || id_tipo <= 0) {
        throw new Error("El tipo de convocatoria debe ser un número entero positivo");
      }
      const id_estado = parseInt(formData.id_estado);
      if (isNaN(id_estado) || id_estado <= 0) {
        throw new Error("El estado debe ser un número entero positivo");
      }
      const duracion_contrato = parseInt(formData.duracion_contrato);
      if (isNaN(duracion_contrato) || duracion_contrato <= 0) {
        throw new Error("La duración del contrato debe ser un número entero positivo");
      }

      // Validar campos opcionales numéricos
      let id_item_convocatoria: number | null = null;
      let id_tipo_item_convocatoria: number | null = null;
      let cantidad: number | null = null;
      if (formData.id_item_convocatoria) {
        id_item_convocatoria = parseInt(formData.id_item_convocatoria);
        if (isNaN(id_item_convocatoria) || id_item_convocatoria <= 0) {
          throw new Error("El ID de ítem de convocatoria debe ser un número entero positivo");
        }
      }
      if (formData.id_tipo_item_convocatoria) {
        id_tipo_item_convocatoria = parseInt(formData.id_tipo_item_convocatoria);
        if (isNaN(id_tipo_item_convocatoria) || id_tipo_item_convocatoria <= 0) {
          throw new Error("El tipo de ítem de convocatoria debe ser un número entero positivo");
        }
      }
      if (formData.cantidad) {
        cantidad = parseInt(formData.cantidad);
        if (isNaN(cantidad) || cantidad <= 0) {
          throw new Error("La cantidad debe ser un número entero positivo");
        }
      }

      // Subir archivos
      let pdf_file_path: string | null = null;
      let word_file_path: string | null = null;
      if (formData.pdfFile) {
        pdf_file_path = await uploadFile(formData.pdfFile, "pdf");
        if (!pdf_file_path) throw new Error("Error al subir el archivo PDF");
      }
      if (formData.wordFile) {
        word_file_path = await uploadFile(formData.wordFile, "word");
        if (!word_file_path) throw new Error("Error al subir el archivo Word");
      }

      // Preparar datos para enviar
      const dataToSend = {
        id_convenio: formData.id_convenio,
        id_tipo,
        codigo_seace: formData.codigo_seace,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        presupuesto,
        fecha_publicacion: formData.fecha_publicacion?.format("YYYY-MM-DD"),
        fecha_limite_ofertas: formData.fecha_limite_ofertas?.format("YYYY-MM-DD"),
        fecha_estimada_adjudicacion: formData.fecha_estimada_adjudicacion?.format("YYYY-MM-DD"),
        duracion_contrato,
        vigencia: formData.vigencia ? parseInt(formData.vigencia) : null,
        id_estado,
        fecha_fin_publicacion: formData.fecha_fin_publicacion?.format("YYYY-MM-DD HH:mm:ss") || null,
        fecha_inicio_ofertas: formData.fecha_inicio_ofertas?.format("YYYY-MM-DD HH:mm:ss") || null,
        fecha_otorgamiento_buena_pro: formData.fecha_otorgamiento_buena_pro?.format("YYYY-MM-DD HH:mm:ss") || null,
        fecha_apertura_sobre: formData.fecha_apertura_sobre?.format("YYYY-MM-DD HH:mm:ss") || null,
        id_item_convocatoria,
        id_tipo_item_convocatoria,
        cantidad,
        Anexos: formData.Anexos || null,
        QR_PATH: formData.QR_PATH || null,
        pdf_file_path,
        word_file_path,
      };

      const response = await fetch("/api/convocatoria", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la convocatoria");
      }

      setMessage("¡Convocatoria creada con éxito!");
      setFormData({
        id_convenio: "",
        id_tipo: "",
        codigo_seace: "",
        titulo: "",
        descripcion: "",
        presupuesto: "",
        fecha_publicacion: null,
        fecha_limite_ofertas: null,
        fecha_estimada_adjudicacion: null,
        duracion_contrato: "",
        vigencia: "",
        id_estado: "",
        fecha_fin_publicacion: null,
        fecha_inicio_ofertas: null,
        fecha_otorgamiento_buena_pro: null,
        fecha_apertura_sobre: null,
        id_item_convocatoria: "",
        id_tipo_item_convocatoria: "",
        cantidad: "",
        Anexos: "",
        QR_PATH: "",
        wordFile: null,
        pdfFile: null,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al crear la convocatoria");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Crear Convocatoria
        </h1>

        {message && (
          <div
            className={`mb-8 p-4 rounded-lg ${
              message.includes("Error")
                ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200"
                : "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200"
            }`}
          >
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-gray-700 dark:text-gray-300">Cargando datos...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 max-w-lg">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                ID Convenio
              </label>
              <input
                type="text"
                name="id_convenio"
                value={formData.id_convenio}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Tipo de Convocatoria
              </label>
              <select
                name="id_tipo"
                value={formData.id_tipo}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              >
                <option value="">Seleccione un tipo</option>
                {tiposConvocatoria.map((tipo) => (
                  <option key={tipo.id_tipo} value={tipo.id_tipo}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Código SEACE
              </label>
              <input
                type="text"
                name="codigo_seace"
                value={formData.codigo_seace}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Título
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
                rows={5}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Presupuesto
              </label>
              <input
                type="number"
                name="presupuesto"
                value={formData.presupuesto}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Fecha de Publicación
              </label>
              <DatePicker
                value={formData.fecha_publicacion}
                onChange={(date) => handleDateChange("fecha_publicacion", date)}
                minDate={dayjs()}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    readOnly: true,
                    className:
                      "w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm",
                  },
                }}
                required
              />
              {dateError && formData.fecha_publicacion && (
                <p className="text-red-500 text-sm mt-1">{dateError}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Fecha Fin Publicación
              </label>
              <DatePicker
                value={formData.fecha_fin_publicacion}
                onChange={(date) => handleDateChange("fecha_fin_publicacion", date)}
                minDate={formData.fecha_publicacion || dayjs()}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: {
                    readOnly: true,
                    className:
                      "w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm",
                  },
                }}
              />
              {dateError && formData.fecha_fin_publicacion && (
                <p className="text-red-500 text-sm mt-1">{dateError}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Fecha Inicio Ofertas
              </label>
              <DatePicker
                value={formData.fecha_inicio_ofertas}
                onChange={(date) => handleDateChange("fecha_inicio_ofertas", date)}
                minDate={formData.fecha_publicacion || dayjs()}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: {
                    readOnly: true,
                    className:
                      "w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm",
                  },
                }}
              />
              {dateError && formData.fecha_inicio_ofertas && (
                <p className="text-red-500 text-sm mt-1">{dateError}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Fecha Límite de Ofertas
              </label>
              <DatePicker
                value={formData.fecha_limite_ofertas}
                onChange={(date) => handleDateChange("fecha_limite_ofertas", date)}
                minDate={formData.fecha_inicio_ofertas || formData.fecha_publicacion || dayjs()}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    readOnly: true,
                    className:
                      "w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm",
                  },
                }}
                required
              />
              {dateError && formData.fecha_limite_ofertas && (
                <p className="text-red-500 text-sm mt-1">{dateError}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Fecha Otorgamiento Buena Pro
              </label>
              <DatePicker
                value={formData.fecha_otorgamiento_buena_pro}
                onChange={(date) => handleDateChange("fecha_otorgamiento_buena_pro", date)}
                minDate={formData.fecha_limite_ofertas || dayjs()}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: {
                    readOnly: true,
                    className:
                      "w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm",
                  },
                }}
              />
              {dateError && formData.fecha_otorgamiento_buena_pro && (
                <p className="text-red-500 text-sm mt-1">{dateError}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Fecha Apertura Sobre
              </label>
              <DatePicker
                value={formData.fecha_apertura_sobre}
                onChange={(date) => handleDateChange("fecha_apertura_sobre", date)}
                minDate={formData.fecha_inicio_ofertas || formData.fecha_publicacion || dayjs()}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: {
                    readOnly: true,
                    className:
                      "w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm",
                  },
                }}
              />
              {dateError && formData.fecha_apertura_sobre && (
                <p className="text-red-500 text-sm mt-1">{dateError}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Fecha Estimada de Adjudicación
              </label>
              <DatePicker
                value={formData.fecha_estimada_adjudicacion}
                onChange={(date) => handleDateChange("fecha_estimada_adjudicacion", date)}
                minDate={formData.fecha_limite_ofertas || dayjs()}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    readOnly: true,
                    className:
                      "w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm",
                  },
                }}
                required
              />
              {dateError && formData.fecha_estimada_adjudicacion && (
                <p className="text-red-500 text-sm mt-1">{dateError}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Duración del Contrato (días)
              </label>
              <input
                type="number"
                name="duracion_contrato"
                value={formData.duracion_contrato}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Vigencia
              </label>
              <select
                name="vigencia"
                value={formData.vigencia}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              >
                <option value="">Seleccione vigencia</option>
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Estado
              </label>
              <select
                name="id_estado"
                value={formData.id_estado}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              >
                <option value="">Seleccione un estado</option>
                {estadosConvocatoria.map((estado) => (
                  <option key={estado.id_estado} value={estado.id_estado}>
                    {estado.estado}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Ítem de Convocatoria
              </label>
              <select
                name="id_item_convocatoria"
                value={formData.id_item_convocatoria}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                <option value="">Seleccione un ítem (opcional)</option>
                {itemsConvocatoria.map((item) => (
                  <option key={item.id_item_convocatoria} value={item.id_item_convocatoria}>
                    {item.descripcion}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Tipo de Ítem de Convocatoria
              </label>
              <input
                type="number"
                name="id_tipo_item_convocatoria"
                value={formData.id_tipo_item_convocatoria}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Cantidad
              </label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Anexos
              </label>
              <input
                type="text"
                name="Anexos"
                value={formData.Anexos}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                QR Path
              </label>
              <input
                type="text"
                name="QR_PATH"
                value={formData.QR_PATH}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Archivo Word (.docx)
              </label>
              <input
                type="file"
                name="wordFile"
                accept=".docx"
                onChange={handleFileChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Archivo PDF
              </label>
              <input
                type="file"
                name="pdfFile"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
              disabled={!!dateError}
            >
              Crear Convocatoria
            </button>
          </form>
        )}
      </div>
    </LocalizationProvider>
  );
};

=======
"use client";
import React, { useState, useEffect } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";

interface ItemConvocatoria {
  id_item_convocatoria: number;
  descripcion: string;
}

interface TipoConvocatoria {
  id_tipo: number;
  nombre: string;
  descripcion: string;
  estado: number;
}

const CrearConvocatoria = () => {
  const [formData, setFormData] = useState({
    codigo_seace: "",
    titulo: "",
    descripcion: "",
    presupuesto: "",
    fecha_publicacion: null as Dayjs | null,
    fecha_limite_ofertas: null as Dayjs | null,
    fecha_estimada_adjudicacion: null as Dayjs | null,
    duracion_contrato: "",
    vigencia: "",
    id_item_convocatoria: "",
    id_tipo: "",
    wordFile: null as File | null,
    pdfFile: null as File | null,
  });
  const [itemsConvocatoria, setItemsConvocatoria] = useState<ItemConvocatoria[]>([]);
  const [tiposConvocatoria, setTiposConvocatoria] = useState<TipoConvocatoria[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsResponse, tiposResponse] = await Promise.all([
          fetch("/api/itemconvocatoria"),
          fetch("/api/tipoconvocatoria"),
        ]);
        if (!itemsResponse.ok) throw new Error("Error al obtener ítems de convocatoria");
        if (!tiposResponse.ok) throw new Error("Error al obtener tipos de convocatoria");
        setItemsConvocatoria(await itemsResponse.json());
        setTiposConvocatoria(await tiposResponse.json());
        setLoading(false);
      } catch (error) {
        setMessage("Error al cargar los datos iniciales");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleDateChange = (name: string, date: Dayjs | null) => {
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: date };
      if (
        name === "fecha_limite_ofertas" &&
        date &&
        prev.fecha_estimada_adjudicacion &&
        date.isAfter(prev.fecha_estimada_adjudicacion)
      ) {
        newFormData.fecha_estimada_adjudicacion = null;
      }
      return newFormData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      // Validate required fields
      if (
        !formData.codigo_seace.trim() ||
        !formData.titulo.trim() ||
        !formData.descripcion.trim() ||
        !formData.presupuesto ||
        !formData.fecha_publicacion ||
        !formData.fecha_limite_ofertas ||
        !formData.fecha_estimada_adjudicacion ||
        !formData.duracion_contrato.trim() ||
        !formData.vigencia.trim() ||
        !formData.id_item_convocatoria ||
        !formData.id_tipo
      ) {
        throw new Error("Por favor, completa todos los campos requeridos");
      }

      // Validate numeric fields
      const presupuesto = parseFloat(formData.presupuesto);
      if (isNaN(presupuesto) || presupuesto <= 0) {
        throw new Error("El presupuesto debe ser un número positivo");
      }
      const id_item_convocatoria = parseInt(formData.id_item_convocatoria);
      const id_tipo = parseInt(formData.id_tipo);
      if (
        isNaN(id_item_convocatoria) ||
        id_item_convocatoria <= 0 ||
        isNaN(id_tipo) ||
        id_tipo <= 0
      ) {
        throw new Error(
          "Los campos ID de ítem y tipo de convocatoria deben ser números enteros positivos"
        );
      }

      // Validate date logic
      const today = dayjs();
      if (formData.fecha_publicacion.isBefore(today.startOf("day"))) {
        throw new Error("La fecha de publicación no puede ser anterior a hoy");
      }
      if (
        formData.fecha_estimada_adjudicacion.isBefore(formData.fecha_limite_ofertas) ||
        formData.fecha_estimada_adjudicacion.isSame(formData.fecha_limite_ofertas)
      ) {
        throw new Error(
          "La fecha estimada de adjudicación debe ser posterior a la fecha límite de ofertas"
        );
      }

      // Prepare FormData for submission
      const formDataToSend = new FormData();
      formDataToSend.append("codigo_seace", formData.codigo_seace);
      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("presupuesto", presupuesto.toString());
      formDataToSend.append(
        "fecha_publicacion",
        formData.fecha_publicacion.format("YYYY-MM-DD")
      );
      formDataToSend.append(
        "fecha_limite_ofertas",
        formData.fecha_limite_ofertas.format("YYYY-MM-DD")
      );
      formDataToSend.append(
        "fecha_estimada_adjudicacion",
        formData.fecha_estimada_adjudicacion.format("YYYY-MM-DD")
      );
      formDataToSend.append("duracion_contrato", formData.duracion_contrato);
      formDataToSend.append("vigencia", formData.vigencia);
      formDataToSend.append("id_estado_convocatoria", "1"); // Default value
      formDataToSend.append("id_item_convocatoria", id_item_convocatoria.toString());
      formDataToSend.append("id_tipo", id_tipo.toString());
      if (formData.wordFile) formDataToSend.append("wordFile", formData.wordFile);
      if (formData.pdfFile) formDataToSend.append("pdfFile", formData.pdfFile);

      const response = await fetch("/api/convocatoria", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la convocatoria");
      }

      setMessage("¡Convocatoria creada con éxito!");
      setFormData({
        codigo_seace: "",
        titulo: "",
        descripcion: "",
        presupuesto: "",
        fecha_publicacion: null,
        fecha_limite_ofertas: null,
        fecha_estimada_adjudicacion: null,
        duracion_contrato: "",
        vigencia: "",
        id_item_convocatoria: "",
        id_tipo: "",
        wordFile: null,
        pdfFile: null,
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Error al crear la convocatoria"
      );
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Crear Convocatoria
        </h1>

        {message && (
          <div
            className={`mb-8 p-4 rounded-lg ${
              message.includes("Error")
                ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200"
                : "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200"
            }`}
          >
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-gray-700 dark:text-gray-300">
            Cargando datos...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 max-w-lg">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Código SEACE
              </label>
              <input
                type="text"
                name="codigo_seace"
                value={formData.codigo_seace}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Título
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
                rows={5}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Presupuesto
              </label>
              <input
                type="number"
                name="presupuesto"
                value={formData.presupuesto}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Fecha de Publicación
              </label>
              <DatePicker
                value={formData.fecha_publicacion}
                onChange={(date) => handleDateChange("fecha_publicacion", date)}
                minDate={dayjs()}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    readOnly: true,
                    className:
                      "w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm",
                  },
                }}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Fecha Límite de Ofertas
              </label>
              <DatePicker
                value={formData.fecha_limite_ofertas}
                onChange={(date) => handleDateChange("fecha_limite_ofertas", date)}
                minDate={formData.fecha_publicacion || dayjs()}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    readOnly: true,
                    className:
                      "w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm",
                  },
                }}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Fecha Estimada de Adjudicación
              </label>
              <DatePicker
                value={formData.fecha_estimada_adjudicacion}
                onChange={(date) => handleDateChange("fecha_estimada_adjudicacion", date)}
                minDate={formData.fecha_limite_ofertas || dayjs()}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    readOnly: true,
                    className:
                      "w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm",
                  },
                }}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Duración del Contrato
              </label>
              <input
                type="text"
                name="duracion_contrato"
                value={formData.duracion_contrato}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Vigencia
              </label>
              <input
                type="text"
                name="vigencia"
                value={formData.vigencia}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Ítem de Convocatoria
              </label>
              <select
                name="id_item_convocatoria"
                value={formData.id_item_convocatoria}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              >
                <option value="">Seleccione un ítem</option>
                {itemsConvocatoria.map((item) => (
                  <option key={item.id_item_convocatoria} value={item.id_item_convocatoria}>
                    {item.descripcion}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Tipo de Convocatoria
              </label>
              <select
                name="id_tipo"
                value={formData.id_tipo}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              >
                <option value="">Seleccione un tipo</option>
                {tiposConvocatoria.map((tipo) => (
                  <option key={tipo.id_tipo} value={tipo.id_tipo}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Archivo Word (.docx)
              </label>
              <input
                type="file"
                name="wordFile"
                accept=".docx"
                onChange={handleFileChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Archivo PDF
              </label>
              <input
                type="file"
                name="pdfFile"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              Crear Convocatoria
            </button>
          </form>
        )}
      </div>
    </LocalizationProvider>
  );
};

>>>>>>> 015254ef7979cf9a5be5b71805a4796ae0237606:src/app/(admin)/convocatoria/crear-convocatoria/page.tsx
export default CrearConvocatoria;