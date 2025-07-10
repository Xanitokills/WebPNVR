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
  },
});

export async function GET() {
  const envVars = validateEnvVars();
  if (envVars instanceof NextResponse) return envVars;

  try {
    const pool = await sql.connect(getDbConfig(envVars));
    
    // Query to fetch only CONVENIO_ID
    const result = await pool.request().query(`
      SELECT CONVENIO_ID,[CODIGO_CONVENIO]
      FROM [${envVars.DB_NAME}].[dbo].[PNVR_Convenios]
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to retrieve convenios", details: errorMessage },
      { status: 500 }
    );
  }
}