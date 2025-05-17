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
      .query("SELECT * FROM [PNVR].[dbo].[Tipos_Meta]");
    return NextResponse.json(resultado.recordset);
  } catch (error) {
    console.error("Error en la consulta GET:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener los datos de los tipos de meta", details: error.message },
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
      .input("descripcion", sql.NVarChar(255), body.descripcion)
      .query(
        "INSERT INTO [PNVR].[dbo].[Tipos_Meta] (descripcion) VALUES (@descripcion); SELECT SCOPE_IDENTITY() as id_Tipo_Meta"
      );
    const newId = result.recordset[0].id_Tipo_Meta;
    const newTipoMeta = { id_Tipo_Meta: newId, descripcion: body.descripcion };
    return NextResponse.json(newTipoMeta, { status: 201 });
  } catch (error) {
    console.error("Error en la consulta POST:", error);
    return NextResponse.json(
      { error: "No se pudo crear el tipo de meta", details: error.message },
      { status: 500 }
    );
  }
}