"use client";
import React, { useState } from "react";

const CrearConvocatoria = () => {
  const [formData, setFormData] = useState({
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
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3003"}/api/convocatoria`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            estado: formData.estado === "" ? null : parseInt(formData.estado),
          }),
        }
      );
      if (!response.ok) throw new Error("Error al crear la convocatoria");
      setMessage("¡Convocatoria creada con éxito!");
      setFormData({
        titulo: "",
        descripcion: "",
        fecha_inicio: "",
        fecha_fin: "",
        estado: "",
      });
    } catch (error) {
      setMessage("Error al crear la convocatoria: " + (error instanceof Error ? error.message : "Error desconocido"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Crear Convocatoria
      </h1>
      {message && (
        <div className={`mb-4 p-2 rounded ${message.includes("Error") ? "bg-red-500" : "bg-green-500"} text-white`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Título</label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleInputChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Fecha de Inicio</label>
          <input
            type="date"
            name="fecha_inicio"
            value={formData.fecha_inicio}
            onChange={handleInputChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Fecha de Fin</label>
          <input
            type="date"
            name="fecha_fin"
            value={formData.fecha_fin}
            onChange={handleInputChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleInputChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Seleccione estado</option>
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          Crear Convocatoria
        </button>
      </form>
    </div>
  );
};

export default CrearConvocatoria;