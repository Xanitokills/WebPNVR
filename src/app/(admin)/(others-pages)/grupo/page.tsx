"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";

interface Grupo {
  id_grupo: number;
  nombre: string;
  estado: number | null;
}

export default function GrupoAdmin() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [nombre, setNombre] = useState<string>("");
  const [estado, setEstado] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [editFormData, setEditFormData] = useState<Partial<Grupo>>({});
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });

  useEffect(() => {
    fetchGrupos();
  }, []);

  const fetchGrupos = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3003"}/api/grupo`,
        { cache: "no-store" }
      );
      if (!response.ok) {
        throw new Error(`Error al obtener los grupos: ${response.statusText}`);
      }
      const result: Grupo[] = await response.json();
      setGrupos(result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (grupo: Grupo, action: "view" | "edit") => {
    setSelectedGrupo(grupo);
    setModalMode(action);
    if (action === "edit") {
      setEditFormData(grupo);
      setEstado(grupo.estado === 1 ? "1" : grupo.estado === 0 ? "0" : "");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedGrupo(null);
    setModalMode("view");
    setEditFormData({});
    setEstado("");
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Grupo) => {
    let value: string | number | null = e.target.value;
    if (field === "id_grupo") {
      value = value ? parseFloat(value) : 0;
    } else if (field === "estado") {
      value = e.target.value === "1" || e.target.value === "0" ? parseInt(e.target.value) : null;
    } else {
      value = e.target.value;
    }
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: "", visible: false }), 3000);
  };

  const handleSave = async () => {
    if (!selectedGrupo) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3003"}/api/grupo/${selectedGrupo.id_grupo}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_grupo: selectedGrupo.id_grupo,
            nombre: editFormData.nombre || selectedGrupo.nombre,
            estado: editFormData.estado !== undefined ? editFormData.estado : selectedGrupo.estado,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el grupo");
      }

      const updatedGrupo: Grupo = await response.json();
      setGrupos(grupos.map((grupo) =>
        grupo.id_grupo === selectedGrupo.id_grupo ? updatedGrupo : grupo
      ));
      closeModal();
      showToast("¡Grupo actualizado con éxito!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
    }
  };

  const handleAdd = async () => {
    try {
      const newEstado = estado === "1" || estado === "0" ? parseInt(estado) : null;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3003"}/api/grupo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, estado: newEstado }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el grupo");
      }

      const newGrupo: Grupo = await response.json();
      setGrupos([...grupos, newGrupo]);
      setNombre("");
      setEstado("");
      showToast("¡Grupo creado con éxito!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3003"}/api/grupo/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          throw new Error("El grupo no fue encontrado");
        }
        throw new Error(errorData.error || "Error al eliminar el grupo");
      }

      setGrupos(grupos.filter((grupo) => grupo.id_grupo !== id));
      showToast("¡Grupo eliminado con éxito!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
    }
  };

  const getEstadoText = (estado: number | null) => {
    if (estado === 1) return "Activo";
    if (estado === 0) return "Inactivo";
    return "N/A";
  };

  if (loading) return <div>Cargando grupos...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!grupos || grupos.length === 0) return <div>No se encontraron grupos.</div>;

  return (
    <div>
      {toast.visible && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center space-x-4">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del grupo"
          className="border p-2 rounded"
        />
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Seleccione estado</option>
          <option value="1">Activo</option>
          <option value="0">Inactivo</option>
        </select>
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          disabled={!nombre.trim()}
        >
          Agregar
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[600px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    ID Grupo
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Nombre
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Estado
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Opciones
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {grupos.map((grupo) => (
                  <TableRow key={grupo.id_grupo}>
                    <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                      {grupo.id_grupo}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {grupo.nombre}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {getEstadoText(grupo.estado)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <button
                        onClick={() => openModal(grupo, "view")}
                        className="mr-2 text-blue-600 hover:underline"
                        title="Ver"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => openModal(grupo, "edit")}
                        className="text-green-600 hover:underline"
                        title="Editar"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(grupo.id_grupo)}
                        className="ml-2 text-red-600 hover:underline"
                        title="Eliminar"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {isModalOpen && selectedGrupo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md overflow-y-auto max-h-[80vh]">
            <h2 className="text-xl font-bold mb-4">{selectedGrupo.nombre}</h2>
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ×
            </button>
            <div className="grid grid-cols-1 gap-4">
              {modalMode === "view" ? (
                Object.entries(selectedGrupo).map(([key, value]) => (
                  <div key={key}>
                    <label className="font-medium text-gray-700 dark:text-gray-300">{key}:</label>
                    <p className="text-gray-900 dark:text-gray-100 break-words">
                      {key === "estado" ? getEstadoText(value as number | null) : value === null || value === undefined ? "N/A" : String(value)}
                    </p>
                  </div>
                ))
              ) : (
                Object.entries(selectedGrupo).map(([key, value]) => (
                  <div key={key}>
                    <label className="font-medium text-gray-700 dark:text-gray-300">{key}:</label>
                    <input
                      type={key === "id_grupo" ? "number" : "text"}
                      value={
                        editFormData[key as keyof Grupo] !== undefined
                          ? String(editFormData[key as keyof Grupo] ?? "")
                          : value === null || value === undefined
                          ? ""
                          : String(value)
                      }
                      onChange={(e) => handleInputChange(e, key as keyof Grupo)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      disabled={key === "id_grupo"} // Deshabilitar edición del ID
                    />
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              {modalMode === "edit" && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  disabled={!editFormData.nombre?.trim()} // Deshabilitar si no hay nombre
                >
                  Guardar
                </button>
              )}
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}