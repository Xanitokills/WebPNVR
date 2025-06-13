"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Note } from "@/lib/types/note";
import { fetchNote } from "@/lib/api/notes";

export default function NoteDetail({ params }: { params: { id: string } }) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadNote = async () => {
      try {
        const data = await fetchNote(params.id);
        setNote(data);
      } catch (err) {
        setError("Error al cargar la anotación");
      } finally {
        setLoading(false);
      }
    };
    loadNote();
  }, [params.id]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!note) return <p>No se encontró la anotación</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Detalles de la Anotación</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <p><strong>Fecha:</strong> {note.fecha}</p>
        <p><strong>Categoría:</strong> {note.categoria}</p>
        <p><strong>Descripción:</strong> {note.descripcion}</p>
        <p><strong>Responsable:</strong> {note.responsable}</p>
        <p><strong>Núcleo Ejecutor:</strong> {note.nucleoEjecutor}</p>
        <p><strong>Ubicación:</strong> {note.ubicacion}</p>
        <p><strong>Condiciones Climáticas:</strong> {note.condicionesClimaticas}</p>
        {note.avanceValorizado && <p><strong>Avance Valorizado:</strong> S/ {note.avanceValorizado.toLocaleString()}</p>}
        {note.valorGanado && <p><strong>Valor Ganado:</strong> S/ {note.valorGanado.toLocaleString()}</p>}
        {note.archivos?.length && (
          <div>
            <p><strong>Archivos:</strong></p>
            <ul>
              {note.archivos.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <button
        onClick={() => router.push("/cuaderno-obra")}
        className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-blue-700"
      >
        Volver
      </button>
    </div>
  );
}