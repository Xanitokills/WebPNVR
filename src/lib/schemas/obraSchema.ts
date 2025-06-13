import { z } from "zod";

export const obraSchema = z.object({
  id_obra: z.number().min(1),
  nombre: z.string().nonempty("El nombre es obligatorio"),
  ubicacion: z.string().nonempty("La ubicación es obligatoria"),
  entidad: z.string().nonempty("La entidad es obligatoria"),
  presupuesto: z.number().optional(),
  plazo_ejecucion_dias: z.number().optional(),
  creado_en: z.string().nonempty("La fecha de creación es obligatoria"),
});