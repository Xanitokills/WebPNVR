import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import fs from "fs/promises";
import path from "path";

export async function GET() {
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
    database: "PNVR",
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  try {
    const pool = await sql.connect(configuracion);
    const result = await pool.request().query(`
      SELECT c.id_convocatoria
            ,c.titulo
            ,c.descripcion
            ,c.fecha_inicio
            ,c.fecha_fin
            ,c.vigencia
            ,c.word_file_path
            ,c.pdf_file_path
            ,c.pdfFile
            ,c.wordFile
            ,c.id_Estado_Convocatoria
            ,ec.descripcion AS estado_convocatoria
        FROM PNVR.dbo.Convocatorias c 
        INNER JOIN Estado_Convocatoria ec 
        ON c.id_Estado_Convocatoria = ec.id_estado_convocatoria
    `);
    return NextResponse.json(result.recordset);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "No se pudo obtener las convocatorias", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

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
    database: "PNVR",
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  try {
    const pool = await sql.connect(configuracion);

    const titulo = formData.get("titulo") as string;
    const descripcion = formData.get("descripcion") as string;
    const fecha_inicio = formData.get("fecha_inicio") as string;
    const fecha_fin = formData.get("fecha_fin") as string;
    const vigencia = formData.get("vigencia") ? parseInt(formData.get("vigencia") as string) : 1;
    const pdfFile = formData.get("pdfFile") as File | null;
    const wordFile = formData.get("wordFile") as File | null;

    // Directorio para guardar los archivos
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    let pdfFilePath = null;
    let wordFilePath = null;

    // Guardar PDF si existe
    if (pdfFile) {
      const pdfFileName = `${Date.now()}_${pdfFile.name}`;
      pdfFilePath = path.join("uploads", pdfFileName);
      const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
      await fs.writeFile(path.join(uploadDir, pdfFileName), pdfBuffer);
    }

    // Guardar Word si existe
    if (wordFile) {
      const wordFileName = `${Date.now()}_${wordFile.name}`;
      wordFilePath = path.join("uploads", wordFileName);
      const wordBuffer = Buffer.from(await wordFile.arrayBuffer());
      await fs.writeFile(path.join(uploadDir, wordFileName), wordBuffer);
    }

    const request = pool.request();
    request
      .input("titulo", sql.NVarChar(255), titulo)
      .input("descripcion", sql.NVarChar(1000), descripcion)
      .input("fecha_inicio", sql.Date, fecha_inicio)
      .input("fecha_fin", sql.Date, fecha_fin)
      .input("vigencia", sql.Int, vigencia)
      .input("pdf_file_path", sql.NVarChar(500), pdfFilePath)
      .input("word_file_path", sql.NVarChar(500), wordFilePath)
      .input("id_Estado_Convocatoria", sql.Int, 1); // Estado inicial: PENDIENTE-APROBACION (ID 1)

    const result = await request.query(
      "INSERT INTO [PNVR].[dbo].[Convocatorias] (titulo, descripcion, fecha_inicio, fecha_fin, vigencia, pdf_file_path, word_file_path, id_Estado_Convocatoria) OUTPUT INSERTED.* VALUES (@titulo, @descripcion, @fecha_inicio, @fecha_fin, @vigencia, @pdf_file_path, @word_file_path, @id_Estado_Convocatoria)"
    );

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "No se pudo crear la convocatoria", details: errorMessage },
      { status: 500 }
    );
  }
}