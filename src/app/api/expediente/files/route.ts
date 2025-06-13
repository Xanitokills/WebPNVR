import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

export async function GET(request: NextRequest) {
  const requiredEnvVars = {
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SERVER: process.env.DB_SERVER,
  };

  const missingEnvVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingEnvVars.length > 0) {
    return NextResponse.json(
      { error: `Missing required environment variables: ${missingEnvVars.join(", ")}` },
      { status: 500 }
    );
  }

  const config = {
    user: requiredEnvVars.DB_USER as string,
    password: requiredEnvVars.DB_PASSWORD as string,
    server: requiredEnvVars.DB_SERVER as string,
    database: "PNVR2",
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  let pool;

  try {
    // Get ConvenioId from query parameters
    const { searchParams } = new URL(request.url);
    const convenioId = searchParams.get("convenioId");

    if (!convenioId) {
      return NextResponse.json(
        { error: "ConvenioId is required." },
        { status: 400 }
      );
    }

    // Connect to SQL Server
    pool = await sql.connect(config);

    // Query to fetch files from ExpedienteTecnico
    const result = await pool
      .request()
      .input("Id_Convenio", sql.Int, parseInt(convenioId))
      .query(`
        SELECT 
          NombreArchivo,
          TipoArchivo,
          RutaArchivo,
          TamañoArchivo,
          Descripcion,
          FechaCarga,
          CreadoEn,
          ActualizadoEn,
          Categoria
        FROM [PNVR2].[dbo].[PNVR_ExpedienteTecnico]
        WHERE Id_Convenio = @Id_Convenio
        ORDER BY Categoria, NombreArchivo
      `);

    // Group files by Categoria
    const filesByCategory = result.recordset.reduce((acc, file) => {
      const category = file.Categoria || "Sin Categoría";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        NombreArchivo: file.NombreArchivo,
        TipoArchivo: file.TipoArchivo,
        RutaArchivo: file.RutaArchivo,
        TamañoArchivo: file.TamañoArchivo,
        Descripcion: file.Descripcion,
        FechaCarga: file.FechaCarga.toISOString(),
        CreadoEn: file.CreadoEn.toISOString(),
        ActualizadoEn: file.ActualizadoEn.toISOString(),
      });
      return acc;
    }, {} as { [key: string]: { NombreArchivo: string; TipoArchivo: string; RutaArchivo: string; TamañoArchivo: number; Descripcion: string; FechaCarga: string; CreadoEn: string; ActualizadoEn: string }[] });

    return NextResponse.json(filesByCategory, { status: 200 });
  } catch (error) {
    console.error("Error en la consulta GET:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener los archivos", details: error.message },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
