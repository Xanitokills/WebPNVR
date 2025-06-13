export interface Obra {
  id_obra: number;
  nombre: string;
  ubicacion: string;
  entidad: string;
  presupuesto: number | null;
  plazo_ejecucion_dias: number | null;
  creado_en: string;
}