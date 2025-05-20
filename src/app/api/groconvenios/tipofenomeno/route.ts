import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

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
    const resultado = await pool
      .request()
      .query("SELECT id_tipo_fenomeno, descripcion,estado FROM [PNVR].[dbo].[Tipo_Fenomeno]");
    return NextResponse.json(resultado.recordset);
  } catch (error) {
    console.error("Error en la consulta GET:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener los datos de los tipos de fenómeno", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

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
    const result = await pool
      .request()
      .input("descripcion", sql.NVarChar(100), body.descripcion)
      .input("estado", sql.Int, body.estado || null)
      .query(
        "INSERT INTO [PNVR].[dbo].[Tipo_Fenomeno] (descripcion, estado) VALUES (@descripcion, @estado); SELECT SCOPE_IDENTITY() as id_tipo_fenomeno"
      );
    const newId = result.recordset[0].id_tipo_fenomeno;
    const newTipoFenomeno = {
      id_tipo_fenomeno: newId,
      descripcion: body.descripcion,
      estado: body.estado || null,
    };
    return NextResponse.json(newTipoFenomeno, { status: 201 });
  } catch (error) {
    console.error("Error en la consulta POST:", error);
    return NextResponse.json(
      { error: "No se pudo crear el tipo de fenómeno", details: error.message },
      { status: 500 }
    );
  }
}