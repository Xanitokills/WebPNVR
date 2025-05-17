import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = parseInt(params.id);
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
      .input("id", sql.Int, id)
      .input("id_cargo", sql.Int, body.id_cargo || null)
      .input("nombre", sql.NVarChar(100), body.nombre)
      .input("Apellido_Paterno", sql.NVarChar(100), body.Apellido_Paterno)
      .input("Apellido_Materno", sql.NVarChar(100), body.Apellido_Materno)
      .input("dni", sql.NVarChar(20), body.dni)
      .input("celular", sql.NVarChar(20), body.celular)
      .input("correo", sql.NVarChar(100), body.correo)
      .input("profesion", sql.NVarChar(100), body.profesion)
      .query(`
        UPDATE [PNVR].[dbo].[Personal] 
        SET id_cargo = @id_cargo, nombre = @nombre, Apellido_Paterno = @Apellido_Paterno, 
            Apellido_Materno = @Apellido_Materno, dni = @dni, celular = @celular, 
            correo = @correo, profesion = @profesion 
        WHERE id_personal = @id
      `);
    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "Personal no encontrado" }, { status: 404 });
    }
    const updatedPersonal = {
      id_personal: id,
      id_cargo: body.id_cargo || null,
      nombre: body.nombre,
      Apellido_Paterno: body.Apellido_Paterno,
      Apellido_Materno: body.Apellido_Materno,
      dni: body.dni,
      celular: body.celular,
      correo: body.correo,
      profesion: body.profesion,
    };
    return NextResponse.json(updatedPersonal);
  } catch (error) {
    console.error("Error en la consulta PUT:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el personal", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = parseInt(params.id);

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
      .input("id", sql.Int, id)
      .query("DELETE FROM [PNVR].[dbo].[Personal] WHERE id_personal = @id");
    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "Personal no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ message: "Personal eliminado" });
  } catch (error) {
    console.error("Error en la consulta DELETE:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el personal", details: error.message },
      { status: 500 }
    );
  }
}