'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../ui/table';

interface BeneficiarioDetails {
  OBJECTID: number;
  Departamento: string;
  Provincia: string;
  Distrito: string;
  'Centro Poblado': string;
  Ubigeo: string;
  'Ubigeo CP': string;
  Comunidad: string;
  'Prioridad (1)': string;
  'Prioridad (2)': string;
  'Número de Convenio': string;
  'Nombre de Proyecto': string;
  'Codigo UGT': string;
  Agrupación: string;
  'Año Intervención': string;
  'Tipo Fenómeno': string;
  'Tipo Material': string;
  'Tipo de Intervención': string;
  ID_Usuario: number;
  Nombre: string;
  Ape_Paterno: string;
  Ape_Materno: string;
  DNI: string;
  CUV: string;
  Sexo: string;
  'Fecha de Nacimiento': string;
  edad: number;
  'Número de Miembros': number;
  'Estado Sit# vivienda': string;
  'Sub Estado': string;
  'Fecha de Inicio': string;
  'Fecha de Termino': string;
  'Año Culminación vivienda': string;
  latitud: number;
  longitud: number;
  altitud: number;
  'ID SSP': number;
  Documento: string;
  Modalidad: string;
  observaciones_1: string;
  observaciones_2: string;
  Fuente: string;
  fech_actual: string;
  ID_Deductivos: number;
  'Programación Linea Base 2': string;
  'Paquete Programadas': string;
  Reprogramación: string;
  Cartera: string;
  Tipo: string;
  'Programación Linea Base 1': string;
  Sectoristas: string;
  'Fecha Inicio Proyectada': string;
  'Fecha Termino Proyectada': string;
  'Transferencia PNVR': string;
  'Aporte del beneficiario': string;
  'Costo Total': string;
  'Monto Liquidacion': string;
  calculo: string;
}

export default function BeneficiariosTable({ numeroConvenio }: { numeroConvenio: string }) {
  const [data, setData] = useState<BeneficiarioDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBeneficiario, setSelectedBeneficiario] = useState<BeneficiarioDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [editFormData, setEditFormData] = useState<Partial<BeneficiarioDetails>>({});
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  useEffect(() => {
    async function fetchBeneficiarios() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003'}/api/beneficiarios/${numeroConvenio}`,
          {
            cache: 'no-store',
          }
        );
        if (!response.ok) {
          throw new Error(`Error al obtener los datos: ${response.statusText}`);
        }
        const result = await response.json();
        console.log('Datos recibidos:', result);
        setData(result as BeneficiarioDetails[]);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('Error en fetchBeneficiarios:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    fetchBeneficiarios();
  }, [numeroConvenio]);

  const openModal = (beneficiario: BeneficiarioDetails, action: 'view' | 'edit') => {
    setSelectedBeneficiario(beneficiario);
    setModalMode(action);
    if (action === 'edit') {
      setEditFormData(beneficiario);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBeneficiario(null);
    setModalMode('view');
    setEditFormData({});
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof BeneficiarioDetails) => {
    let value: string | number = e.target.value;
    // Convertir a número si el campo es de tipo float
    if (
      [
        'OBJECTID',
        'Prioridad (1)',
        'Prioridad (2)',
        'ID_Usuario',
        'edad',
        'Número de Miembros',
        'latitud',
        'longitud',
        'altitud',
        'ID SSP',
        'ID_Deductivos',
      ].includes(field)
    ) {
      value = value ? parseFloat(value) : 0;
    }
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast({ message: '', visible: false });
    }, 3000); // El toast desaparece después de 3 segundos
  };

  const handleSave = async () => {
    if (!selectedBeneficiario) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003'}/api/beneficiarios/${numeroConvenio}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            OBJECTID: selectedBeneficiario.OBJECTID,
            ...editFormData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al actualizar el beneficiario');
      }

      // Actualizar los datos en el estado local
      setData((prevData) =>
        prevData.map((item) =>
          item.OBJECTID === selectedBeneficiario.OBJECTID ? { ...item, ...editFormData } : item
        )
      );
      closeModal();
      showToast('¡Beneficiario actualizado con éxito!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error al guardar los cambios:', errorMessage);
      alert('Error al guardar los cambios: ' + errorMessage);
    }
  };

  if (loading) return <div>Cargando beneficiarios...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data || data.length === 0) return <div>No se encontraron beneficiarios.</div>;

  return (
    <div>
      {/* Toast */}
      {toast.visible && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Departamento
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Provincia
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Distrito
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Centro Poblado
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
                    Ape. Paterno
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Ape. Materno
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    DNI
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Sexo
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Estado Sit. Vivienda
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
                {data.map((beneficiario: BeneficiarioDetails, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                      {beneficiario.Departamento}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {beneficiario.Provincia}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {beneficiario.Distrito}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {beneficiario['Centro Poblado']}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {beneficiario.Nombre}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {beneficiario.Ape_Paterno}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {beneficiario.Ape_Materno}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {beneficiario.DNI}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {beneficiario.Sexo}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {beneficiario['Estado Sit# vivienda']}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <button
                        onClick={() => openModal(beneficiario, 'view')}
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
                        onClick={() => openModal(beneficiario, 'edit')}
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedBeneficiario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl overflow-y-auto max-h-[80vh]">
            <h2 className="text-xl font-bold mb-4">
              {selectedBeneficiario.Nombre} {selectedBeneficiario.Ape_Paterno} {selectedBeneficiario.Ape_Materno}
              {selectedBeneficiario.DNI && ` (DNI: ${selectedBeneficiario.DNI})`}
            </h2>
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ×
            </button>
            <div className="grid grid-cols-1 gap-4">
              {modalMode === 'view' ? (
                // Modo Ver: Mostrar datos como texto
                Object.entries(selectedBeneficiario).map(([key, value]) => (
                  <div key={key}>
                    <label className="font-medium text-gray-700 dark:text-gray-300">{key.replace(/#/g, ' # ')}:</label>
                    <p className="text-gray-900 dark:text-gray-100 break-words">
                      {value === null || value === undefined ? 'N/A' : String(value)}
                    </p>
                  </div>
                ))
              ) : (
                // Modo Editar: Mostrar campos editables
                Object.entries(selectedBeneficiario).map(([key, value]) => (
                  <div key={key}>
                    <label className="font-medium text-gray-700 dark:text-gray-300">{key.replace(/#/g, ' # ')}:</label>
                    <input
                      type={
                        ['Fecha de Nacimiento', 'Fecha de Inicio', 'Fecha de Termino', 'fech_actual'].includes(key)
                          ? 'datetime-local'
                          : ['OBJECTID', 'Prioridad (1)', 'Prioridad (2)', 'ID_Usuario', 'edad', 'Número de Miembros', 'latitud', 'longitud', 'altitud', 'ID SSP', 'ID_Deductivos'].includes(key)
                          ? 'number'
                          : 'text'
                      }
                      value={
                        editFormData[key as keyof BeneficiarioDetails] !== undefined
                          ? String(editFormData[key as keyof BeneficiarioDetails])
                          : value === null || value === undefined
                          ? ''
                          : String(value)
                      }
                      onChange={(e) => handleInputChange(e, key as keyof BeneficiarioDetails)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              {modalMode === 'edit' && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
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