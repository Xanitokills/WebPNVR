"use client";
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";

interface TableAdminProps<T> {
  apiUrl: string;
  entityName: string;
  fields: { key: keyof T; label: string; type?: "text" | "select"; options?: { value: string; label: string }[] }[];
  keyField: keyof T;
  displayFields: { key: keyof T; label: string; transform?: (value: any) => string }[];
}

const TableAdmin = <T extends { [key: string]: any }>({
  apiUrl,
  entityName,
  fields,
  keyField,
  displayFields,
}: TableAdminProps<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [formData, setFormData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [editFormData, setEditFormData] = useState<Partial<T>>({});
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002"}/api/${apiUrl}`,
        { cache: "no-store" }
      );
      if (!response.ok) throw new Error(`Error al obtener los ${entityName.toLowerCase()}: ${response.statusText}`);
      const result: T[] = await response.json();
      setItems(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item: T, action: "view" | "edit") => {
    setSelectedItem(item);
    setModalMode(action);
    if (action === "edit") setEditFormData(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalMode("view");
    setEditFormData({});
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof T) => {
    let value: string | number | null = e.target.value;
    if (fields.find((f) => f.key === field)?.type === "select") {
      value = e.target.value === "null" ? null : parseInt(e.target.value);
    }
    setEditFormData((prev) => ({ ...prev, [field]: value }));
    if (modalMode !== "edit") {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: "", visible: false }), 3000);
  };

  const handleAdd = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002"}/api/${apiUrl}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) throw new Error(`Error al crear el ${entityName.toLowerCase()}`);
      await fetchItems();
      setFormData({});
      showToast(`¡${entityName} creado con éxito!`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002"}/api/${apiUrl}/${selectedItem[keyField]}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [keyField]: selectedItem[keyField], ...editFormData }),
        }
      );
      if (!response.ok) throw new Error(`Error al actualizar el ${entityName.toLowerCase()}`);
      await fetchItems();
      closeModal();
      showToast(`¡${entityName} actualizado con éxito!`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002"}/api/${apiUrl}/${id}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) throw new Error(`${entityName} no encontrado`);
        throw new Error(errorData.error || `Error al eliminar el ${entityName.toLowerCase()}`);
      }
      await fetchItems();
      showToast(`¡${entityName} eliminado con éxito!`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  if (loading) return <div>Cargando {entityName.toLowerCase()}...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!items || items.length === 0) return <div>No se encontraron {entityName.toLowerCase()}.</div>;

  return (
    <div className="p-4">
      {toast.visible && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center space-x-4">
        {fields.map((field) => (
          field.type === "select" ? (
            <select
              key={String(field.key)}
              value={formData[field.key] ?? ""}
              onChange={(e) => handleInputChange(e, field.key)}
              className="border p-2 rounded"
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              key={String(field.key)}
              type="text"
              value={formData[field.key] ?? ""}
              onChange={(e) => handleInputChange(e, field.key)}
              placeholder={field.label}
              className="border p-2 rounded"
            />
          )
        ))}
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          disabled={fields.some((field) => field.key !== "estado" && !formData[field.key]?.toString().trim())}
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
                  {displayFields.map((field) => (
                    <TableCell
                      key={String(field.key)}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      {field.label}
                    </TableCell>
                  ))}
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Opciones
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {items.map((item) => (
                  <TableRow key={item[keyField]}>
                    {displayFields.map((field) => (
                      <TableCell
                        key={String(field.key)}
                        className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                      >
                        {field.transform ? field.transform(item[field.key]) : item[field.key]}
                      </TableCell>
                    ))}
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <button
                        onClick={() => openModal(item, "view")}
                        className="mr-2 text-blue-600 hover:underline"
                        title="Ver"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => openModal(item, "edit")}
                        className="text-green-600 hover:underline"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item[keyField])}
                        className="ml-2 text-red-600 hover:underline"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md overflow-y-auto max-h-[80vh]">
            <h2 className="text-xl font-bold mb-4">{selectedItem[fields[0].key]}</h2>
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ×
            </button>
            <div className="grid grid-cols-1 gap-4">
              {modalMode === "view" ? (
                Object.entries(selectedItem).map(([key, value]) => (
                  <div key={key}>
                    <label className="font-medium text-gray-700 dark:text-gray-300">{key}:</label>
                    <p className="text-gray-900 dark:text-gray-100 break-words">
                      {value === null || value === undefined ? "N/A" : String(value)}
                    </p>
                  </div>
                ))
              ) : (
                fields.map((field) => (
                  <div key={String(field.key)}>
                    <label className="font-medium text-gray-700 dark:text-gray-300">{field.label}:</label>
                    {field.type === "select" ? (
                      <select
                        value={editFormData[field.key] ?? selectedItem[field.key] ?? ""}
                        onChange={(e) => handleInputChange(e, field.key)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={editFormData[field.key] ?? selectedItem[field.key] ?? ""}
                        onChange={(e) => handleInputChange(e, field.key)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        disabled={field.key === keyField}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              {modalMode === "edit" && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  disabled={fields.some((field) => field.key !== "estado" && !editFormData[field.key]?.toString().trim())}
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
};

export default TableAdmin;