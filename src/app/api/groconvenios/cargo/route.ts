import { NextResponse } from "next/server";
import sql from "mssql";
import dotenv from "dotenv";

// Carga las variables de entorno desde el archivo .env
dotenv.config();

export async function GET() {
  const variablesRequeridas = {
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SERVER: process.env.DB_SERVER,
    DB_NAME: process.env.DB_NAME, // Agregamos DB_NAME
  };

  const variablesFaltantes = Object.entries(variablesRequeridas)
    .filter(([, valor]) => !valor)
    .map(([clave]) => clave);

  if (variablesFaltantes.length > 0) {
    return NextResponse.json(
      {
        error: `Faltan las siguientes variables de entorno: ${variablesFaltantes.join(", ")}`,
      },
      { status: 500 }
    );
  }

  const configuracion = {
    user: variablesRequeridas.DB_USER as string,
    password: variablesRequeridas.DB_PASSWORD as string,
    server: variablesRequeridas.DB_SERVER as string,
    database: variablesRequeridas.DB_NAME as string, // Usamos DB_NAME del .env
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  try {
    const pool = await sql.connect(configuracion);
    const result = await pool
      .request()
      .query("SELECT id_cargo, descripcion FROM Cargo");
    return NextResponse.json(result.recordset);
  } catch (error: any) {
    console.error("Error en la consulta GET:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener los cargos", details: error.message },
      { status: 500 }
    );
  }
}