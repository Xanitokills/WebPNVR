"use client";

import React, { useState } from "react";
import { FiMap, FiHardDrive, FiFileText, FiMail, FiMoreHorizontal } from "react-icons/fi";

interface CardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, icon, onClick }) => (
  <div
    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow cursor-pointer"
    onClick={onClick}
  >
    <div className="text-3xl text-blue-500 mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

const OptionsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    destinatario: "",
    año: "",
    mes: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCardClick = (option: string) => {
    console.log(`Selected: ${option}`);
    if (option === "Actualizar Mes Geovisor") {
      setShowForm(true);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/groconvenios/exportGeovisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setMessage("Consulta completada con éxito");
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage("Error al procesar la consulta");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setShowForm(false);
    }
  };

  const cards: CardProps[] = [
    {
      title: "Actualizar Mes Geovisor",
      description: "Actualiza los datos mensuales en el sistema Geovisor.",
      icon: <FiMap />,
      onClick: () => handleCardClick("Actualizar Mes Geovisor"),
    },
    {
      title: "Actualizar Histórico Geovisor",
      description: "Sincroniza el historial completo del Geovisor.",
      icon: <FiHardDrive />,
      onClick: () => handleCardClick("Actualizar Histórico Geovisor"),
    },
    {
      title: "Reportes Sisfoh",
      description: "Genera y visualiza reportes del sistema Sisfoh.",
      icon: <FiFileText />,
      onClick: () => handleCardClick("Reportes Sisfoh"),
    },
    {
      title: "Correo Paralizaciones",
      description: "Envía notificaciones por correo sobre paralizaciones.",
      icon: <FiMail />,
      onClick: () => handleCardClick("Correo Paralizaciones"),
    },
    {
      title: "Opción 5",
      description: "Funcionalidad adicional (por definir).",
      icon: <FiMoreHorizontal />,
      onClick: () => handleCardClick("Opción 5"),
    },
    {
      title: "Opción 6",
      description: "Funcionalidad adicional (por definir).",
      icon: <FiMoreHorizontal />,
      onClick: () => handleCardClick("Opción 6"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Selecciona una Opción
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Card
              key={index}
              title={card.title}
              description={card.description}
              icon={card.icon}
              onClick={card.onClick}
            />
          ))}
        </div>
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Actualizar Mes Geovisor
              </h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Destinatario
                  </label>
                  <input
                    type="email"
                    name="destinatario"
                    value={formData.destinatario}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="ejemplo@dominio.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Año
                  </label>
                  <input
                    type="number"
                    name="año"
                    value={formData.año}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="2025"
                    min="2000"
                    max="2100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mes
                  </label>
                  <input
                    type="number"
                    name="mes"
                    value={formData.mes}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="1-12"
                    min="1"
                    max="12"
                    required
                  />
                </div>
                {message && (
                  <p className={`text-sm ${message.includes("Error") ? "text-red-500" : "text-green-500"}`}>
                    {message}
                  </p>
                )}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    disabled={loading}
                  >
                    {loading ? "Procesando..." : "Enviar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptionsPage;