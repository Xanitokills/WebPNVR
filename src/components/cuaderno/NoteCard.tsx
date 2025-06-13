import { Note } from "@/lib/types/note";
import Link from "next/link";

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <Link href={`/cuaderno-obra/${note.id}`}>
      <div className="border rounded-lg p-4 shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition">
        <h3 className="font-semibold text-primary">{note.categoria}</h3>
        <p className="text-sm">Fecha: {note.fecha}</p>
        <p className="text-sm">Núcleo: {note.nucleoEjecutor}</p>
        <p className="text-sm truncate">{note.descripcion}</p>
        {note.archivos?.length && (
          <p className="text-xs text-gray-500">{note.archivos.length} archivo(s)</p>
        )}
      </div>
    </Link>
  );
}