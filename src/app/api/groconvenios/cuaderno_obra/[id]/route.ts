import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

// Interface for environment variables
interface EnvVars {
  DB_USER: string;
  DB_PASSWORD: string;
  DB_SERVER: string;
  DB_NAME: string;
}

// Function to validate environment variables
const validateEnvVars = (): EnvVars | NextResponse => {
  const requiredEnvVars: EnvVars = {
    DB_USER: process.env.DB_USER as string,
    DB_PASSWORD: process.env.DB_PASSWORD as string,
    DB_SERVER: process.env.DB_SERVER as string,
    DB_NAME: process.env.DB_NAME as string,
  };

  const missingEnvVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingEnvVars.length > 0) {
    return NextResponse.json(
      {
        error: `Missing required environment variables: ${missingEnvVars.join(", ")}`,
      },
      { status: 500 }
    );
  }

  return requiredEnvVars;
};

// Database configuration
const getDbConfig = (envVars: EnvVars) => ({
  user: envVars.DB_USER,
  password: envVars.DB_PASSWORD,
  server: envVars.DB_SERVER,
  database: envVars.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true, // Added to ensure compatibility with OUTPUT clause
  },
});

// GET handler to retrieve a specific cuaderno by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const envVars = validateEnvVars();
  if (envVars instanceof NextResponse) return envVars;

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  try {
    const pool = await sql.connect(getDbConfig(envVars));
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT 
          id, convenio_id, fecha, numero_asiento, concepto, cargo_id, texto, estado, created_at
        FROM [${envVars.DB_NAME}].[dbo].[PNVR_CUADERNO_OBRA]
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Cuaderno no encontrado" }, { status: 404 });
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("GET error:", errorMessage); // Debug log
    return NextResponse.json(
      { error: "Failed to retrieve cuaderno", details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT handler to update a specific cuaderno by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const envVars = validateEnvVars();
  if (envVars instanceof NextResponse) return envVars;

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  try {
    const pool = await sql.connect(getDbConfig(envVars));
    const body = await request.json();
    console.log("Received payload:", JSON.stringify(body)); // Debug log

    // Validar campos requeridos
    const { convenio_id, fecha, concepto, cargo_id, texto, estado } = body;
    if (!convenio_id || !fecha || !concepto || !cargo_id || !texto || !estado) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }

    // Validar que el estado sea 'borrador' o 'grabado'
    if (!["borrador", "grabado"].includes(estado)) {
      return NextResponse.json({ error: "Estado debe ser 'borrador' o 'grabado'" }, { status: 400 });
    }

    // Log the exact query for debugging
    const query = `
      UPDATE [${envVars.DB_NAME}].[dbo].[PNVR_CUADERNO_OBRA]
      SET 
        convenio_id = @convenio_id,
        fecha = @fecha,
        concepto = @concepto,
        cargo_id = @cargo_id,
        texto = @texto,
        estado = @estado,
        created_at = @created_at
      WHERE id = @id
 SELECT * FROM [${envVars.DB_NAME}].[dbo].[PNVR_CUADERNO_OBRA] WHERE id = @id;
    `;
    console.log("Executing query:", query); // Debug the query

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("convenio_id", sql.Int, convenio_id)
      .input("fecha", sql.Date, fecha)
      .input("concepto", sql.VarChar(255), concepto)
      .input("cargo_id", sql.Int, cargo_id)
      .input("texto", sql.Text, texto)
      .input("estado", sql.VarChar(10), estado)
      .input("created_at", sql.DateTime, new Date().toISOString())
      .query(query);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "Cuaderno no encontrado" }, { status: 404 });
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("PUT error:", errorMessage); // Debug log
    return NextResponse.json(
      { error: "Failed to update cuaderno", details: errorMessage },
      { status: 500 }
    );
  }
}