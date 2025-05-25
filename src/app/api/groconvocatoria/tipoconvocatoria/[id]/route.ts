import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

// Configuración compartida para las variables de entorno
const getDbConfig = () => {
  const requiredVars = {
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SERVER: process.env.DB_SERVER,
    DB_NAME: process.env.DB_NAME,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Faltan las siguientes variables de entorno: ${missingVars.join(", ")}`);
  }

  return {
    user: requiredVars.DB_USER as string,
    password: requiredVars.DB_PASSWORD as string,
    server: requiredVars.DB_SERVER as string,
    database: requiredVars.DB_NAME as string,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
};

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = parseInt(params.id);
  const body = await request.json();

  // Validar que el ID sea válido
  if (isNaN(id) || id <= 0) {
    return NextResponse.json(
      { error: "El ID debe ser un número entero positivo" },
      { status: 400 }
    );
  }

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

  try {
    const config = getDbConfig();
    const pool = await sql.connect(config);
    const requestQuery = pool.request()
      .input("id_tipo", sql.Int, id)
      .input("descripcion", sql.Text, body.descripcion)
      .input("nombre", sql.VarChar(50), body.nombre);

    // Agregar estado solo si está presente en el body
    if (body.estado !== undefined) {
      requestQuery.input("estado", sql.Int, body.estado);
    }

    const query = `
      UPDATE [dbo].[Tipo_Convocatoria]
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
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "No se pudo actualizar el registro", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = parseInt(params.id);

  if (isNaN(id) || id <= 0) {
    return NextResponse.json(
      { error: "El ID debe ser un número entero positivo" },
      { status: 400 }
    );
  }

  try {
    const config = getDbConfig();
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM [dbo].[Tipo_Convocatoria] WHERE id_tipo = @id");

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