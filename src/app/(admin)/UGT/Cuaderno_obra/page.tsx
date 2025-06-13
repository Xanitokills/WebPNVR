"use client";
import { useState } from "react";
import { NoteCard } from "@/components/cuaderno/NoteCard";
import { ObraSelector } from "@/components/cuaderno/ObraSelector";
import { useNotes } from "@/hooks/useNotes";
import { Note } from "@/lib/types/note";
import { Modal } from "@/components/ui/modal"; // Corrección de la ruta (eliminado /index)
import { NoteForm } from "@/components/cuaderno/NoteForm";

export default function CuadernoObra() {
  const [selectedObraId, setSelectedObraId] = useState<string | null>(null); // Usando string para CONVENIO_ID
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { notes, loading, error } = useNotes(selectedObraId);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cuaderno de Obra</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700"
          disabled={!selectedObraId}
        >
          Nueva Anotación
        </button>
      </div>
      <ObraSelector onSelect={setSelectedObraId} selectedObraId={selectedObraId} />
      {loading && <p className="text-gray-500">Cargando anotaciones...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {notes.map((note: Note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm obraId={selectedObraId!} onSuccess={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
}