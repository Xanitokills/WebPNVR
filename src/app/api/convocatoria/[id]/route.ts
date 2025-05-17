import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = parseInt(params.id);
  const body = await request.json();

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

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
    const request = pool.request();

    // Campos que se pueden actualizar
    request.input("id", sql.Int, id);
    if (body.titulo !== undefined) request.input("titulo", sql.NVarChar(255), body.titulo);
    if (body.descripcion !== undefined) request.input("descripcion", sql.NVarChar(1000), body.descripcion);
    if (body.fecha_inicio !== undefined) request.input("fecha_inicio", sql.Date, body.fecha_inicio);
    if (body.fecha_fin !== undefined) request.input("fecha_fin", sql.Date, body.fecha_fin);
    if (body.vigencia !== undefined) request.input("vigencia", sql.Int, body.vigencia);
    if (body.id_Estado_Convocatoria !== undefined) request.input("id_Estado_Convocatoria", sql.Int, body.id_Estado_Convocatoria);

    // Construir la consulta dinámicamente según los campos enviados
    const updates = [];
    if (body.titulo !== undefined) updates.push("titulo = @titulo");
    if (body.descripcion !== undefined) updates.push("descripcion = @descripcion");
    if (body.fecha_inicio !== undefined) updates.push("fecha_inicio = @fecha_inicio");
    if (body.fecha_fin !== undefined) updates.push("fecha_fin = @fecha_fin");
    if (body.vigencia !== undefined) updates.push("vigencia = @vigencia");
    if (body.id_Estado_Convocatoria !== undefined) updates.push("id_Estado_Convocatoria = @id_Estado_Convocatoria");

    if (updates.length === 0) {
      return NextResponse.json({ error: "No se proporcionaron campos para actualizar" }, { status: 400 });
    }

    const query = `
      UPDATE [PNVR].[dbo].[Convocatorias] 
      SET ${updates.join(", ")} 
      OUTPUT INSERTED.* 
      WHERE id_convocatoria = @id
    `;
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Convocatoria no encontrada" }, { status: 404 });
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "No se pudo actualizar la convocatoria", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

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
      .query("DELETE FROM [PNVR].[dbo].[Convocatorias] WHERE id_convocatoria = @id");
    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "Convocatoria no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ message: "Convocatoria eliminada" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "No se pudo eliminar la convocatoria", details: errorMessage },
      { status: 500 }
    );
  }
}