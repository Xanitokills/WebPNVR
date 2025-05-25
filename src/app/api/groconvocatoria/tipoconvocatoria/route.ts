import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

// Configuración compartida para las variables de entorno
const getDbConfig = () => {
  const requiredVars = {
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SERVER: process.env.DB_SERVER,
    DB_NAME: process.env.DB_NAME,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Faltan las siguientes variables de entorno: ${missingVars.join(", ")}`);
  }

  return {
    user: requiredVars.DB_USER as string,
    password: requiredVars.DB_PASSWORD as string,
    server: requiredVars.DB_SERVER as string,
    database: requiredVars.DB_NAME as string,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
};

export async function GET() {
  try {
    const config = getDbConfig();
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query("SELECT id_tipo, nombre, descripcion, estado FROM [dbo].[tipo_convocatoria]");
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error en la consulta GET:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "No se pudieron obtener los datos de los tipos de item convocatoria", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = getDbConfig();
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("descripcion", sql.NVarChar(100), body.descripcion)
      .input("estado", sql.Int, body.estado ?? null)
      .query(
        "INSERT INTO [dbo].[tipo_convocatoria] (descripcion, estado) VALUES (@descripcion, @estado); SELECT SCOPE_IDENTITY() as id_tipo"
      );

    const newId = result.recordset[0].id_tipo;
    const newTipoItemConvocatoria = {
      id_tipo: newId,
      descripcion: body.descripcion,
      estado: body.estado ?? null,
    };
    return NextResponse.json(newTipoItemConvocatoria, { status: 201 });
  } catch (error) {
    console.error("Error en la consulta POST:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "No se pudo crear el tipo de item convocatoria", details: errorMessage },
      { status: 500 }
    );
  }
}