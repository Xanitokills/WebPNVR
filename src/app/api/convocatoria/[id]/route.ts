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
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("titulo", sql.NVarChar(255), body.titulo)
      .input("descripcion", sql.NVarChar(1000), body.descripcion)
      .input("fecha_inicio", sql.Date, body.fecha_inicio)
      .input("fecha_fin", sql.Date, body.fecha_fin)
      .input("vigencia", sql.Int, body.vigencia)
      .query(
        "UPDATE [PNVR].[dbo].[Convocatorias] SET titulo = @titulo, descripcion = @descripcion, fecha_inicio = @fecha_inicio, fecha_fin = @fecha_fin, vigencia = @vigencia WHERE id_convocatoria = @id"
      );
    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "Convocatoria no encontrada" }, { status: 404 });
    }
    const updatedConvocatoria = {
      id_convocatoria: id,
      titulo: body.titulo,
      descripcion: body.descripcion,
      fecha_inicio: body.fecha_inicio,
      fecha_fin: body.fecha_fin,
      vigencia: body.vigencia,
    };
    return NextResponse.json(updatedConvocatoria);
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