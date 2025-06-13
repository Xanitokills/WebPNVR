export function calculateEarnedValue(
  avancePorcentaje: number,
  presupuestoAsignado: number
): number {
  return (avancePorcentaje / 100) * presupuestoAsignado;
}