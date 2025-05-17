"use client";
import React, { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";

const CrearConvocatoria = () => {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fecha_inicio: null as Dayjs | null,
    fecha_fin: null as Dayjs | null,
    wordFile: null as File | null,
    pdfFile: null as File | null,
  });
  const [message, setMessage] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      if (name === "fecha_inicio" && date && prev.fecha_fin && date.isAfter(prev.fecha_fin)) {
        newFormData.fecha_fin = null;
      }
      return newFormData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      // Validate required fields
      if (!formData.titulo || !formData.descripcion || !formData.fecha_inicio || !formData.fecha_fin) {
        throw new Error("Por favor, completa todos los campos requeridos");
      }

      // Validate fecha_fin is after fecha_inicio
      if (formData.fecha_fin!.isBefore(formData.fecha_inicio!) || formData.fecha_fin!.isSame(formData.fecha_inicio!)) {
        throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
      }

      // Validate fecha_inicio is not before today
      const today = dayjs();
      if (formData.fecha_inicio!.isBefore(today.startOf("day"))) {
        throw new Error("La fecha de inicio no puede ser anterior a hoy");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("fecha_inicio", formData.fecha_inicio!.format("YYYY-MM-DD"));
      formDataToSend.append("fecha_fin", formData.fecha_fin!.format("YYYY-MM-DD"));
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
        titulo: "",
        descripcion: "",
        fecha_inicio: null,
        fecha_fin: null,
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

        <form onSubmit={handleSubmit} className="space-y-8 max-w-lg">
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
              Fecha de Inicio
            </label>
            <DatePicker
              value={formData.fecha_inicio}
              onChange={(date) => handleDateChange("fecha_inicio", date)}
              minDate={dayjs()}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  readOnly: true, // Desactiva ingreso manual
                  className: "w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm placeholder-gray-400 dark:placeholder-gray-500",
                  placeholder: "dd/mm/yyyy",
                },
              }}
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Fecha de Fin
            </label>
            <DatePicker
              value={formData.fecha_fin}
              onChange={(date) => handleDateChange("fecha_fin", date)}
              minDate={formData.fecha_inicio || dayjs()}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  readOnly: true, // Desactiva ingreso manual
                  className: "w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-sm placeholder-gray-400 dark:placeholder-gray-500",
                  placeholder: "dd/mm/yyyy",
                },
              }}
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
          >
            Crear Convocatoria
          </button>
        </form>
      </div>
    </LocalizationProvider>
  );
};

export default CrearConvocatoria;