
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import path from "path";
import fs from "fs/promises";

export async function POST(request: NextRequest) {
  const variablesRequeridas = {
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SERVER: process.env.DB_SERVER,
  };

  const variablesFaltantes = Object.entries(variablesRequeridas)
    .filter(([, valor]) => !valor)
    .map(([clave]) => clave);

  if (variablesFaltantes.length > 0) {
    return NextResponse.json(
      { error: `Faltan las siguientes variables de entorno: ${variablesFaltantes.join(", ")}` },
      { status: 500 }
    );
  }

  const configuracion = {
    user: variablesRequeridas.DB_USER as string,
    password: variablesRequeridas.DB_PASSWORD as string,
    server: variablesRequeridas.DB_SERVER as string,
    database: "PNVR2",
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  let pool;

  try {
    // Parse form data
    const formData = await request.formData();
    const category = formData.get("category") as string;
    const convenioId = formData.get("id_convenio") as string;

    if (!category || !convenioId) {
      return NextResponse.json(
        { error: "Category and ConvenioId are required." },
        { status: 400 }
      );
    }

    // Connect to SQL Server
    pool = await sql.connect(configuracion);

    const files = formData.entries();
    const uploadedFiles: string[] = [];

    for (const [key, value] of files) {
      if (key.startsWith("file-") && value instanceof File) {
        const file = value as File;
        const fileName = file.name;
        const fileExtension = fileName.split(".").pop()?.toLowerCase();

        // Validate file type (Word, Excel, PDF only)
        const allowedTypes = ["doc", "docx", "xlsx", "xls", "pdf"];
        if (!fileExtension || !allowedTypes.includes(fileExtension)) {
          return NextResponse.json(
            { error: `Tipo de archivo no permitido: ${fileName}. Solo se permiten Word, Excel y PDF.` },
            { status: 400 }
          );
        }

        const fileType =
          fileExtension === "pdf"
            ? "PDF"
            : fileExtension === "xlsx" || fileExtension === "xls"
            ? "Excel"
            : "Word";
        const fileSize = file.size / 1024; // Convert to KB

        // Define the file path for storage
        const categoryFolder = category.replace(/[^a-zA-Z0-9]/g, "_"); // Sanitize category name
        const uploadDir = path.join(process.cwd(), "public", "Expedientes", categoryFolder);
        const filePath = path.join(uploadDir, fileName);
        const relativeFilePath = `/Expedientes/${categoryFolder}/${fileName}`; // Path for DB

        // Create directory if it doesn't exist
        await fs.mkdir(uploadDir, { recursive: true });

        // Save the file to the filesystem
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(filePath, buffer);

        uploadedFiles.push(fileName);

        const description = `Archivo subido para ${category}`;

        // Insert into ExpedienteTecnico table
        await pool
          .request()
          .input("ConvenioId", sql.Int, parseInt(convenioId))
          .input("NombreArchivo", sql.NVarChar, fileName)
          .input("TipoArchivo", sql.NVarChar, fileType)
          .input("RutaArchivo", sql.NVarChar, relativeFilePath)
          .input("TamañoArchivo", sql.Decimal(18, 2), fileSize)
          .input("Descripcion", sql.NVarChar, description)
          .input("Categoria", sql.NVarChar, category)
          .input("FechaCarga", sql.DateTime, new Date())
          .query(`
            INSERT INTO [PNVR2].[dbo].[ExpedienteTecnico] 
            (id_convenio, NombreArchivo, TipoArchivo, RutaArchivo, TamañoArchivo, Descripcion, Categoria, FechaCarga)
            VALUES (@ConvenioId, @NombreArchivo, @TipoArchivo, @RutaArchivo, @TamañoArchivo, @Descripcion, @Categoria, @FechaCarga)
          `);
      }
    }

    return NextResponse.json(
      { success: true, uploadedFiles },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en la consulta POST:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los archivos", details: error.message },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
