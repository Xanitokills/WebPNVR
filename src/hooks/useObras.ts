import { useState, useEffect } from "react";
import { Convenio } from "@/components/cuaderno/ObraSelector";

export function useObras() {
  const [obras, setObras] = useState<Convenio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadObras = async () => {
      try {
        const response = await fetch("http://localhost:3003/api/groconvenios/convenios");
        if (!response.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        const data = await response.json();
        setObras(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar obras");
      } finally {
        setLoading(false);
      }
    };
    loadObras();
  }, []);

  return { obras, loading, error };
}