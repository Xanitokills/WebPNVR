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
      .query("SELECT id_tipo_fenomeno, descripcion, estado FROM [dbo].[Tipo_Fenomeno]");
    return NextResponse.json(resultado.recordset);
  } catch (error) {
    console.error("Error en la consulta GET:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "No se pudieron obtener los datos de los tipos de fenómeno", details: errorMessage },
      { status: errorMessage.includes("Faltan las siguientes variables") ? 400 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate descripcion
    if (!body.descripcion || typeof body.descripcion !== "string" || body.descripcion.trim() === "") {
      return NextResponse.json(
        { error: "La descripción es requerida y no puede estar vacía." },
        { status: 400 }
      );
    }

    // Validate estado if provided
    if (body.estado !== undefined && !Number.isInteger(body.estado)) {
      return NextResponse.json(
        { error: "El estado debe ser un número entero." },
        { status: 400 }
      );
    }

    const configuracion = getDbConfig();
    const pool = await sql.connect(configuracion);
    const result = await pool
      .request()
      .input("descripcion", sql.NVarChar(100), body.descripcion)
      .input("estado", sql.Int, body.estado !== undefined ? body.estado : null)
      .query(
        "INSERT INTO [dbo].[Tipo_Fenomeno] (descripcion, estado) VALUES (@descripcion, @estado); SELECT SCOPE_IDENTITY() as id_tipo_fenomeno"
      );

    const newId = result.recordset[0].id_tipo_fenomeno;
    const newTipoFenomeno = {
      id_tipo_fenomeno: newId,
      descripcion: body.descripcion,
      estado: body.estado !== undefined ? body.estado : null,
    };
    return NextResponse.json(newTipoFenomeno, { status: 201 });
  } catch (error) {
    console.error("Error en la consulta POST:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "No se pudo crear el tipo de fenómeno", details: errorMessage },
      { status: errorMessage.includes("Faltan las siguientes variables") ? 400 : 500 }
    );
  }
}