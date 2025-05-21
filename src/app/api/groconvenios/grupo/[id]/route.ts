import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = parseInt(params.id); // Corrección: eliminar join, usar directamente params.id
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
      .input("nombre", sql.NVarChar(100), body.nombre)
      .input("estado", sql.Int, body.estado !== undefined ? body.estado : null)
      .query(
        "UPDATE [PNVR].[dbo].[Grupo] SET nombre = @nombre, estado = @estado WHERE id_grupo = @id"
      );
    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
    }
    const updatedGrupo = { id_grupo: id, nombre: body.nombre, estado: body.estado || null };
    return NextResponse.json(updatedGrupo);
  } catch (error) {
    console.error("Error en la consulta PUT:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el grupo", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = parseInt(params.id); // Corrección: eliminar join, usar directamente params.id

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
      .query("DELETE FROM [PNVR].[dbo].[Grupo] WHERE id_grupo = @id");
    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ message: "Grupo eliminado" });
  } catch (error) {
    console.error("Error en la consulta DELETE:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el grupo", details: error.message },
      { status: 500 }
    );
  }
}