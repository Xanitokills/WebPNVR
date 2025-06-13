"use client";
import { useState } from "react";
import { useNotes } from "@/hooks/useNotes";
import { calculateEarnedValue } from "@/lib/utils/calculateEarnedValue";
import { ObraSelector } from "@/components/cuaderno/ObraSelector";

export default function Reportes() {
  const [selectedObraId, setSelectedObraId] = useState<number | null>(null);
  const { notes } = useNotes(selectedObraId);

  const totalEarnedValue = notes.reduce((sum, note) => sum + (note.valorGanado || 0), 0);
  const totalValorizedProgress = notes.reduce((sum, note) => sum + (note.avanceValorizado || 0), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Reportes</h1>
      <ObraSelector onSelect={setSelectedObraId} selectedObraId={selectedObraId} />
      {selectedObraId && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Resumen</h2>
          <p><strong>Valor Ganado Total:</strong> S/ {totalEarnedValue.toLocaleString()}</p>
          <p><strong>Avance Valorizado Total:</strong> S/ {totalValorizedProgress.toLocaleString()}</p>
          <h3 className="text-lg font-semibold mt-4">Anotaciones por Núcleo Ejecutor</h3>
          <ul>
            {Array.from(new Set(notes.map((note) => note.nucleoEjecutor))).map((nucleo) => {
              const nucleoNotes = notes.filter((note) => note.nucleoEjecutor === nucleo);
              const nucleoEarnedValue = nucleoNotes.reduce((sum, note) => sum + (note.valorGanado || 0), 0);
              return (
                <li key={nucleo}>
                  {nucleo}: S/ {nucleoEarnedValue.toLocaleString()}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}