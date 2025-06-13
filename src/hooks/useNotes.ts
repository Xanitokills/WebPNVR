import { useState, useEffect } from "react";
import { Note } from "@/lib/types/note";
import { fetchNotes } from "@/lib/api/notes";
import { getFromLocalStorage } from "@/lib/utils/localStorage";

export function useNotes(obraId: number | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const localNotes = getFromLocalStorage<Note[]>("notes") || [];
        if (!navigator.onLine) {
          setNotes(localNotes);
          return;
        }
        const remoteNotes = await fetchNotes(obraId);
        setNotes(remoteNotes);
      } catch (err) {
        setError("Error al cargar anotaciones");
      } finally {
        setLoading(false);
      }
    };
    loadNotes();
  }, [obraId]);

  return { notes, loading, error };
}