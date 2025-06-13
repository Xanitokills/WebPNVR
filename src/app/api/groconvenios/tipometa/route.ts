import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

// Function to validate and retrieve environment variables
function getDbConfig() {
  const variablesRequeridas = {
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SERVER: process.env.DB_SERVER,
    DB_NAME: process.env.DB_NAME,
  };

  const variablesFaltantes = Object.entries(variablesRequeridas)
    .filter(([, valor]) => !valor)
    .map(([clave]) => clave);

  if (variablesFaltantes.length > 0) {
    throw new Error(`Faltan las siguientes variables de entorno: ${variablesFaltantes.join(", ")}`);
  }

  return {
    user: variablesRequeridas.DB_USER as string,
    password: variablesRequeridas.DB_PASSWORD as string,
    server: variablesRequeridas.DB_SERVER as string,
    database: variablesRequeridas.DB_NAME as string,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
}

export async function GET() {
  try {
    const configuracion = getDbConfig();
    const pool = await sql.connect(configuracion);
    const resultado = await pool
      .request()
      .query("SELECT * FROM [dbo].[PNVR_Tipos_Meta]");
    return NextResponse.json(resultado.recordset);
  } catch (error) {
    console.error("Error en la consulta GET:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener los datos de los tipos de meta", details: error.message },
      { status: error.message.includes("Faltan las siguientes variables") ? 400 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const configuracion = getDbConfig();

    // Validar que los campos requeridos estén presentes y no vacíos
    if (!body.descripcion || typeof body.descripcion !== "string" || body.descripcion.trim() === "") {
      return NextResponse.json(
        { error: "La descripción es requerida y no puede estar vacía." },
        { status: 400 }
      );
    }

    const pool = await sql.connect(configuracion);
    const result = await pool
      .request()
      .input("descripcion", sql.NVarChar(255), body.descripcion)
      .query(
        "INSERT INTO [dbo].[PNVR_Tipos_Meta] (descripcion) VALUES (@descripcion); SELECT SCOPE_IDENTITY() as id_Tipo_Meta"
      );
    const newId = result.recordset[0].id_Tipo_Meta;
    const newTipoMeta = { id_Tipo_Meta: newId, descripcion: body.descripcion };
    return NextResponse.json(newTipoMeta, { status: 201 });
  } catch (error) {
    console.error("Error en la consulta POST:", error);
    return NextResponse.json(
      { error: "No se pudo crear el tipo de meta", details: error.message },
      { status: error.message.includes("Faltan las siguientes variables") ? 400 : 500 }
    );
  }
}