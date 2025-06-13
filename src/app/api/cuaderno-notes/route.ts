import { NextResponse } from "next/server";
import { Note } from "@/lib/types/note";

let notes: Note[] = []; // Mock storage (replace with DB)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const obraId = searchParams.get("obraId");
  const filteredNotes = obraId ? notes.filter((note) => note.obraId === Number(obraId)) : notes;
  return NextResponse.json(filteredNotes);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const note: Note = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    obraId: Number(formData.get("obraId")),
    fecha: formData.get("fecha") as string,
    descripcion: formData.get("descripcion") as string,
    categoria: formData.get("categoria") as string,
    responsable: formData.get("responsable") as string,
    nucleoEjecutor: formData.get("nucleoEjecutor") as string,
    ubicacion: formData.get("ubicacion") as string,
    condicionesClimaticas: formData.get("condicionesClimaticas") as string,
    avanceValorizado: formData.get("avanceValorizado") ? Number(formData.get("avanceValorizado")) : undefined,
    valorGanado: formData.get("valorGanado") ? Number(formData.get("valorGanado")) : undefined,
    archivos: formData.getAll("archivos") as any, // Handle files in production with S3 or similar
  };
  notes.push(note);
  return NextResponse.json(note, { status: 201 });
}