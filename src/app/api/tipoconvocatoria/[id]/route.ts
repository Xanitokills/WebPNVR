import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = parseInt(params.id);
  const body = await request.json();

  // Validar que estado sea un número entero si está presente
  if (body.estado !== undefined && !Number.isInteger(body.estado)) {
    return NextResponse.json(
      { error: "El campo estado debe ser un número entero" },
      { status: 400 }
    );
  }

  // Validar que descripcion y nombre no estén vacíos
  if (!body.descripcion || body.descripcion.trim() === "") {
    return NextResponse.json(
      { error: "El campo descripcion es requerido y no puede estar vacío" },
      { status: 400 }
    );
  }
  if (!body.nombre || body.nombre.trim() === "") {
    return NextResponse.json(
      { error: "El campo nombre es requerido y no puede estar vacío" },
      { status: 400 }
    );
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
    const requestQuery = pool.request()
      .input("id_tipo", sql.Int, id)
      .input("descripcion", sql.Text, body.descripcion)
      .input("nombre", sql.VarChar(50), body.nombre);

    // Agregar estado solo si está presente en el body
    if (body.estado !== undefined) {
      requestQuery.input("estado", sql.Int, body.estado);
    }

    const query = `
      UPDATE [PNVR].[dbo].[Tipo_Convocatoria]
      SET descripcion = @descripcion,
          nombre = @nombre
      ${body.estado !== undefined ? ", estado = @estado" : ""}
      WHERE id_tipo = @id_tipo
    `;

    const result = await requestQuery.query(query);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }

    const updatedRecord = {
      id_tipo: id,
      nombre: body.nombre,
      descripcion: body.descripcion,
      ...(body.estado !== undefined && { estado: body.estado }),
    };
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error("Error en la consulta PUT:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el registro", details: error.message },
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
      .query("DELETE FROM [PNVR].[dbo].[Tipo_Convocatoria] WHERE id_tipo = @id");

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ message: "Registro eliminado" });
  } catch (error) {
    console.error("Error en la consulta DELETE:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "No se pudo eliminar el registro", details: errorMessage },
      { status: 500 }
    );
  }
}