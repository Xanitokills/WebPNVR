import { Obra } from "@/lib/types/obra";

export async function fetchObras(): Promise<Obra[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/obras`);
  if (!res.ok) throw new Error("Error al cargar obras");
  return res.json();
}