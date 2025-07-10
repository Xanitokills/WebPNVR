import { NextResponse } from "next/server";
import { Pool } from "pg";

// Define interfaces for type safety
interface RequestBody {
  dni: string;
}

interface Persona {
  proyecto: string;
  sFecha: string;
  departamento: string;
  provincia: string;
  distrito: string;
  centropoblado: string;
  beneficiario: string;
  comunidad: string;
  dni: string;
  proyectista: string;
  evaluador: string;
  foto1: string;
  foto2: string;
  confirmainformacion: string;
  confirmadoc: string;
  otrotipodoc: string;
  tipodoc: string;
  latitud: number;
  longitud: number;
  ubicoordx: number;
  ubicoordy: number;
  altitud: number;
  confirmamedidas: string;
  observamedidasterreno: string;
  pendiente: string;
  confirmariesgo: string;
  observariesgo: string;
}

// PostgreSQL configuration
const config = {
  user: process.env.DB_USER2,
  password: process.env.DB_PASSWORD2,
  host: process.env.DB_SERVER2,
  database: process.env.DB_NAME3,
  port: 5432,
  ssl: false, // Explicitly disable SSL
};

// Validate environment variables
if (!config.user || !config.password || !config.host || !config.database) {
  console.error("Missing required environment variables for PostgreSQL connection:", {
    user: !!config.user,
    password: !!config.password,
    host: !!config.host,
    database: !!config.database,
  });
  throw new Error("Database configuration is incomplete.");
}

// Create a connection pool
const pool = new Pool(config);

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body: RequestBody = await request.json();
    const { dni } = body;

    if (!dni || typeof dni !== "string" || dni.length !== 8 || !/^\d{8}$/.test(dni)) {
      return NextResponse.json(
        { success: false, message: "DNI inválido: debe ser una cadena de 8 dígitos." },
        { status: 400 }
      );
    }

    // Execute query
    const result = await pool.query(
      `
      SELECT DISTINCT 
        e1.proyecto,
        TO_CHAR(e1.fecha, 'DD/MM/YYYY') AS "sFecha",
        e1.departamento,
        e1.provincia,
        e1.distrito,
        e1.centropoblado,
        e1.beneficiario,
        e1.comunidad,
        e1.dni,
        e1.proyectista,
        e1.evaluador,
        COALESCE(foto1.data, '') AS foto1,
        COALESCE(foto2.data, '') AS foto2,
        e1.confirmainformacion::text,
        e1.confirmadoc::text,
        e1.otrotipodoc,
        e1.tipodoc,
        e1.latitud,
        e1.longitud,
        e1.ubicoordx,
        e1.ubicoordy,
        e1.altitud,
        e1.confirmamedidas::text,
        e1.observa1 AS observamedidasterreno, -- Mapped from observa1
        e1.pendiente,
        e1.confirmariesgo::text,
        e1.observa2 AS observariesgo -- Mapped from observa2
      FROM pnvr.encuestaugt e1
      LEFT JOIN (
        SELECT rel_globalid, data,
               ROW_NUMBER() OVER (PARTITION BY rel_globalid ) AS npos
        FROM pnvr.encuestaugt__attach pnvrea
      ) foto1 ON foto1.rel_globalid = e1.globalid AND foto1.npos = 1
      LEFT JOIN (
        SELECT rel_globalid, data,
               ROW_NUMBER() OVER (PARTITION BY rel_globalid ) AS npos
        FROM pnvr.encuestaugt__attach
      ) foto2 ON foto2.rel_globalid = e1.globalid AND foto2.npos = 2
      WHERE e1.dni = $1
      `,
      [dni]
    );

    if (result.rows.length > 0) {
      const persona: Persona = result.rows[0];
      // Convert binary photo data to base64 if present
      persona.foto1 = persona.foto1 ? Buffer.from(persona.foto1, "binary").toString("base64") : "";
      persona.foto2 = persona.foto2 ? Buffer.from(persona.foto2, "binary").toString("base64") : "";
      return NextResponse.json({ success: true, persona });
    } else {
      return NextResponse.json(
        { success: false, message: "No se encontró a la persona." },
        { status: 404 }
      );
    }
  } catch (err) {
    console.error("API error:", {
      message: err instanceof Error ? err.message : "Unknown error",
      stack: err instanceof Error ? err.stack : undefined,
      dni: (await request.json().catch(() => ({}))).dni || "unknown",
    });
    return NextResponse.json(
      { success: false, message: `Error del servidor: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

// Gracefully close the pool on process termination
process.on("SIGTERM", async () => {
  await pool.end();
  console.log("PostgreSQL pool closed");
});