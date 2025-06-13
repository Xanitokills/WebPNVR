import { z } from "zod";

export const noteSchema = z.object({
  obraId: z.number().min(1, "Selecciona una obra"),
  fecha: z.string().nonempty("La fecha es obligatoria"),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  categoria: z.enum(["Avance", "Incidencia", "Observación", "Condiciones Climáticas", "Visita", "Reunión"]),
  responsable: z.string().nonempty("El responsable es obligatorio"),
  nucleoEjecutor: z.string().nonempty("El núcleo ejecutor es obligatorio"),
  ubicacion: z.string().nonempty("La ubicación es obligatoria"),
  condicionesClimaticas: z.enum(["Soleado", "Lluvioso", "Nublado", "Ventoso"]),
  avanceValorizado: z.number().optional(),
  valorGanado: z.number().optional(),
  archivos: z.array(z.any()).max(5, "Máximo 5 archivos").optional(),
});