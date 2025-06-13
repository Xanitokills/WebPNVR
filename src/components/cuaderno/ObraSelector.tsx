"use client";
import { useObras } from "@/hooks/useObras";
import { Select } from "@/components/ui/Select";

export interface Convenio {
  CONVENIO_ID: string;
  CODIGO_CONVENIO: string;
  // Agrega otros campos si los necesitas (e.g., FECHA_CONVENIO, DEPARTAMENTO)
}

interface ObraSelectorProps {
  selectedObraId: string | null; // Coincide con CONVENIO_ID
  onSelect: (id: string | null) => void;
}

export function ObraSelector({ selectedObraId, onSelect }: ObraSelectorProps) {
  const { obras, loading, error } = useObras();

  if (loading) return <p>Cargando convenios...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <Select
      label="Selecciona un Convenio"
      value={selectedObraId || ""}
      onChange={(e) => onSelect(e.target.value || null)}
      options={[
        { value: "", label: "Selecciona un convenio" },
        ...obras.map((convenio: Convenio) => ({
          value: convenio.CONVENIO_ID,
          label: `${convenio.CODIGO_CONVENIO} (ID: ${convenio.CONVENIO_ID})`,
        })),
      ]}
    />
  );
}