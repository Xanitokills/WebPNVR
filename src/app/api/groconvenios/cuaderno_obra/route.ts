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
      { error: `Missing required environment variables: ${missingEnvVars.join(", ")}` },
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
    enableArithAbort: true,
  },
});

// GET handler to retrieve all cuadernos
export async function GET() {
  const envVars = validateEnvVars();
  if (envVars instanceof NextResponse) return envVars;

  try {
    const pool = await sql.connect(getDbConfig(envVars));
    const result = await pool
      .request()
      .query(`
        SELECT 
          id, convenio_id, CONVERT(VARCHAR, fecha, 23) AS fecha, numero_asiento, concepto, cargo_id, texto, estado, CONVERT(VARCHAR, created_at, 126) AS created_at
        FROM [${envVars.DB_NAME}].[dbo].[PNVR_CUADERNO_OBRA]
        ORDER BY created_at DESC
      `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("GET error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to retrieve cuadernos", details: errorMessage },
      { status: 500 }
    );
  }
}

// POST handler to create a new cuaderno
export async function POST(request: NextRequest) {
  const envVars = validateEnvVars();
  if (envVars instanceof NextResponse) return envVars;

  try {
    const pool = await sql.connect(getDbConfig(envVars));
    const body = await request.json();
    console.log("Received payload:", JSON.stringify(body));

    const { convenio_id, fecha, concepto, cargo_id, texto, estado } = body;
    if (!convenio_id || !fecha || !concepto || !cargo_id || !texto || !estado) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }

    if (!["borrador", "grabado"].includes(estado)) {
      return NextResponse.json({ error: "Estado debe ser 'borrador' o 'grabado'" }, { status: 400 });
    }

    // Use a temporary table for OUTPUT since numero_asiento is managed by trigger
    const result = await pool
      .request()
      .input("convenio_id", sql.Int, convenio_id)
      .input("fecha", sql.Date, fecha)
      .input("concepto", sql.VarChar(255), concepto)
      .input("cargo_id", sql.Int, cargo_id)
      .input("texto", sql.Text, texto)
      .input("estado", sql.VarChar(10), estado)
      .input("created_at", sql.DateTime, new Date().toISOString())
      .query(`
        DECLARE @OutputTable TABLE (
          id INT,
          convenio_id INT,
          fecha DATE,
          numero_asiento INT,
          concepto VARCHAR(255),
          cargo_id INT,
          texto TEXT,
          estado VARCHAR(10),
          created_at DATETIME
        );

        INSERT INTO [${envVars.DB_NAME}].[dbo].[PNVR_CUADERNO_OBRA] (
          convenio_id, fecha, concepto, cargo_id, texto, estado, created_at
        )
        OUTPUT INSERTED.*
        INTO @OutputTable
        VALUES (
          @convenio_id, @fecha, @concepto, @cargo_id, @texto, @estado, @created_at
        );

        SELECT * FROM @OutputTable;
      `);

    return NextResponse.json(result.recordset[0], { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("POST error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to create cuaderno", details: errorMessage },
      { status: 500 }
    );
  }
}

// GET handler to retrieve convenios
export async function GETConvenios() {
  const envVars = validateEnvVars();
  if (envVars instanceof NextResponse) return envVars;

  try {
    const pool = await sql.connect(getDbConfig(envVars));
    const result = await pool
      .request()
      .query(`
        SELECT CONVENIO_ID, CODIGO_CONVENIO
        FROM [${envVars.DB_NAME}].[dbo].[PNVR_CONVENIOS]
        ORDER BY CONVENIO_ID
      `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("GET Convenios error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to retrieve convenios", details: errorMessage },
      { status: 500 }
    );
  }
}

// GET handler to retrieve cargos
export async function GETCargos() {
  const envVars = validateEnvVars();
  if (envVars instanceof NextResponse) return envVars;

  try {
    const pool = await sql.connect(getDbConfig(envVars));
    const result = await pool
      .request()
      .query(`
        SELECT id_cargo, descripcion
        FROM [${envVars.DB_NAME}].[dbo].[PNVR_CARGOS]
        ORDER BY id_cargo
      `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("GET Cargos error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to retrieve cargos", details: errorMessage },
      { status: 500 }
    );
  }
}