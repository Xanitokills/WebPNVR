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
    const result = await pool
      .request()
      .query("SELECT * FROM [PNVR].[dbo].[Convocatorias]");
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
      .input("titulo", sql.NVarChar(255), body.titulo)
      .input("descripcion", sql.NVarChar(1000), body.descripcion)
      .input("fecha_inicio", sql.Date, body.fecha_inicio)
      .input("fecha_fin", sql.Date, body.fecha_fin)
      .input("estado", sql.Int, body.estado)
      .query(
        "INSERT INTO [PNVR].[dbo].[Convocatorias] (titulo, descripcion, fecha_inicio, fecha_fin, estado) OUTPUT INSERTED.* VALUES (@titulo, @descripcion, @fecha_inicio, @fecha_fin, @estado)"
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