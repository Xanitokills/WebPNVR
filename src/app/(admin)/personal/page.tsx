"use client";
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface Personal {
  id_personal: number;
  id_cargo: number | null;
  descripcion: string | null;
  nombre: string;
  Apellido_Paterno: string;
  Apellido_Materno: string;
  dni: string;
  celular: string;
  correo: string;
  profesion: string;
}

interface Cargo {
  id_cargo: number;
  descripcion: string;
}

const PersonalPage: React.FC = () => {
  const [personalData, setPersonalData] = useState<Personal[]>([]);
  const [filteredData, setFilteredData] = useState<Personal[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<number | null>(null);
  const [currentPersonal, setCurrentPersonal] = useState<Partial<Personal>>({});
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch personal and cargo data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [personalResponse, cargoResponse] = await Promise.all([
          fetch("/api/personal"),
          fetch("/api/cargo"),
        ]);
        if (!personalResponse.ok) throw new Error("No se pudieron obtener los datos del personal");
        if (!cargoResponse.ok) throw new Error("No se pudieron obtener los cargos");
        const personalData = await personalResponse.json();
        const cargoData = await cargoResponse.json();
        setPersonalData(personalData);
        setFilteredData(personalData);
        setCargos(cargoData);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchData();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = personalData.filter(
      (personal) =>
        personal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        personal.dni.includes(searchTerm)
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, personalData]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle form submission for add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPersonal.dni && !/^\d{8}$/.test(currentPersonal.dni)) {
      setError("El DNI debe tener 8 dígitos");
      return;
    }
    if (currentPersonal.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentPersonal.correo)) {
      setError("Correo electrónico inválido");
      return;
    }

    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode ? `/api/personal/${currentPersonal.id_personal}` : "/api/personal";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentPersonal),
      });
      if (!response.ok) throw new Error(`No se pudo ${isEditMode ? "actualizar" : "crear"} el personal`);
      const newPersonal = await response.json();
      if (isEditMode) {
        setPersonalData(personalData.map((p) => (p.id_personal === newPersonal.id_personal ? newPersonal : p)));
      } else {
        setPersonalData([...personalData, newPersonal]);
      }
      setIsModalOpen(false);
      setCurrentPersonal({});
      setIsEditMode(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/personal/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("No se pudo eliminar el personal");
      setPersonalData(personalData.filter((p) => p.id_personal !== id));
      setIsDeleteModalOpen(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Open modal for adding new personal
  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentPersonal({});
    setIsModalOpen(true);
  };

  // Open modal for editing existing personal
  const openEditModal = (personal: Personal) => {
    setIsEditMode(true);
    setCurrentPersonal(personal);
    setIsModalOpen(true);
  };

  // Handle input change in form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentPersonal((prev) => ({
      ...prev,
      [name]: name === "id_cargo" ? (value ? parseInt(value) : null) : value,
    }));
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Export to Excel
  const exportToExcel = () => {
    const worksheetData = filteredData.map((personal) => ({
      ID: personal.id_personal,
      Cargo: personal.descripcion || "Sin cargo",
      Nombre: personal.nombre,
      "Apellido Paterno": personal.Apellido_Paterno,
      "Apellido Materno": personal.Apellido_Materno,
      DNI: personal.dni,
      Celular: personal.celular,
      Correo: personal.correo,
      Profesión: personal.profesion,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Personal");
    worksheet["!cols"] = [
      { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
      { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 20 },
    ];
    XLSX.writeFile(workbook, "personal_data.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="ml-0 lg:ml-[90px] transition-all duration-300 ease-in-out p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Gestión de Personal
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Search and Export Controls */}
        <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar por nombre o DNI"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
            <button
              onClick={openAddModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Agregar Personal
            </button>
          </div>
          <button
            onClick={exportToExcel}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Exportar a Excel
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {[
                  "ID",
                  "Cargo",
                  "Nombre",
                  "Apellido Paterno",
                  "Apellido Materno",
                  "DNI",
                  "Celular",
                  "Correo",
                  "Profesión",
                  "Acción",
                ].map((header) => (
                  <th
                    key={header}
                    className="py-3 px-6 text-left text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((personal) => (
                  <tr
                    key={personal.id_personal}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-4 px-6 text-gray-900 dark:text-white">{personal.id_personal}</td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white">{personal.descripcion || "Sin cargo"}</td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white">{personal.nombre}</td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white">{personal.Apellido_Paterno}</td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white">{personal.Apellido_Materno}</td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white">{personal.dni}</td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white">{personal.celular}</td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white">{personal.correo}</td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white">{personal.profesion}</td>
                    <td className="py-4 px-6 flex space-x-2">
                      <button
                        onClick={() => openEditModal(personal)}
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <FiEdit size={20} />
                      </button>
                      <button
                        onClick={() => setIsDeleteModalOpen(personal.id_personal)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="py-4 px-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No se encontraron registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-gray-700 dark:text-gray-300">
            Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} de {filteredData.length} registros
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                } transition-colors`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>

        {/* Modal for Add/Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                {isEditMode ? "Editar Personal" : "Agregar Personal"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Cargo</label>
                  <select
                    name="id_cargo"
                    value={currentPersonal.id_cargo || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sin cargo</option>
                    {cargos.map((cargo) => (
                      <option key={cargo.id_cargo} value={cargo.id_cargo}>
                        {cargo.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={currentPersonal.nombre || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Apellido Paterno</label>
                  <input
                    type="text"
                    name="Apellido_Paterno"
                    value={currentPersonal.Apellido_Paterno || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Apellido Materno</label>
                  <input
                    type="text"
                    name="Apellido_Materno"
                    value={currentPersonal.Apellido_Materno || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">DNI</label>
                  <input
                    type="text"
                    name="dni"
                    value={currentPersonal.dni || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Celular</label>
                  <input
                    type="text"
                    name="celular"
                    value={currentPersonal.celular || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Correo</label>
                  <input
                    type="email"
                    name="correo"
                    value={currentPersonal.correo || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Profesión</label>
                  <input
                    type="text"
                    name="profesion"
                    value={currentPersonal.profesion || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {isEditMode ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Confirmar Eliminación
              </h2>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                ¿Estás seguro de eliminar este registro?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsDeleteModalOpen(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(isDeleteModalOpen)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalPage;