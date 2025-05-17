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
      .query(`
        SELECT p.id_personal, c.id_cargo, c.descripcion, p.nombre, p.Apellido_Paterno, 
               p.Apellido_Materno, p.dni, p.celular, p.correo, p.profesion 
        FROM Personal p 
        LEFT JOIN Cargo c ON p.id_cargo = c.id_cargo
      `);
    return NextResponse.json(resultado.recordset);
  } catch (error) {
    console.error("Error en la consulta GET:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener los datos del personal", details: error.message },
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
      .input("id_cargo", sql.Int, body.id_cargo || null)
      .input("nombre", sql.NVarChar(100), body.nombre)
      .input("Apellido_Paterno", sql.NVarChar(100), body.Apellido_Paterno)
      .input("Apellido_Materno", sql.NVarChar(100), body.Apellido_Materno)
      .input("dni", sql.NVarChar(20), body.dni)
      .input("celular", sql.NVarChar(20), body.celular)
      .input("correo", sql.NVarChar(100), body.correo)
      .input("profesion", sql.NVarChar(100), body.profesion)
      .query(`
        INSERT INTO [PNVR].[dbo].[Personal] 
        (id_cargo, nombre, Apellido_Paterno, Apellido_Materno, dni, celular, correo, profesion) 
        VALUES (@id_cargo, @nombre, @Apellido_Paterno, @Apellido_Materno, @dni, @celular, @correo, @profesion); 
        SELECT SCOPE_IDENTITY() as id_personal
      `);
    const newId = result.recordset[0].id_personal;
    const newPersonal = {
      id_personal: newId,
      id_cargo: body.id_cargo || null,
      nombre: body.nombre,
      Apellido_Paterno: body.Apellido_Paterno,
      Apellido_Materno: body.Apellido_Materno,
      dni: body.dni,
      celular: body.celular,
      correo: body.correo,
      profesion: body.profesion,
    };
    return NextResponse.json(newPersonal, { status: 201 });
  } catch (error) {
    console.error("Error en la consulta POST:", error);
    return NextResponse.json(
      { error: "No se pudo crear el personal", details: error.message },
      { status: 500 }
    );
  }
}