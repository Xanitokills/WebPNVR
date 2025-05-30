"use client";
import React, { useState, useEffect, useCallback } from "react";

type Parametro = {
  ParametroID: number;
  Tipo: string; // Ej: Unidad, Categoría, Rol
  Valor: string; // Ej: m2, Obras Provisionales, Autorizador
};

const AdministrarParametros: React.FC = () => {
  const [parametros, setParametros] = useState<Parametro[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [newParam, setNewParam] = useState({ Tipo: "", Valor: "" });

  const fetchParametros = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/parametros");
      const data = await response.json();
      if (response.ok) {
        setParametros(data);
        setError("");
      } else {
        setError(data.error || "Error al cargar los parámetros.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddParam = useCallback(async () => {
    if (!newParam.Tipo || !newParam.Valor) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      const response = await fetch("/api/parametros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newParam),
      });

      if (response.ok) {
        setNewParam({ Tipo: "", Valor: "" });
        fetchParametros();
      } else {
        const data = await response.json();
        setError(data.error || "Error al agregar el parámetro.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
  }, [newParam, fetchParametros]);

  useEffect(() => {
    fetchParametros();
  }, [fetchParametros]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Administrar Parámetros</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Agregar Nuevo Parámetro</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Tipo (ej: Unidad, Categoría, Rol)"
              value={newParam.Tipo}
              onChange={(e) => setNewParam({ ...newParam, Tipo: e.target.value })}
              className="p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200"
            />
            <input
              type="text"
              placeholder="Valor (ej: m2, Obras Provisionales)"
              value={newParam.Valor}
              onChange={(e) => setNewParam({ ...newParam, Valor: e.target.value })}
              className="p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
          <button
            onClick={handleAddParam}
            className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600"
          >
            Agregar Parámetro
          </button>
        </div>
        {loading && <p className="text-gray-500">Cargando parámetros...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && parametros.length === 0 && (
          <p className="text-gray-500">No hay parámetros disponibles.</p>
        )}
        {!loading && parametros.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Valor</th>
                </tr>
              </thead>
              <tbody>
                {parametros.map((parametro) => (
                  <tr
                    key={parametro.ParametroID}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-4">{parametro.Tipo}</td>
                    <td className="px-6 py-4">{parametro.Valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdministrarParametros;