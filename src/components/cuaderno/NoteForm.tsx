"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { noteSchema } from "@/lib/schemas/noteSchema";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/cuaderno/FileUpload";
import { createNote } from "@/lib/api/notes";
import { z } from "zod";
import { useState } from "react";

interface NoteFormProps {
  obraId: number;
  onSuccess: () => void;
}

export function NoteForm({ obraId, onSuccess }: NoteFormProps) {
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      obraId,
      fecha: new Date().toISOString().split("T")[0],
      categoria: "Avance",
      condicionesClimaticas: "Soleado",
    },
  });

  const onSubmit = async (data: z.infer<typeof noteSchema>) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value.toString());
      });
      files.forEach((file) => formData.append("archivos", file));
      await createNote(formData);
      onSuccess();
    } catch (err) {
      setError("root", { message: "Error al guardar la anotación" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Fecha"
        type="date"
        {...register("fecha")}
        error={errors.fecha?.message}
      />
      <Textarea
        label="Descripción"
        {...register("descripcion")}
        error={errors.descripcion?.message}
      />
      <Select
        label="Categoría"
        {...register("categoria")}
        error={errors.categoria?.message}
        options={[
          { value: "Avance", label: "Avance" },
          { value: "Incidencia", label: "Incidencia" },
          { value: "Observación", label: "Observación" },
          { value: "Condiciones Climáticas", label: "Condiciones Climáticas" },
          { value: "Visita", label: "Visita de Supervisión" },
          { value: "Reunión", label: "Reunión" },
        ]}
      />
      <Input
        label="Responsable"
        {...register("responsable")}
        error={errors.responsable?.message}
      />
      <Input
        label="Núcleo Ejecutor"
        {...register("nucleoEjecutor")}
        error={errors.nucleoEjecutor?.message}
      />
      <Input
        label="Ubicación"
        {...register("ubicacion")}
        error={errors.ubicacion?.message}
      />
      <Select
        label="Condiciones Climáticas"
        {...register("condicionesClimaticas")}
        error={errors.condicionesClimaticas?.message}
        options={[
          { value: "Soleado", label: "Soleado" },
          { value: "Lluvioso", label: "Lluvioso" },
          { value: "Nublado", label: "Nublado" },
          { value: "Ventoso", label: "Ventoso" },
        ]}
      />
      <Input
        label="Avance Valorizado (opcional)"
        type="number"
        {...register("avanceValorizado", { valueAsNumber: true })}
        error={errors.avanceValorizado?.message}
      />
      <Input
        label="Valor Ganado (opcional)"
        type="number"
        {...register("valorGanado", { valueAsNumber: true })}
        error={errors.valorGanado?.message}
      />
      <FileUpload
        onFilesChange={setFiles}
        files={files}
        error={errors.archivos?.message}
      />
      {errors.root && <p className="text-red-500">{errors.root.message}</p>}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="danger" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Guardar
        </Button>
      </div>
    </form>
  );
}