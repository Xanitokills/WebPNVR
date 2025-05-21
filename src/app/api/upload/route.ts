import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    // Ensure the uploads directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Parse the multipart/form-data request
    const formData = await request.formData();

    // Get the file and type from the form data
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    // Validate the inputs
    if (!file || !type) {
      return NextResponse.json({ error: "Archivo o tipo no proporcionado" }, { status: 400 });
    }

    if (type !== "pdf" && type !== "word") {
      return NextResponse.json({ error: "Tipo de archivo no válido. Use 'pdf' o 'word'" }, { status: 400 });
    }

    const fileExtension = type === "pdf" ? ".pdf" : ".docx";
    if (!file.name.endsWith(fileExtension)) {
      return NextResponse.json({ error: `El archivo debe ser un ${fileExtension.toUpperCase().slice(1)}` }, { status: 400 });
    }

    // Validate file size (10 MB limit)
    const maxFileSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxFileSize) {
      return NextResponse.json({ error: "El archivo excede el tamaño máximo de 10 MB" }, { status: 400 });
    }

    // Generate a unique filename
    const fileName = file.name || `file-${Date.now()}${fileExtension}`;
    const newPath = path.join(uploadDir, fileName);

    // Save the file to the server
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(newPath, Buffer.from(arrayBuffer));

    const filePath = `/uploads/${fileName}`;

    return NextResponse.json({ filePath }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al subir el archivo", details: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}