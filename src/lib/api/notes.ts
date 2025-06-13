import { Note } from "@/lib/types/note";

export async function fetchNotes(obraId: number | null): Promise<Note[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/notes`);
  if (obraId) url.searchParams.append("obraId", obraId.toString());
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al cargar anotaciones");
  return res.json();
}

export async function fetchNote(id: string): Promise<Note> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${id}`);
  if (!res.ok) throw new Error("Error al cargar la anotación");
  return res.json();
}

export async function createNote(formData: FormData): Promise<Note> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Error al crear la anotación");
  return res.json();
}