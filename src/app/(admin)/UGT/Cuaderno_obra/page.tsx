"use client";
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

// Definición de interfaces
interface Convenio {
  CONVENIO_ID: number;
  CODIGO_CONVENIO: string;
}

interface Cargo {
  id_cargo: number;
  descripcion: string;
}

interface Cuaderno {
  id: number;
  convenio_id: number;
  fecha: string;
  numero_asiento: number;
  concepto: string;
  cargo_id: number;
  texto: string;
  estado: "borrador" | "grabado";
  created_at: string;
}

// Componente Select reutilizable
const Select = ({ name, value, onChange, options, label }: { name: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string | number; label: string }[]; label: string }) => (
  <div>
    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// Componente principal
const CuadernoObra: React.FC = () => {
  const [cuadernos, setCuadernos] = useState<Cuaderno[]>([]);
  const [filteredCuadernos, setFilteredCuadernos] = useState<Cuaderno[]>([]);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<number | null>(null);
  const [currentCuaderno, setCurrentCuaderno] = useState<Partial<Cuaderno>>({});
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole] = useState<"Supervisor" | "Residente" | "Otro">("Supervisor"); // Simulado
  const [dateError, setDateError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cuadernosResponse, conveniosResponse, cargosResponse] = await Promise.all([
          fetch("http://localhost:3003/api/groconvenios/cuaderno_obra"),
          fetch("http://localhost:3003/api/groconvenios/convenio_id"),
          fetch("http://localhost:3003/api/groconvenios/cargo"),
        ]);
        if (!cuadernosResponse.ok) throw new Error("No se pudieron obtener los cuadernos");
        if (!conveniosResponse.ok) throw new Error("No se pudieron obtener los convenios");
        if (!cargosResponse.ok) throw new Error("No se pudieron obtener los cargos");

        const cuadernosData = await cuadernosResponse.json();
        const conveniosData = await conveniosResponse.json();
        const cargosData = await cargosResponse.json();

        setCuadernos(cuadernosData);
        setFilteredCuadernos(cuadernosData);
        setConvenios(conveniosData);
        setCargos(cargosData);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchData();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = cuadernos.filter(
      (cuaderno) =>
        cuaderno.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cuaderno.convenio_id.toString().includes(searchTerm)
    );
    setFilteredCuadernos(filtered);
    setCurrentPage(1);
  }, [searchTerm, cuadernos]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle form submission for add/edit
  const handleSubmit = async (e: React.FormEvent, final: boolean = false) => {
    e.preventDefault();
    setError(null);
    setDateError(null);

    if (userRole !== "Supervisor" && userRole !== "Residente") {
      setError("Solo Supervisores y Residentes pueden generar o grabar asientos.");
      return;
    }

    if (!currentCuaderno.convenio_id || !currentCuaderno.fecha || !currentCuaderno.concepto || !currentCuaderno.cargo_id || !currentCuaderno.texto) {
      setError("Por favor, completa todos los campos requeridos.");
      return;
    }

    if (dateError) {
      setError(dateError);
      return;
    }

    const newCuaderno: Partial<Cuaderno> = {
      convenio_id: Number(currentCuaderno.convenio_id) || 0,
      fecha: (currentCuaderno.fecha as Dayjs).format("YYYY-MM-DD"),
      concepto: currentCuaderno.concepto || "",
      cargo_id: Number(currentCuaderno.cargo_id) || 0,
      texto: currentCuaderno.texto || "",
      estado: final ? "grabado" : "borrador",
      created_at: new Date().toISOString(),
    };

    console.log("Sending payload:", JSON.stringify(newCuaderno)); // Debug log

    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode
      ? `http://localhost:3003/api/groconvenios/cuaderno_obra/${currentCuaderno.id}`
      : "http://localhost:3003/api/groconvenios/cuaderno_obra";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCuaderno),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`No se pudo ${isEditMode ? "actualizar" : "crear"} el asiento: ${errorText}`);
      }
      const updatedCuaderno = await response.json();
      if (isEditMode) {
        setCuadernos(cuadernos.map((c) => (c.id === updatedCuaderno.id ? updatedCuaderno : c)));
      } else {
        setCuadernos([...cuadernos, updatedCuaderno]);
      }
      setIsModalOpen(false);
      setCurrentCuaderno({});
      setIsEditMode(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3003/api/groconvenios/cuaderno_obra/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("No se pudo eliminar el asiento");
      setCuadernos(cuadernos.filter((c) => c.id !== id));
      setIsDeleteModalOpen(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Open modal for adding new cuaderno
  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentCuaderno({ convenio_id: 0, fecha: dayjs(), estado: "borrador" });
    setIsModalOpen(true);
  };

  // Open modal for editing existing cuaderno
  const openEditModal = (cuaderno: Cuaderno) => {
    setIsEditMode(true);
    setCurrentCuaderno({ ...cuaderno, fecha: dayjs(cuaderno.fecha) });
    setIsModalOpen(true);
  };

  // Handle input change in form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentCuaderno((prev) => ({
      ...prev,
      [name]: name === "cargo_id" || name === "convenio_id" ? parseInt(value, 10) : value,
    }));
  };

  const handleDateChange = (date: Dayjs | null) => {
    setCurrentCuaderno((prev) => {
      const newData = { ...prev, fecha: date };
      setDateError(null);
      if (date && date.isBefore(dayjs("2025-06-16"))) {
        setDateError("La fecha no puede ser anterior al 16/06/2025");
      }
      return newData;
    });
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCuadernos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCuadernos.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Export to Excel
  const exportToExcel = () => {
    const worksheetData = filteredCuadernos.map((cuaderno) => ({
      ID: cuaderno.id,
      Convenio: cuaderno.convenio_id,
      Fecha: cuaderno.fecha,
      "Número Asiento": cuaderno.numero_asiento,
      Concepto: cuaderno.concepto,
      Cargo: cargos.find((c) => c.id_cargo === cuaderno.cargo_id)?.descripcion || "Sin cargo",
      Texto: cuaderno.texto,
      Estado: cuaderno.estado,
      "Fecha Creación": cuaderno.created_at,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cuadernos");
    worksheet["!cols"] = [
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 10 }, { wch: 20 },
    ];
    XLSX.writeFile(workbook, "cuaderno_obra_data.xlsx");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="ml-0 lg:ml-[90px] p-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Cuaderno de Obra</h1>

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
                placeholder="Buscar por concepto o convenio"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
              <button
                onClick={openAddModal}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                disabled={userRole !== "Supervisor" && userRole !== "Residente"}
              >
                Nueva Entrada
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
                    "Convenio",
                    "Fecha",
                    "Número Asiento",
                    "Concepto",
                    "Cargo",
                    "Texto",
                    "Estado",
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
                  currentItems.map((cuaderno) => (
                    <tr
                      key={cuaderno.id}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="py-4 px-6 text-gray-900 dark:text-white">{cuaderno.id}</td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white">{cuaderno.convenio_id}</td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white">{cuaderno.fecha}</td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white">{cuaderno.numero_asiento}</td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white">{cuaderno.concepto}</td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white">
                        {cargos.find((c) => c.id_cargo === cuaderno.cargo_id)?.descripcion || "Sin cargo"}
                      </td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white">{cuaderno.texto}</td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white">{cuaderno.estado}</td>
                      <td className="py-4 px-6 flex space-x-2">
                        <button
                          onClick={() => openEditModal(cuaderno)}
                          className="text-blue-500 hover:text-blue-600 transition-colors"
                          title="Editar"
                          disabled={userRole !== "Supervisor" && userRole !== "Residente"}
                        >
                          <FiEdit size={20} />
                        </button>
                        <button
                          onClick={() => setIsDeleteModalOpen(cuaderno.id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                          title="Eliminar"
                          disabled={userRole !== "Supervisor" && userRole !== "Residente"}
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
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
              Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredCuadernos.length)} de {filteredCuadernos.length} registros
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
                  {isEditMode ? "Editar Asiento" : "Agregar Asiento"}
                </h2>
                <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                  <Select
                    name="convenio_id"
                    value={currentCuaderno.convenio_id || 0}
                    onChange={handleInputChange}
                    options={[
                      { value: 0, label: "Selecciona un convenio" },
                      ...convenios.map((convenio) => ({
                        value: convenio.CONVENIO_ID,
                        label: convenio.CODIGO_CONVENIO,
                      })),
                    ]}
                    label="Convenio"
                  />
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Fecha</label>
                    <DatePicker
                      value={currentCuaderno.fecha ? dayjs(currentCuaderno.fecha) : null}
                      onChange={handleDateChange}
                      minDate={dayjs("2025-06-16")}
                      format="YYYY-MM-DD"
                      slotProps={{
                        textField: {
                          readOnly: true,
                          className:
                            "w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500",
                        },
                      }}
                    />
                    {dateError && <p className="text-red-500 text-sm mt-1">{dateError}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Número de Asiento</label>
                    <input
                      type="number"
                      name="numero_asiento"
                      value={currentCuaderno.numero_asiento || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Concepto</label>
                    <input
                      type="text"
                      name="concepto"
                      value={currentCuaderno.concepto || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <Select
                    name="cargo_id"
                    value={currentCuaderno.cargo_id || 0}
                    onChange={handleInputChange}
                    options={[
                      { value: 0, label: "Selecciona un cargo" },
                      ...cargos.map((cargo) => ({
                        value: cargo.id_cargo,
                        label: cargo.descripcion,
                      })),
                    ]}
                    label="Cargo"
                  />
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Texto</label>
                    <textarea
                      name="texto"
                      value={currentCuaderno.texto || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      required
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
                      Guardar como Borrador
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, true)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      disabled={userRole !== "Supervisor" && userRole !== "Residente"}
                    >
                      Grabar
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
                  ¿Estás seguro de eliminar este asiento?
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
    </LocalizationProvider>
  );
};

export default CuadernoObra;