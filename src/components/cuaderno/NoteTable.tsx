// Placeholder for table-based alternative
import { useTable } from "@tanstack/react-table";
import { Note } from "@/lib/types/note";

interface NoteTableProps {
  notes: Note[];
}

export function NoteTable({ notes }: NoteTableProps) {
  // Implement table logic using TanStack Table
  // Columns: fecha, descripcion, categoria, responsable, nucleoEjecutor, ubicacion, condicionesClimaticas, avanceValorizado, valorGanado, archivos
  return <div>Tabla de anotaciones (implementar con TanStack Table)</div>;
}