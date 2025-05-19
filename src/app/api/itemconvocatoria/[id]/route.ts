import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { error: "El ID debe ser un número entero positivo" },
      { status: 400 }
    );
  }

  const body = await request.json();

  // Validar campos requeridos
  if (!body.descripcion || body.descripcion.trim() === "") {
    return NextResponse.json(
      { error: "El campo descripcion es requerido y no puede estar vacío" },
      { status: 400 }
    );
  }
  if (!Number.isInteger(body.cantidad) || body.cantidad <= 0) {
    return NextResponse.json(
      { error: "El campo cantidad debe ser un número entero positivo" },
      { status: 400 }
    );
  }
  if (!Number.isInteger(body.id_unidad_medida) || body.id_unidad_medida <= 0) {
    return NextResponse.json(
      { error: "El campo id_unidad_medida debe ser un número entero positivo" },
      { status: 400 }
    );
  }
  if (typeof body.precio_referencial !== "number" || body.precio_referencial < 0) {
    return NextResponse.json(
      { error: "El campo precio_referencial debe ser un número no negativo" },
      { status: 400 }
    );
  }
  if (!Number.isInteger(body.id_convocatoria) || body.id_convocatoria <= 0) {
    return NextResponse.json(
      { error: "El campo id_convocatoria debe ser un número entero positivo" },
      { status: 400 }
    );
  }

  // especificaciones_tecnicas es opcional, pero si está presente, no debe estar vacío
  if (body.especificaciones_tecnicas && body.especificaciones_tecnicas.trim() === "") {
    return NextResponse.json(
      { error: "El campo especificaciones_tecnicas no puede estar vacío si se proporciona" },
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
      .input("id_item_convocatoria", sql.Int, id)
      .input("descripcion", sql.NVarChar(500), body.descripcion)
      .input("cantidad", sql.Int, body.cantidad)
      .input("id_unidad_medida", sql.Int, body.id_unidad_medida)
      .input("precio_referencial", sql.Decimal(18, 2), body.precio_referencial)
      .input("especificaciones_tecnicas", sql.NVarChar(sql.MAX), body.especificaciones_tecnicas || null)
      .input("id_convocatoria", sql.Int, body.id_convocatoria);

    const query = `
      UPDATE [PNVR].[dbo].[item_convocatoria]
      SET
        descripcion = @descripcion,
        cantidad = @cantidad,
        id_unidad_medida = @id_unidad_medida,
        precio_referencial = @precio_referencial,
        especificaciones_tecnicas = @especificaciones_tecnicas,
        id_convocatoria = @id_convocatoria
      OUTPUT INSERTED.id_item_convocatoria, 
             INSERTED.descripcion, 
             INSERTED.cantidad, 
             INSERTED.id_unidad_medida, 
             INSERTED.precio_referencial, 
             INSERTED.especificaciones_tecnicas, 
             INSERTED.id_convocatoria
      WHERE id_item_convocatoria = @id_item_convocatoria
    `;

    const result = await requestQuery.query(query);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "No se encontró el registro para actualizar" },
        { status: 404 }
      );
    }

    const updatedRecord = result.recordset[0];
    return NextResponse.json(updatedRecord, { status: 200 });
  } catch (error) {
    console.error("Error en la consulta PUT:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "No se pudo actualizar el registro", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { error: "El ID debe ser un número entero positivo" },
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
    const requestQuery = pool.request().input("id_item_convocatoria", sql.Int, id);

    const query = `
      DELETE FROM [PNVR].[dbo].[item_convocatoria]
      OUTPUT DELETED.id_item_convocatoria
      WHERE id_item_convocatoria = @id_item_convocatoria
    `;

    const result = await requestQuery.query(query);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "No se encontró el registro para eliminar" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: `Registro con ID ${id} eliminado correctamente` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en la consulta DELETE:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "No se pudo eliminar el registro", details: errorMessage },
      { status: 500 }
    );
  }
}