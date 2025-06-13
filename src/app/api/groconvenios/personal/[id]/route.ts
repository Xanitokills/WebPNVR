import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";


// Función para validar y obtener la configuración de la base de datos
const getDbConfig = () => {
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
    throw new Error(
      `Faltan las siguientes variables de entorno: ${variablesFaltantes.join(", ")}`
    );
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
};

// Función para conectar a la base de datos
const connectToDatabase = async () => {
  try {
    const config = getDbConfig();
    const pool = await sql.connect(config);
    return pool;
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    throw error;
  }
};

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id); // This should be id_convenio

    // Validate the ID
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: "ID inválido, debe ser un número positivo" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields for desassignment
    if (!body.id_persona || !body.cargo) {
      return NextResponse.json(
        { error: "Faltan id_persona o cargo" },
        { status: 400 }
      );
    }

    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input("id_convenio", sql.Int, id)
      .input("id_persona", sql.Int, body.id_persona)
      .input("cargo", sql.NVarChar, body.cargo)
      .input("fecha_fin", sql.Date, body.fecha_fin || null)
      .query(`
        UPDATE [${process.env.DB_NAME}].[dbo].[PNVR_Convenio_personal]
        SET fecha_fin = @fecha_fin
        WHERE id_convenio = @id_convenio
          AND id_persona = @id_persona
          AND id_cargo = (SELECT id_cargo FROM [${process.env.DB_NAME}].[dbo].[PNVR_Cargo] WHERE descripcion = @cargo)
          AND fecha_fin IS NULL
      `);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "Asignación no encontrada o ya desasignada" }, { status: 404 });
    }

    return NextResponse.json({ message: "Asignación actualizada correctamente" });
  } catch (error) {
    console.error("Error en la consulta PUT:", error);
    return NextResponse.json(
      {
        error: "No se pudo actualizar la asignación",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}