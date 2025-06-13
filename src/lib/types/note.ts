export interface Note {
  id: string;
  obraId: number;
  fecha: string;
  descripcion: string;
  categoria: "Avance" | "Incidencia" | "Observación" | "Condiciones Climáticas" | "Visita" | "Reunión";
  responsable: string;
  nucleoEjecutor: string;
  ubicacion: string;
  condicionesClimaticas: "Soleado" | "Lluvioso" | "Nublado" | "Ventoso";
  avanceValorizado?: number;
  valorGanado?: number;
  archivos?: File[];
}