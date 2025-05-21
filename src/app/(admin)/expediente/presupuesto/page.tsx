"use client";
import React, { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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

type BudgetItem = {
  Codigo: string;
  Descripción: string;
  Unidad: string;
  Metrado: number;
  PrecioUnitario: number;
  CostoTotal: number;
  Level: number;
  Parent?: string;
};

type BudgetData = {
  items: BudgetItem[];
  categories: { name: string; value: number }[];
};

const BudgetModule: React.FC = () => {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [selectedConvenioId, setSelectedConvenioId] = useState<number | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetData>({ items: [], categories: [] });
  const [loadingConvenios, setLoadingConvenios] = useState<boolean>(true);
  const [errorConvenios, setErrorConvenios] = useState<string>("");
  const [loadingBudget, setLoadingBudget] = useState<boolean>(false);
  const [errorBudget, setErrorBudget] = useState<string>("");
  const [isTableExpanded, setIsTableExpanded] = useState<boolean>(true);
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({}); // Track expanded state by Descripción

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

  const fetchBudgetData = useCallback(async (id_convenio: number) => {
    try {
      setLoadingBudget(true);
      const response = await fetch(`/api/expediente/budget?id_convenio=${id_convenio}`);
      const data = await response.json();
      if (response.ok) {
        setBudgetData(data);
        // Initialize all groups as expanded
        const initialExpanded = data.items.reduce((acc, item) => {
          if (item.Level < 2) { // Level 0 or 1 (groups)
            acc[item.Descripción] = true;
          }
          return acc;
        }, {} as { [key: string]: boolean });
        setExpandedGroups(initialExpanded);
        setErrorBudget("");
      } else {
        setErrorBudget(data.error || "Error al cargar los datos del presupuesto.");
      }
    } catch (err) {
      setErrorBudget("Error de conexión con el servidor.");
    } finally {
      setLoadingBudget(false);
    }
  }, []);

  useEffect(() => {
    fetchConvenios();
  }, [fetchConvenios]);

  useEffect(() => {
    if (selectedConvenioId) {
      fetchBudgetData(selectedConvenioId);
    }
  }, [selectedConvenioId, fetchBudgetData]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const COLORS = ['#0088FE', '#FFBB28'];

  const directCost = 1664640.73;
  const indirectCost = 245465.41;
  const totalCost = directCost + indirectCost;
  const costData = [
    { name: 'Direct Cost', value: directCost },
    { name: 'Indirect Cost', value: indirectCost }
  ];

  // Toggle the expanded state of a group
  const toggleGroup = (groupDesc: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupDesc]: !prev[groupDesc],
    }));
  };

  // Check if an item should be visible based on its parent's expanded state
  const isItemVisible = (item: BudgetItem, index: number): boolean => {
    if (item.Level === 0) return true; // Top-level groups are always visible
    if (item.Level === 1) {
      // Find the parent (Level 0) and check if it's expanded
      const parentDesc = item.Parent;
      return parentDesc ? expandedGroups[parentDesc] !== false : true;
    }
    if (item.Level === 2) {
      // Find the immediate parent (Level 1) and its parent (Level 0)
      const parentDesc = item.Parent;
      if (!parentDesc) return true;
      const parentItem = budgetData.items.find(i => i.Descripción === parentDesc);
      if (!parentItem) return true;
      const grandParentDesc = parentItem.Parent;
      return expandedGroups[parentDesc] !== false && (!grandParentDesc || expandedGroups[grandParentDesc] !== false);
    }
    return true;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Módulo de Presupuesto</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Selecciona un Convenio
        </label>
        {loadingConvenios && <p className="text-gray-500">Cargando convenios...</p>}
        {errorConvenios && <p className="text-red-500">{errorConvenios}</p>}
        {!loadingConvenios && !errorConvenios && (
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
        )}
      </div>

      {selectedConvenioId && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          {loadingBudget && <p className="text-gray-500">Cargando datos del presupuesto...</p>}
          {errorBudget && <p className="text-red-500">{errorBudget}</p>}
          {!loadingBudget && !errorBudget && budgetData.items.length === 0 && (
            <p className="text-gray-500">No hay datos de presupuesto disponibles.</p>
          )}
          {!loadingBudget && budgetData.items.length > 0 && (
            <div className="space-y-6">
              {console.log('Budget items:', budgetData.items)}

              <div>
                <h2 className="text-xl font-semibold mb-2">Resumen</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  El presupuesto total es S/. {formatNumber(totalCost)}, con S/. {formatNumber(directCost)} en costos directos y S/. {formatNumber(indirectCost)} en costos indirectos. Los costos de flete (S/. {formatNumber(269962.04)}) representan ~14.1% del presupuesto, debido al transporte por acémilas en las zonas rurales de Aguas de Nieve, Pucaloma y Utcuyacu.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => setIsTableExpanded(!isTableExpanded)}
                  className="w-full p-4 flex justify-between items-center text-left text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <span>Desglose del Presupuesto</span>
                  <span>{isTableExpanded ? "▼" : "▶"}</span>
                </button>
                {isTableExpanded && (
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                          <tr>
                            <th className="px-6 py-3"></th> 
                            <th className="px-6 py-3">Código</th>
                            <th className="px-6 py-3">Descripción</th>
                            <th className="px-6 py-3">Unidad</th>
                            <th className="px-6 py-3">Metrado</th>
                            <th className="px-6 py-3">Precio Unitario (S/.)</th>
                            <th className="px-6 py-3">Costo Total (S/.)</th>
                       
                          </tr>
                        </thead>
                        <tbody>
                          {budgetData.items.map((item, index) => {
                            if (!('Level' in item)) {
                              console.error('Invalid item structure at index', index, item);
                              return null;
                            }
                            const isGroup = item.Level < 2;
                            const indent = item.Level * 20;
                            const rowStyle = isGroup
                              ? item.Level === 0
                                ? 'bg-gray-200 dark:bg-gray-700 font-bold'
                                : 'bg-gray-100 dark:bg-gray-600 font-semibold'
                              : 'bg-white dark:bg-gray-800';
                            const isVisible = isItemVisible(item, index);

                            if (!isVisible) return null;

                            return (
                              <tr
                                key={index}
                                className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${rowStyle}`}
                              >
                                <td className="px-2 py-4">
                                  {isGroup && (
                                    <button
                                      onClick={() => toggleGroup(item.Descripción)}
                                      className="text-gray-500 hover:text-gray-700"
                                    >
                                      {expandedGroups[item.Descripción] ? "▼" : "▶"}
                                    </button>
                                  )}
                                </td>
                                <td className="px-6 py-4" style={{ paddingLeft: `${indent}px` }}>{item.Codigo}</td>
                                <td className="px-6 py-4" style={{ paddingLeft: `${indent + 10}px` }}>{item.Descripción}</td>
                                <td className="px-6 py-4">{isGroup ? '' : item.Unidad}</td>
                                <td className="px-6 py-4">{isGroup ? '' : formatNumber(item.Metrado)}</td>
                                <td className="px-6 py-4">{isGroup ? '' : formatNumber(item.PrecioUnitario)}</td>
                                <td className="px-6 py-4">{formatNumber(item.CostoTotal)}</td>
                          
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">Distribución de Costos por Categoría</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={budgetData.categories} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis tickFormatter={formatNumber} fontSize={12} />
                    <Tooltip formatter={(value: number) => `S/. ${formatNumber(value)}`} />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Costo (S/.)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">Costos Directos vs. Indirectos</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={costData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      fontSize={12}
                    >
                      {costData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `S/. ${formatNumber(value)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetModule;