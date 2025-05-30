"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Convenio = {
  id_convenio: number;
  NombreProyecto: string;
  Localidad: string;
  Distrito: string;
  Provincia: string;
  Departamento: string;
  Entidad: string;
  Programa: string;
  Proyectista: string;
  Evaluador: string;
  PresupuestoBase: number | null;
  PresupuestoFinanciamiento: number | null;
  AporteBeneficiario: number | null;
  SimboloMonetario: string | null;
  IGV: number | null;
  PlazoEjecucionMeses: number | null;
  PlazoEjecucionDias: number | null;
  NumeroBeneficiarios: number | null;
  CreadoEn: string;
  ActualizadoEn: string;
};

type FormData = {
  NombreProyecto: string;
  Localidad: string;
  Distrito: string;
  Provincia: string;
  Departamento: string;
  Entidad: string;
  Programa: string;
  Proyectista: string;
  Evaluador: string;
  PresupuestoBase: string;
  PresupuestoFinanciamiento: string;
  AporteBeneficiario: string;
  SimboloMonetario: string;
  IGV: string;
  PlazoEjecucionMeses: string;
  PlazoEjecucionDias: string;
  NumeroBeneficiarios: string;
};

type ExpedienteFile = {
  NombreArchivo: string;
  TipoArchivo: string;
  RutaArchivo: string;
  TamañoArchivo: number;
  Descripcion: string;
  FechaCarga: string;
  CreadoEn: string;
  ActualizadoEn: string;
};

type FilesByCategory = {
  [category: string]: ExpedienteFile[];
};

const VerExpedientes: React.FC = () => {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [selectedConvenioId, setSelectedConvenioId] = useState<number | null>(null);
  const [loadingConvenios, setLoadingConvenios] = useState<boolean>(true);
  const [errorConvenios, setErrorConvenios] = useState<string>("");
  const [filesByCategory, setFilesByCategory] = useState<FilesByCategory>({});
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [errorFiles, setErrorFiles] = useState<string>("");
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    NombreProyecto: "",
    Localidad: "",
    Distrito: "",
    Provincia: "",
    Departamento: "",
    Entidad: "",
    Programa: "",
    Proyectista: "",
    Evaluador: "",
    PresupuestoBase: "",
    PresupuestoFinanciamiento: "",
    AporteBeneficiario: "",
    SimboloMonetario: "",
    IGV: "",
    PlazoEjecucionMeses: "",
    PlazoEjecucionDias: "",
    NumeroBeneficiarios: "",
  });

  const fetchConvenios = useCallback(async () => {
    try {
      setLoadingConvenios(true);
      const response = await fetch("http://localhost:3003/api/groconvenios/convenios");
      const data = await response.json();
      if (response.ok) {
        setConvenios(data);
        setErrorConvenios("");
      } else {
        setErrorConvenios(data.error || "Error al cargar los convenios.");
      }
    } catch (err) {
      setErrorConvenios("Error de conexión con el servidor.");
    } finally {
      setLoadingConvenios(false);
    }
  }, []);

  const fetchFiles = useCallback(async (convenioId: number) => {
    try {
      setLoadingFiles(true);
      const response = await fetch(`/api/expediente/files?convenioId=${convenioId}`);
      const data = await response.json();
      if (response.ok) {
        setFilesByCategory(data);
        setErrorFiles("");
      } else {
        setErrorFiles(data.error || "Error al cargar los archivos.");
      }
    } catch (err) {
      setErrorFiles("Error de conexión con el servidor.");
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  const handleEdit = (convenio: Convenio) => {
    setSelectedConvenioId(convenio.id_convenio);
    setFormData({
      NombreProyecto: convenio.NombreProyecto,
      Localidad: convenio.Localidad,
      Distrito: convenio.Distrito,
      Provincia: convenio.Provincia,
      Departamento: convenio.Departamento,
      Entidad: convenio.Entidad,
      Programa: convenio.Programa,
      Proyectista: convenio.Proyectista,
      Evaluador: convenio.Evaluador,
      PresupuestoBase: convenio.PresupuestoBase !== null ? String(convenio.PresupuestoBase) : "",
      PresupuestoFinanciamiento: convenio.PresupuestoFinanciamiento !== null ? String(convenio.PresupuestoFinanciamiento) : "",
      AporteBeneficiario: convenio.AporteBeneficiario !== null ? String(convenio.AporteBeneficiario) : "",
      SimboloMonetario: convenio.SimboloMonetario || "",
      IGV: convenio.IGV !== null ? String(convenio.IGV) : "",
      PlazoEjecucionMeses: convenio.PlazoEjecucionMeses !== null ? String(convenio.PlazoEjecucionMeses) : "",
      NumeroBeneficiarios: convenio.NumeroBeneficiarios !== null ? String(convenio.NumeroBeneficiarios) : "",
      PlazoEjecucionDias: convenio.PlazoEjecucionDias !== null ? String(convenio.PlazoEjecucionDias) : "",
    });
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedConvenioId) {
      setErrorConvenios("El ID del convenio no es válido.");
      return;
    }

    if (!formData.NombreProyecto) {
      setErrorConvenios("El nombre del proyecto es obligatorio.");
      return;
    }

    const numericFields = {
      PresupuestoBase: formData.PresupuestoBase ? Number(formData.PresupuestoBase) : null,
      PresupuestoFinanciamiento: formData.PresupuestoFinanciamiento ? Number(formData.PresupuestoFinanciamiento) : null,
      AporteBeneficiario: formData.AporteBeneficiario ? Number(formData.AporteBeneficiario) : null,
      IGV: formData.IGV ? Number(formData.IGV) : null,
      PlazoEjecucionMeses: formData.PlazoEjecucionMeses ? Number(formData.PlazoEjecucionMeses) : null,
      PlazoEjecucionDias: formData.PlazoEjecucionDias ? Number(formData.PlazoEjecucionDias) : null,
      NumeroBeneficiarios: formData.NumeroBeneficiarios ? Number(formData.NumeroBeneficiarios) : null,
    };

    try {
      const response = await fetch(`http://localhost:3003/api/groconvenios/convenios/${selectedConvenioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ...numericFields,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el convenio.");
      }

      const updatedConvenio = await response.json();
      setConvenios(convenios.map((c) => (c.id_convenio === updatedConvenio.id_convenio ? updatedConvenio : c)));
      setEditModalOpen(false);
      setFormData({
        NombreProyecto: "",
        Localidad: "",
        Distrito: "",
        Provincia: "",
        Departamento: "",
        Entidad: "",
        Programa: "",
        Proyectista: "",
        Evaluador: "",
        PresupuestoBase: "",
        PresupuestoFinanciamiento: "",
        AporteBeneficiario: "",
        SimboloMonetario: "",
        IGV: "",
        PlazoEjecucionMeses: "",
        PlazoEjecucionDias: "",
        NumeroBeneficiarios: "",
      });
      setErrorConvenios("");
    } catch (error) {
      setErrorConvenios(error instanceof Error ? error.message : "Error al actualizar el convenio.");
    }
  };

  useEffect(() => {
    fetchConvenios();
  }, [fetchConvenios]);

  useEffect(() => {
    if (selectedConvenioId) {
      fetchFiles(selectedConvenioId);
    }
  }, [selectedConvenioId, fetchFiles]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ver Expedientes</h1>

      {/* Convenio Dropdown */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Selecciona un Convenio
        </label>
        {loadingConvenios && <p className="text-gray-500">Cargando convenios...</p>}
        {errorConvenios && <p className="text-red-500">{errorConvenios}</p>}
        {!loadingConvenios && !errorConvenios && (
          <div className="flex items-center space-x-4">
            <select
              value={selectedConvenioId || ""}
              onChange={(e) => setSelectedConvenioId(parseInt(e.target.value) || null)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="" disabled>
                Selecciona un convenio
              </option>
              {convenios.map((convenio) => (
                <option key={convenio.id_convenio} value={convenio.id_convenio}>
                  {convenio.NombreProyecto} (ID: {convenio.id_convenio})
                </option>
              ))}
            </select>
            {selectedConvenioId && (
              <button
                onClick={() => handleEdit(convenios.find((c) => c.id_convenio === selectedConvenioId)!)}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Editar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Submenus (Categories and Files) */}
      {selectedConvenioId && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          {loadingFiles && <p className="text-gray-500">Cargando archivos...</p>}
          {errorFiles && <p className="text-red-500">{errorFiles}</p>}
          {!loadingFiles && !errorFiles && Object.keys(filesByCategory).length === 0 && (
            <p className="text-gray-500">No hay archivos disponibles.</p>
          )}
          {!loadingFiles && Object.keys(filesByCategory).length > 0 && (
            <div className="space-y-4">
              {Object.keys(filesByCategory).map((category) => (
                <div
                  key={category}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full p-4 flex justify-between items-center text-left text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <span>{category}</span>
                    <span>{expandedCategories[category] ? "▼" : "▶"}</span>
                  </button>

                  {expandedCategories[category] && (
                    <div className="p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                              <th className="px-6 py-3">Nombre</th>
                              <th className="px-6 py-3">Tipo</th>
                              <th className="px-6 py-3">Tamaño (KB)</th>
                              <th className="px-6 py-3">Descripción</th>
                              <th className="px-6 py-3">Fecha de Carga</th>
                              <th className="px-6 py-3">Creado</th>
                              <th className="px-6 py-3">Actualizado</th>
                              <th className="px-6 py-3">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filesByCategory[category].map((file, index) => (
                              <tr
                                key={index}
                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                              >
                                <td className="px-6 py-4">{file.NombreArchivo}</td>
                                <td className="px-6 py-4">{file.TipoArchivo}</td>
                                <td className="px-6 py-4">{file.TamañoArchivo.toFixed(2)}</td>
                                <td className="px-6 py-4">{file.Descripcion}</td>
                                <td className="px-6 py-4">
                                  {new Date(file.FechaCarga).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                  {new Date(file.CreadoEn).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                  {new Date(file.ActualizadoEn).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                  <Link
                                    href={file.RutaArchivo}
                                    target="_blank"
                                    className="text-brand-500 hover:underline"
                                  >
                                    Descargar
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Editar Convenio
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Nombre Proyecto
                </label>
                <input
                  type="text"
                  value={formData.NombreProyecto}
                  onChange={(e) => setFormData({ ...formData, NombreProyecto: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Localidad
                </label>
                <input
                  type="text"
                  value={formData.Localidad}
                  onChange={(e) => setFormData({ ...formData, Localidad: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Distrito
                </label>
                <input
                  type="text"
                  value={formData.Distrito}
                  onChange={(e) => setFormData({ ...formData, Distrito: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Provincia
                </label>
                <input
                  type="text"
                  value={formData.Provincia}
                  onChange={(e) => setFormData({ ...formData, Provincia: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Departamento
                </label>
                <input
                  type="text"
                  value={formData.Departamento}
                  onChange={(e) => setFormData({ ...formData, Departamento: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Entidad
                </label>
                <input
                  type="text"
                  value={formData.Entidad}
                  onChange={(e) => setFormData({ ...formData, Entidad: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Programa
                </label>
                <input
                  type="text"
                  value={formData.Programa}
                  onChange={(e) => setFormData({ ...formData, Programa: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Proyectista
                </label>
                <input
                  type="text"
                  value={formData.Proyectista}
                  onChange={(e) => setFormData({ ...formData, Proyectista: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Evaluador
                </label>
                <input
                  type="text"
                  value={formData.Evaluador}
                  onChange={(e) => setFormData({ ...formData, Evaluador: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Presupuesto Base
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.PresupuestoBase}
                  onChange={(e) => setFormData({ ...formData, PresupuestoBase: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Presupuesto Financiamiento
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.PresupuestoFinanciamiento}
                  onChange={(e) => setFormData({ ...formData, PresupuestoFinanciamiento: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Aporte Beneficiario
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.AporteBeneficiario}
                  onChange={(e) => setFormData({ ...formData, AporteBeneficiario: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Símbolo Monetario
                </label>
                <input
                  type="text"
                  value={formData.SimboloMonetario}
                  onChange={(e) => setFormData({ ...formData, SimboloMonetario: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">IGV</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.IGV}
                  onChange={(e) => setFormData({ ...formData, IGV: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Plazo Ejecución Meses
                </label>
                <input
                  type="number"
                  value={formData.PlazoEjecucionMeses}
                  onChange={(e) => setFormData({ ...formData, PlazoEjecucionMeses: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Plazo Ejecución Días
                </label>
                <input
                  type="number"
                  value={formData.PlazoEjecucionDias}
                  onChange={(e) => setFormData({ ...formData, PlazoEjecucionDias: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Número Beneficiarios
                </label>
                <input
                  type="number"
                  value={formData.NumeroBeneficiarios}
                  onChange={(e) => setFormData({ ...formData, NumeroBeneficiarios: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setFormData({
                    NombreProyecto: "",
                    Localidad: "",
                    Distrito: "",
                    Provincia: "",
                    Departamento: "",
                    Entidad: "",
                    Programa: "",
                    Proyectista: "",
                    Evaluador: "",
                    PresupuestoBase: "",
                    PresupuestoFinanciamiento: "",
                    AporteBeneficiario: "",
                    SimboloMonetario: "",
                    IGV: "",
                    PlazoEjecucionMeses: "",
                    PlazoEjecucionDias: "",
                    NumeroBeneficiarios: "",
                  });
                  setErrorConvenios("");
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerExpedientes;