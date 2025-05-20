
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Convenio = {
  convenioID: number;
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

type FileData = {
  [key: string]: File[];
};

const SubirExpediente: React.FC = () => {
  const [filesByCategory, setFilesByCategory] = useState<FileData>({});
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [uploadStatusByCategory, setUploadStatusByCategory] = useState<{ [key: string]: string }>({});
  const [errorsByCategory, setErrorsByCategory] = useState<{ [key: string]: string[] }>({});
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [selectedConvenioId, setSelectedConvenioId] = useState<number | null>(null);
  const [loadingConvenios, setLoadingConvenios] = useState<boolean>(true);
  const [errorConvenios, setErrorConvenios] = useState<string>("");
  const router = useRouter();

  // Maximum allowed size: 10 MB (matches the server limit)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB in bytes

  // List of categories based on the directory structure
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

  // Fetch convenios from the API
  const fetchConvenios = useCallback(async () => {
    try {
      setLoadingConvenios(true);
      const response = await fetch("http://localhost:3003/api/groconvenios/convenios2");
      const data = await response.json();
      if (response.ok) {
        setConvenios(data);
        setErrorConvenios("");
        // Set the first convenio as default if available
        if (data.length > 0) setSelectedConvenioId(data[0].convenioID);
      } else {
        setErrorConvenios(data.error || "Error al cargar los convenios.");
      }
    } catch (err) {
      setErrorConvenios("Error de conexión con el servidor.");
    } finally {
      setLoadingConvenios(false);
    }
  }, []);

  useEffect(() => {
    fetchConvenios();
  }, [fetchConvenios]);

  // Toggle expand/collapse for a category
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Handle file selection for a category with size validation
  const handleFileChange = (category: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);

      // Calculate total size of selected files
      const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

      if (totalSize > MAX_FILE_SIZE) {
        setErrorsByCategory((prev) => ({
          ...prev,
          [category]: [
            `El tamaño total de los archivos (${(totalSize / (1024 * 1024)).toFixed(2)} MB) excede el límite de 10 MB.`,
          ],
        }));
        setFilesByCategory((prev) => ({
          ...prev,
          [category]: [],
        }));
        return;
      }

      setFilesByCategory((prev) => ({
        ...prev,
        [category]: selectedFiles,
      }));
      setUploadStatusByCategory((prev) => ({
        ...prev,
        [category]: "",
      }));
      setErrorsByCategory((prev) => ({
        ...prev,
        [category]: [],
      }));
    }
  };

  // Handle file upload for a category
  const handleUpload = useCallback(
    async (category: string) => {
      const files = filesByCategory[category] || [];
      if (files.length === 0) {
        setErrorsByCategory((prev) => ({
          ...prev,
          [category]: ["Por favor, selecciona al menos un archivo."],
        }));
        return;
      }

      if (!selectedConvenioId) {
        setErrorsByCategory((prev) => ({
          ...prev,
          [category]: ["Por favor, selecciona un convenio."],
        }));
        return;
      }

      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file);
      });
      formData.append("category", category);
      formData.append("convenioId", selectedConvenioId.toString());

      try {
        setUploadStatusByCategory((prev) => ({
          ...prev,
          [category]: "Cargando...",
        }));
        const response = await fetch("/api/expediente/upload-excel", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (response.ok) {
          setUploadStatusByCategory((prev) => ({
            ...prev,
            [category]: "¡Archivos cargados exitosamente!",
          }));
          setErrorsByCategory((prev) => ({
            ...prev,
            [category]: [],
          }));
          // Clear files after successful upload
          setFilesByCategory((prev) => ({
            ...prev,
            [category]: [],
          }));
          // Redirect after 2 seconds if all uploads are successful (optional)
          setTimeout(() => router.push("/expediente/ver-expediente"), 2000);
        } else {
          setUploadStatusByCategory((prev) => ({
            ...prev,
            [category]: "Error al cargar los archivos.",
          }));
          setErrorsByCategory((prev) => ({
            ...prev,
            [category]: result.errors || ["Error desconocido."],
          }));
        }
      } catch (error) {
        setUploadStatusByCategory((prev) => ({
          ...prev,
          [category]: "Error al cargar los archivos.",
        }));
        setErrorsByCategory((prev) => ({
          ...prev,
          [category]: ["Error de conexión con el servidor."],
        }));
      }
    },
    [filesByCategory, selectedConvenioId, router]
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Subir Expediente</h1>

      {/* Convenio Dropdown */}
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
              <option key={convenio.convenioID} value={convenio.convenioID}>
                {convenio.NombreProyecto} (ID: {convenio.convenioID})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full p-4 flex justify-between items-center text-left text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <span>{category}</span>
              <span>{expandedCategories[category] ? "▼" : "▶"}</span>
            </button>

            {/* Category Content (Expandable) */}
            {expandedCategories[category] && (
              <div className="p-4">
                {/* File Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Selecciona archivos (PDF, Excel, etc.) para {category}
                  </label>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .pdf, .doc, .docx"
                    multiple
                    onChange={(e) => handleFileChange(category, e)}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                </div>

                {/* Display Selected Files */}
                {filesByCategory[category]?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Archivos seleccionados ({filesByCategory[category].length}):
                    </p>
                    <ul className="mt-1 text-sm text-gray-500 list-disc pl-5">
                      {filesByCategory[category].map((file, index) => (
                        <li key={index}>
                          {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Upload Button */}
                <button
                  onClick={() => handleUpload(category)}
                  disabled={
                    !filesByCategory[category]?.length ||
                    uploadStatusByCategory[category] === "Cargando..." ||
                    !selectedConvenioId
                  }
                  className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 disabled:bg-gray-400"
                >
                  {uploadStatusByCategory[category] === "Cargando..."
                    ? "Cargando..."
                    : "Subir Archivos"}
                </button>

                {/* Status and Errors */}
                {uploadStatusByCategory[category] && (
                  <p
                    className={`mt-4 text-sm ${
                      errorsByCategory[category]?.length > 0
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {uploadStatusByCategory[category]}
                  </p>
                )}
                {errorsByCategory[category]?.length > 0 && (
                  <ul className="mt-4 text-sm text-red-500 list-disc pl-5">
                    {errorsByCategory[category].map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubirExpediente;
