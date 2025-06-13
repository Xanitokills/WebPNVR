import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

// Configuración de variables de entorno
const getDbConfig = () => {
  const requiredEnvVars = {
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SERVER: process.env.DB_SERVER,
    DB_NAME: process.env.DB_NAME, // Añadimos DB_NAME
  };

  const missingEnvVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingEnvVars.length > 0) {
    throw new Error(`Faltan las siguientes variables de entorno: ${missingEnvVars.join(", ")}`);
  }

  return {
    user: requiredEnvVars.DB_USER as string,
    password: requiredEnvVars.DB_PASSWORD as string,
    server: requiredEnvVars.DB_SERVER as string,
    database: requiredEnvVars.DB_NAME as string, // Usamos DB_NAME desde las variables de entorno
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
};

export async function GET() {
  try {
    const config = getDbConfig();
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query("SELECT * FROM [dbo].[PNVR_Grupo]"); // Simplifiqué la consulta eliminando [PNVR] ya que el database se especifica en la conexión
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error en la consulta GET:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener los datos de los grupos", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = getDbConfig();
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("nombre", sql.NVarChar(100), body.nombre)
      .input("estado", sql.Int, body.estado || null)
      .query(
        "INSERT INTO [dbo].[PNVR_Grupo] (nombre, estado) VALUES (@nombre, @estado); SELECT SCOPE_IDENTITY() as id_grupo"
      );
    const newId = result.recordset[0].id_grupo;
    const newGrupo = { id_grupo: newId, nombre: body.nombre, estado: body.estado || null };
    return NextResponse.json(newGrupo, { status: 201 });
  } catch (error) {
    console.error("Error en la consulta POST:", error);
    return NextResponse.json(
      { error: "No se pudo crear el grupo", details: error.message },
      { status: 500 }
    );
  }
}