"use client";
import { NoteForm } from "@/components/cuaderno/NoteForm";
import { ObraSelector } from "@/components/cuaderno/ObraSelector";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewNote() {
  const [selectedObraId, setSelectedObraId] = useState<number | null>(null);
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/cuaderno-obra");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nueva Anotación</h1>
      <ObraSelector onSelect={setSelectedObraId} selectedObraId={selectedObraId} />
      {selectedObraId && <NoteForm obraId={selectedObraId} onSuccess={handleSuccess} />}
    </div>
  );
}