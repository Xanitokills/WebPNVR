import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

// Function to validate and retrieve environment variables
function getDbConfig() {
  const variablesRequeridas = {
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SERVER: process.env.DB_SERVER,
    DB_NAME: process.env.DB_NAME,
  };

  const variablesFaltantes = Object.entries(variablesRequeridas)
    .filter(([, valor]) => !valor)
    .map(([clave]) => clave);

  if (variablesFaltantes.length > 0) {
    throw new Error(`Faltan las siguientes variables de entorno: ${variablesFaltantes.join(", ")}`);
  }

  return {
    user: variablesRequeridas.DB_USER as string,
    password: variablesRequeridas.DB_PASSWORD as string,
    server: variablesRequeridas.DB_SERVER as string,
    database: variablesRequeridas.DB_NAME as string,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();

    // Validate nombre
    if (!body.nombre || typeof body.nombre !== "string" || body.nombre.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es requerido y no puede estar vacío." },
        { status: 400 }
      );
    }

    // Validate estado if provided
    if (body.estado !== undefined && !Number.isInteger(body.estado)) {
      return NextResponse.json(
        { error: "El estado debe ser un número entero." },
        { status: 400 }
      );
    }

    const configuracion = getDbConfig();
    const pool = await sql.connect(configuracion);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("nombre", sql.NVarChar(100), body.nombre)
      .input("estado", sql.Int, body.estado !== undefined ? body.estado : null)
      .query(
        "UPDATE [dbo].[Grupo] SET nombre = @nombre, estado = @estado WHERE id_grupo = @id"
      );

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
    }

    const updatedGrupo = { id_grupo: id, nombre: body.nombre, estado: body.estado || null };
    return NextResponse.json(updatedGrupo);
  } catch (error) {
    console.error("Error en la consulta PUT:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "No se pudo actualizar el grupo", details: errorMessage },
      { status: errorMessage.includes("Faltan las siguientes variables") ? 400 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const configuracion = getDbConfig();
    const pool = await sql.connect(configuracion);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM [dbo].[Grupo] WHERE id_grupo = @id");

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Grupo eliminado" });
  } catch (error) {
    console.error("Error en la consulta DELETE:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "No se pudo eliminar el grupo", details: errorMessage },
      { status: errorMessage.includes("Faltan las siguientes variables") ? 400 : 500 }
    );
  }
}