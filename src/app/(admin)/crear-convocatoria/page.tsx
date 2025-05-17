"use client";
import React, { useState } from "react";


const CrearConvocatoria = () => {
  const [formData, setFormData] = useState<{
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
  }>({
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const fechaInicio = new Date(formData.fecha_inicio);
      const fechaFin = new Date(formData.fecha_fin);
      if (fechaFin <= fechaInicio) {
        throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
      }

      // Convert estado to number | null
      const estadoValue = formData.estado === "" ? null : Number(formData.estado);

      // Make the POST request to the same endpoint as VerConvocatorias
      const response = await fetch("/api/convocatoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin,
          estado: estadoValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la convocatoria");
      }

      setMessage("¡Convocatoria creada con éxito!");
      setFormData({
        titulo: "",
        descripcion: "",
        fecha_inicio: "",
        fecha_fin: "",
        estado: "",
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Error al crear la convocatoria"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Crear Convocatoria
      </h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes("Error")
              ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200"
              : "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
            Título
          </label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
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
            value={formData.descripcion}
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
            value={formData.fecha_inicio}
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
            value={formData.fecha_fin}
            onChange={handleInputChange}
            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
            Estado
          </label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleInputChange}
            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione estado</option>
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Crear Convocatoria
        </button>
      </form>
    </div>
  );
};

export default CrearConvocatoria;