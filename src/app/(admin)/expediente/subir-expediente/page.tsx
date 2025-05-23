"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { create } from "zustand";

// Estado global con Zustand
interface FileState {
  filesByCategory: { [key: string]: File[] };
  uploadStatusByCategory: { [key: string]: string };
  errorsByCategory: { [key: string]: string[] };
  completedCategories: { [key: string]: boolean };
  setFilesByCategory: (category: string, files: File[]) => void;
  setUploadStatusByCategory: (category: string, status: string) => void;
  setErrorsByCategory: (category: string, errors: string[]) => void;
  setCompletedCategories: (category: string, completed: boolean) => void;
}

const useFileStore = create<FileState>((set) => ({
  filesByCategory: {},
  uploadStatusByCategory: {},
  errorsByCategory: {},
  completedCategories: {},
  setFilesByCategory: (category, files) =>
    set((state) => ({
      filesByCategory: { ...state.filesByCategory, [category]: files },
    })),
  setUploadStatusByCategory: (category, status) =>
    set((state) => ({
      uploadStatusByCategory: { ...state.uploadStatusByCategory, [category]: status },
    })),
  setErrorsByCategory: (category, errors) =>
    set((state) => ({
      errorsByCategory: { ...state.errorsByCategory, [category]: errors },
    })),
  setCompletedCategories: (category, completed) =>
    set((state) => ({
      completedCategories: { ...state.completedCategories, [category]: completed },
    })),
}));

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
  ItemPadre: string;
  ItemHijo: string;
  ItemNieto: string;
  Descripción: string;
  Unidad: string;
  Metrado: number;
  PrecioUnitario: number;
  CostoTotal: number;
  Category: string;
  Level: number;
  Parent?: string;
  Segmento: string;
};

type ValidationReport = {
  warnings: string[];
  errors: string[];
  isValid: boolean;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [".xlsx", ".xls", ".pdf", ".doc", ".docx"];

const SubirExpediente: React.FC = () => {
  const router = useRouter();
  const {
    filesByCategory,
    uploadStatusByCategory,
    errorsByCategory,
    completedCategories,
    setFilesByCategory,
    setUploadStatusByCategory,
    setErrorsByCategory,
    setCompletedCategories,
  } = useFileStore();

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [selectedConvenioId, setSelectedConvenioId] = useState<number | null>(null);
  const [loadingConvenios, setLoadingConvenios] = useState<boolean>(true);
  const [errorConvenios, setErrorConvenios] = useState<string>("");
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [previewDataByCategory, setPreviewDataByCategory] = useState<
    Record<string, { items: BudgetItem[]; validation: ValidationReport } | null>
  >({});
  const [showPreviewByCategory, setShowPreviewByCategory] = useState<Record<string, boolean>>({});
  const [showClearConfirm, setShowClearConfirm] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, { [key: string]: boolean }>>({});

  const categories = [
    "1. MEMORIA DESCRIPTIVA",
    "2. MEMORIA DE CALCULO",
    "3. METRADOS Y PRESUPUESTO",
    "4. ACU",
    "5. CUADRO COMPARATIVO",
    "6. CRONOGRAMA GANTT",
    "7. ESPECIFICACIONES TECNICAS",
    "8. PLANOS",
    "9. ESTUDIOS BASICOS",
    "10. ANEXOS",
  ];

  const allCategoriesCompleted = categories.every(
    (category) => completedCategories[category]
  );

  const selectedConvenio = convenios.find((c) => c.id_convenio === selectedConvenioId);

  const fetchConvenios = useCallback(async () => {
    try {
      setLoadingConvenios(true);
      const response = await fetch("/api/groconvenios/convenios");
      if (!response.ok) throw new Error("Error al cargar los convenios");
      const data = await response.json();
      console.log("Convenios cargados:", data);
      setConvenios(data);
      setErrorConvenios("");
      if (data.length > 0 && !selectedConvenioId) setSelectedConvenioId(data[0].id_convenio);
    } catch (err) {
      setErrorConvenios(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoadingConvenios(false);
    }
  }, [selectedConvenioId]);

  useEffect(() => {
    fetchConvenios();
  }, [fetchConvenios]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleFileChange = (category: string, files: File[]) => {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_FILE_SIZE) {
      setErrorsByCategory(category, [
        `El tamaño total de los archivos (${(totalSize / (1024 * 1024)).toFixed(2)} MB) excede el límite de ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
      ]);
      return;
    }

    const invalidFiles = files.filter(
      (file) => !ALLOWED_FILE_TYPES.some((ext) => file.name.toLowerCase().endsWith(ext))
    );
    if (invalidFiles.length > 0) {
      setErrorsByCategory(category, [
        `Tipo de archivo no permitido: ${invalidFiles.map((f) => f.name).join(", ")}. Solo se permiten ${ALLOWED_FILE_TYPES.join(", ")}.`,
      ]);
      return;
    }

    const uniqueFiles: File[] = [];
    const existingNames = new Set<string>();
    for (const file of files) {
      if (!existingNames.has(file.name)) {
        uniqueFiles.push(file);
        existingNames.add(file.name);
      } else {
        setErrorsByCategory(category, [
          `Archivo duplicado detectado: ${file.name}. Por favor, selecciona archivos únicos.`,
        ]);
        return;
      }
    }

    setFilesByCategory(category, uniqueFiles);
    setUploadStatusByCategory(
      category,
      uniqueFiles.length > 0 ? `${uniqueFiles.length} archivo(s) seleccionado(s)` : ""
    );
    setErrorsByCategory(category, []);
  };

  const handleInputChange = (category: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      handleFileChange(category, Array.from(event.target.files));
    }
  };

  const handleDragOver = (category: string, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!completedCategories[category]) setDragOverCategory(category);
  };

  const handleDragLeave = () => {
    setDragOverCategory(null);
  };

  const handleDrop = (category: string, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOverCategory(null);
    if (!completedCategories[category] && event.dataTransfer.files.length > 0) {
      handleFileChange(category, Array.from(event.dataTransfer.files));
    }
  };

  const handlePreview = async (category: string) => {
    const files = filesByCategory[category];
    if (!files || files.length === 0) {
      setErrorsByCategory(category, ["Por favor, selecciona al menos un archivo."]);
      return;
    }
    if (!selectedConvenioId) {
      setErrorsByCategory(category, ["Por favor, selecciona un convenio."]);
      return;
    }

    const formData = new FormData();
    files.forEach((file, index) => formData.append(`file-${index}`, file));
    formData.append("category", category);
    formData.append("id_convenio", selectedConvenioId.toString());

    try {
      setUploadStatusByCategory(category, "Validando archivo...");
      console.log(`Enviando solicitud para previsualizar categoría: ${category}, id_convenio: ${selectedConvenioId}`);
      const response = await fetch("/api/expediente/preview", { method: "POST", body: formData });
      const result = await response.json();
      console.log(`Respuesta del backend para categoría ${category}:`, result);

      if (!response.ok) {
        const errorMessage = result.error || "Error al previsualizar el archivo";
        setErrorsByCategory(category, [errorMessage]);
        throw new Error(errorMessage);
      }

      setPreviewDataByCategory((prev) => {
        const updatedData = { ...prev, [category]: result.data };
        console.log(`Estado actualizado de previewDataByCategory para categoría ${category}:`, updatedData[category]);
        return updatedData;
      });

      setShowPreviewByCategory((prev) => {
        const updatedShowPreview = { ...prev, [category]: true };
        console.log(`Estado actualizado de showPreviewByCategory para categoría ${category}:`, updatedShowPreview[category]);
        return updatedShowPreview;
      });

      // Inicializar grupos expandidos basados en Level
      const initialExpanded = result.data.items.reduce((acc, item) => {
        if (item.Level < 2) {
          acc[item.Descripción] = true;
        }
        return acc;
      }, {} as { [key: string]: boolean });
      setExpandedGroups((prev) => {
        const updatedExpandedGroups = { ...prev, [category]: initialExpanded };
        console.log(`Estado actualizado de expandedGroups para categoría ${category}:`, updatedExpandedGroups[category]);
        return updatedExpandedGroups;
      });
    } catch (error) {
      console.error(`Error al previsualizar para categoría ${category}:`, error);
      setErrorsByCategory(category, [error instanceof Error ? error.message : "Error desconocido"]);
    } finally {
      setUploadStatusByCategory(category, "");
    }
  };

  const handleConfirmUpload = async (category: string) => {
    if (!category || !filesByCategory[category]?.length || !selectedConvenioId) return;

    const formData = new FormData();
    filesByCategory[category].forEach((file, index) => formData.append(`file-${index}`, file));
    formData.append("category", category);
    formData.append("id_convenio", selectedConvenioId.toString());

    try {
      setUploadStatusByCategory(category, "Subiendo archivo...");
      const response = await fetch("/api/expediente/upload-excel", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) {
        setErrorsByCategory(category, [result.error || "Error al subir los archivos"]);
        setUploadStatusByCategory(category, "Error al subir archivos");
        throw new Error(result.error || "Error desconocido");
      }
      setCompletedCategories(category, true);
      setFilesByCategory(category, []);
      setUploadStatusByCategory(category, "¡Archivos subidos exitosamente!");
      setPreviewDataByCategory((prev) => ({ ...prev, [category]: null }));
      setShowPreviewByCategory((prev) => ({ ...prev, [category]: false }));
    } catch (error) {
      setErrorsByCategory(category, [error instanceof Error ? error.message : "Error desconocido"]);
      setUploadStatusByCategory(category, "Error al subir archivos");
    }
  };

  const handleClearFiles = (category: string) => {
    setShowClearConfirm(category);
  };

  const confirmClearFiles = (category: string) => {
    setFilesByCategory(category, []);
    setUploadStatusByCategory(category, "");
    setErrorsByCategory(category, []);
    setPreviewDataByCategory((prev) => ({ ...prev, [category]: null }));
    setShowPreviewByCategory((prev) => ({ ...prev, [category]: false }));
    setShowClearConfirm(null);
  };

  const handleNavigate = () => {
    router.push("/expediente/ver-expediente");
  };

  const toggleGroup = (category: string, groupDesc: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [groupDesc]: !prev[category]?.[groupDesc],
      },
    }));
  };

  const isItemVisible = (category: string, item: BudgetItem, index: number): boolean => {
    if (item.Level === 0) return true;
    if (item.Level === 1) {
      const parentDesc = item.Parent;
      return parentDesc ? expandedGroups[category]?.[parentDesc] !== false : true;
    }
    if (item.Level === 2) {
      const parentDesc = item.Parent;
      if (!parentDesc) return true;
      const parentItem = previewDataByCategory[category]?.items.find(i => i.Descripción === parentDesc);
      if (!parentItem) return true;
      const grandParentDesc = parentItem.Parent;
      return expandedGroups[category]?.[parentDesc] !== false && (!grandParentDesc || expandedGroups[category]?.[grandParentDesc] !== false);
    }
    return true;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Subir Expediente</h1>
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <label htmlFor="convenio-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Selecciona un Convenio
        </label>
        {loadingConvenios ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ) : errorConvenios ? (
          <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">
            {errorConvenios}
            <button onClick={fetchConvenios} className="ml-2 text-sm bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded">
              Reintentar
            </button>
          </div>
        ) : (
          <select
            id="convenio-select"
            value={selectedConvenioId || ""}
            onChange={(e) => setSelectedConvenioId(Number(e.target.value) || null)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            aria-describedby="convenio-help"
          >
            <option value="" disabled>Selecciona un convenio</option>
            {convenios.map((convenio) => (
              <option key={convenio.id_convenio} value={convenio.id_convenio}>
                {convenio.NombreProyecto} (ID: {convenio.id_convenio})
              </option>
            ))}
          </select>
        )}
        <p id="convenio-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Selecciona el proyecto al que deseas asociar los archivos.
        </p>
      </div>
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progreso: {Object.values(completedCategories).filter(Boolean).length} de {categories.length} categorías completadas
          </span>
          {allCategoriesCompleted && (
            <button
              onClick={handleNavigate}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
              aria-label="Ver expediente completo"
            >
              Ver Expediente Completo
            </button>
          )}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5" role="progressbar" aria-valuenow={Object.values(completedCategories).filter(Boolean).length} aria-valuemin={0} aria-valuemax={categories.length}>
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${(Object.values(completedCategories).filter(Boolean).length / categories.length) * 100}%` }}
          ></div>
        </div>
      </div>
      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category}
            className={`rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
              completedCategories[category]
                ? "border-l-4 border-green-500"
                : filesByCategory[category]?.length > 0
                ? "border-l-4 border-blue-500"
                : "border-l-4 border-red-500"
            }`}
          >
            <button
              onClick={() => toggleCategory(category)}
              className={`w-full p-4 flex justify-between items-center text-left font-medium ${
                completedCategories[category]
                  ? "bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-800 dark:text-green-200"
                  : filesByCategory[category]?.length > 0
                  ? "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                  : "bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-800 dark:text-red-200"
              }`}
              aria-expanded={expandedCategories[category]}
              aria-controls={`category-${category.replace(/\s+/g, "-")}`}
            >
              <span>{category}</span>
              <span className={`transform transition-transform ${expandedCategories[category] ? "rotate-90" : ""}`}>
                ▶
              </span>
            </button>
            {expandedCategories[category] && (
              <div
                id={`category-${category.replace(/\s+/g, "-")}`}
                className={`p-4 border-2 border-dashed transition-colors ${
                  dragOverCategory === category
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                }`}
                onDragOver={(e) => handleDragOver(category, e)}
                onDragEnter={() => !completedCategories[category] && setDragOverCategory(category)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(category, e)}
                role="region"
                aria-label={`Área de carga para ${category.split(".")[1].trim()}`}
              >
                <div className={`mb-4 p-4 rounded-lg text-center ${dragOverCategory === category ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-50 dark:bg-gray-700"}`}>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Arrastra y suelta archivos aquí</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Formatos permitidos: {ALLOWED_FILE_TYPES.join(", ")}</p>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor={`file-input-${category.replace(/\s+/g, "-")}`}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Selecciona archivos para {category.split(".")[1].trim()}
                  </label>
                  <div className="flex items-center">
                    <label className="flex-1 cursor-pointer">
                      <span className="sr-only">Seleccionar archivos</span>
                      <input
                        id={`file-input-${category.replace(/\s+/g, "-")}`}
                        type="file"
                        accept={ALLOWED_FILE_TYPES.join(",")}
                        multiple
                        onChange={(e) => handleInputChange(category, e)}
                        className="hidden"
                        disabled={completedCategories[category]}
                        aria-describedby={`file-help-${category.replace(/\s+/g, "-")}`}
                      />
                      <div className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        Seleccionar Archivos
                      </div>
                    </label>
                    {filesByCategory[category]?.length > 0 && (
                      <button
                        onClick={() => handleClearFiles(category)}
                        className="ml-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        aria-label={`Limpiar archivos de ${category.split(".")[1].trim()}`}
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <p id={`file-help-${category.replace(/\s+/g, "-")}`} className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Tamaño máximo: {(MAX_FILE_SIZE / (1024 * 1024))} MB
                  </p>
                </div>
                {filesByCategory[category]?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Archivos seleccionados ({filesByCategory[category].length}):
                    </p>
                    <ul className="space-y-1">
                      {filesByCategory[category].map((file, index) => (
                        <li key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">{file.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => handlePreview(category)}
                    disabled={
                      !filesByCategory[category]?.length ||
                      !selectedConvenioId ||
                      completedCategories[category] ||
                      uploadStatusByCategory[category]?.includes("Validando...")
                    }
                    className={`px-4 py-2 rounded-md flex-1 ${
                      filesByCategory[category]?.length && selectedConvenioId && !completedCategories[category]
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    } transition-colors`}
                    aria-label={`Previsualizar archivos de ${category.split(".")[1].trim()}`}
                  >
                    {uploadStatusByCategory[category]?.includes("Validando...") ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Validando...
                      </span>
                    ) : (
                      "Previsualizar"
                    )}
                  </button>
                </div>
                {uploadStatusByCategory[category] && (
                  <p className={`mb-2 text-sm ${errorsByCategory[category]?.length ? "text-red-500" : "text-green-500"}`}>
                    {uploadStatusByCategory[category]}
                  </p>
                )}
                {errorsByCategory[category]?.map((error, index) => (
                  <p key={index} className="mb-2 text-sm text-red-500">{error}</p>
                ))}
                {console.log(`Verificando si hay datos para categoría ${category}:`, previewDataByCategory[category])}
                {previewDataByCategory[category] && (
                  <div className="mt-4">
                    {console.log(`showPreviewByCategory para categoría ${category}:`, showPreviewByCategory[category])}
                    {previewDataByCategory[category]?.validation.errors.length > 0 && (
                      <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">Errores encontrados:</h3>
                        <ul className="list-disc pl-5 space-y-1 text-red-600 dark:text-red-400">
                          {previewDataByCategory[category]?.validation.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {previewDataByCategory[category]?.validation.warnings.length > 0 && (
                      <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Advertencias:</h3>
                        <ul className="list-disc pl-5 space-y-1 text-yellow-600 dark:text-yellow-400">
                          {previewDataByCategory[category]?.validation.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {console.log(`Número de ítems para categoría ${category}:`, previewDataByCategory[category]?.items?.length)}
                    {Array.isArray(previewDataByCategory[category]?.items) && previewDataByCategory[category]?.items.length > 0 ? (
                      <>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                          <button
                            onClick={() => setShowPreviewByCategory((prev) => {
                              const newValue = { ...prev, [category]: !prev[category] };
                              console.log(`Nuevo valor de showPreviewByCategory para categoría ${category}:`, newValue[category]);
                              return newValue;
                            })}
                            className="w-full p-4 flex justify-between items-center text-left text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <span>Desglose del Presupuesto</span>
                            <span>{showPreviewByCategory[category] ? "▼" : "▶"}</span>
                          </button>
                          {showPreviewByCategory[category] && (
                            <div className="p-4">
                              <div className="overflow-x-auto">
                                {console.log(`Datos para renderizar tabla en categoría ${category}:`, previewDataByCategory[category]?.items)}
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                      <th className="px-6 py-3"></th>
                                      <th className="px-6 py-3">Item</th>
                                      <th className="px-6 py-3">Descripción</th>
                                      <th className="px-6 py-3">Und.</th>
                                      <th className="px-6 py-3">Metrado</th>
                                      <th className="px-6 py-3">P.U.</th>
                                      <th className="px-6 py-3">Parcial</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {previewDataByCategory[category]?.items.map((item, index) => {
                                      const isVisible = isItemVisible(category, item, index);
                                      console.log(`Ítem ${index} en categoría ${category}:`, item, `Es visible: ${isVisible}`);
                                      console.log(`Valores para ítem ${index}: Unidad=${item.Unidad}, Metrado=${item.Metrado}, PrecioUnitario=${item.PrecioUnitario}`);
                                      if (!isVisible) return null;
                                      const isGroup = item.Level < 2;
                                      const indent = item.Level * 20;
                                      const rowStyle = isGroup
                                        ? item.Level === 0
                                          ? 'bg-gray-200 dark:bg-gray-700 font-bold'
                                          : 'bg-gray-100 dark:bg-gray-600 font-semibold'
                                        : 'bg-white dark:bg-gray-800';
                                      return (
                                        <tr
                                          key={`${category}-${index}`}
                                          className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${rowStyle}`}
                                        >
                                          <td className="px-2 py-4">
                                            {isGroup && (
                                              <button
                                                onClick={() => toggleGroup(category, item.Descripción)}
                                                className="text-gray-500 hover:text-gray-700"
                                              >
                                                {expandedGroups[category]?.[item.Descripción] ? "▼" : "▶"}
                                              </button>
                                            )}
                                          </td>
                                          <td className="px-6 py-4" style={{ paddingLeft: `${indent}px` }}>
                                            {item.Codigo || '-'}
                                          </td>
                                          <td className="px-6 py-4" style={{ paddingLeft: `${indent + 10}px` }}>
                                            {item.Descripción?.trim() || '-'}
                                          </td>
                                          <td className="px-6 py-4">{item.Unidad || '-'}</td>
                                          <td className="px-6 py-4">
                                            {item.Metrado ? item.Metrado.toLocaleString() : '-'}
                                          </td>
                                          <td className="px-6 py-4">
                                            {item.PrecioUnitario
                                              ? item.PrecioUnitario.toLocaleString(undefined, {
                                                  style: "currency",
                                                  currency: selectedConvenio?.SimboloMonetario || "PEN",
                                                })
                                              : '-'}
                                          </td>
                                          <td className="px-6 py-4">{item.CostoTotal ? formatNumber(item.CostoTotal) : '-'}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                                {previewDataByCategory[category]?.items.length === 0 && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    No hay ítems visibles en la tabla.
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex justify-end space-x-3">
                          <button
                            onClick={() => {
                              setPreviewDataByCategory((prev) => ({ ...prev, [category]: null }));
                              setShowPreviewByCategory((prev) => ({ ...prev, [category]: false }));
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Cancelar subida"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleConfirmUpload(category)}
                            disabled={
                              !previewDataByCategory[category]?.validation.isValid ||
                              uploadStatusByCategory[category]?.includes("Subiendo...")
                            }
                            className={`px-4 py-2 rounded-md text-white ${
                              previewDataByCategory[category]?.validation.isValid
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-gray-400 cursor-not-allowed"
                            } transition-colors`}
                            aria-label="Confirmar y subir archivos"
                          >
                            {uploadStatusByCategory[category]?.includes("Subiendo...") ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Subiendo...
                              </span>
                            ) : (
                              "Confirmar y Subir"
                            )}
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No hay ítems para mostrar.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Confirmar Limpieza</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              ¿Estás seguro de que deseas limpiar todos los archivos seleccionados para {showClearConfirm.split(".")[1].trim()}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowClearConfirm(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Cancelar limpieza"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmClearFiles(showClearConfirm)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                aria-label="Confirmar limpieza"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubirExpediente;