import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

// Interface para las variables de entorno
interface EnvVars {
  DB_USER: string;
  DB_PASSWORD: string;
  DB_SERVER: string;
  DB_NAME: string;
}

// Función para validar variables de entorno
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

// Configuración de la base de datos
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

// GET: Obtener un convenio específico por ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const envVars = validateEnvVars();
  if (envVars instanceof NextResponse) return envVars;

  try {
    const pool = await sql.connect(getDbConfig(envVars));

    // Consulta para obtener el convenio específico
    const convenioResult = await pool.request()
      .input("id_convenio", sql.NVarChar(50), id)
      .query(`
        SELECT 
          c.[id_convenio],
          c.[cod_ugt],
          c.[cod_Convenio],
          c.[nombre_Convenio],
          c.[id_grupo],
          c.[id_tipo_intervencion],
          c.[id_programa_presupuestal],
          c.[id_tipo_fenomeno],
          c.[id_tipo_material],
          c.[id_estado],
          c.[id_sub_estado],
          c.[id_priorizacion],
          c.[id_tipo_meta],
          c.[id_Localidad],
          c.[id_Distrito],
          c.[id_Provincia],
          c.[id_Departamento],
          c.[fecha_Convenios],
          c.[fecha_transferencia],
          c.[fecha_limite_inicio],
          c.[fecha_inicio],
          c.[plazo_ejecucion],
          c.[dias_paralizados],
          c.[dias_ampliacion],
          c.[fecha_termino],
          c.[fecha_acta_termino],
          c.[motivo_atraso],
          c.[accion_mitigacion],
          c.[fecha_inicio_estimada],
          c.[fecha_termino_estimada],
          c.[anio_intervencion],
          c.[Entidad],
          c.[Programa],
          c.[Proyectista],
          c.[Evaluador],
          c.[PresupuestoBase],
          c.[PresupuestoFinanciamiento],
          c.[AporteBeneficiario],
          c.[SimboloMonetario],
          c.[IGV],
          c.[PlazoEjecucionMeses],
          c.[PlazoEjecucionDias],
          c.[NumeroBeneficiarios],
          c.[CreadoEn],
          c.[ActualizadoEn],
          g.[nombre] AS Grupo,
          ti.[descripcion] AS Interevencion,
          pp.[codigo] AS Programa_Presupuestal,
          tf.[descripcion] AS Tipo_Fenomeno,
          tm.[descripcion] AS Tipo_Material,
          ec.[descripcion] AS Estado_Convenio,
          sec.[descripcion] AS Sub_Estado_Convenio,
          pr.[grupo_priorizacion] AS Priorizacion,
          tme.[descripcion] AS Meta,
          l.[nombre_Localidad] AS Localidad,
          dis.[nombre_Distrito] AS Distrito,
          p.[nombre_Provincia] AS Provincia,
          d.[nombre_Departamento] AS Departamento
        FROM [${envVars.DB_NAME}].[dbo].[PNVR_Convenios] c
        LEFT JOIN [${envVars.DB_NAME}].[dbo].[PNVR_Grupo] g ON c.[id_grupo] = g.[id_grupo]
        LEFT JOIN [${envVars.DB_NAME}].[dbo].[PNVR_Tipo_Intervencion] ti ON c.[id_tipo_intervencion] = ti.[id_tipo_intervencion]
        LEFT JOIN [${envVars.DB_NAME}].[dbo].[PNVR_Programa_Presupuestal] pp ON c.[id_programa_presupuestal] = pp.[id_programa_presupuestal]
        LEFT JOIN [${envVars.DB_NAME}].[dbo].[PNVR_Tipo_Fenomeno] tf ON c.[id_tipo_fenomeno] = tf.[id_tipo_fenomeno]
        LEFT JOIN [${envVars.DB_NAME}].[dbo].[PNVR_Tipo_Material] tm ON c.[id_tipo_material] = tm.[id_tipo_material]
        LEFT JOIN [${envVars.DB_NAME}].[dbo].[PNVR_Estado_Conv] ec ON c.[id_estado] = ec.[id_estado]
        LEFT JOIN [${envVars.DB_NAME}].[dbo].[PNVR_Sub_Estado_Conv] sec ON c.[id_sub_estado] = sec.[id_sub_estado]
        LEFT JOIN [${envVars.DB_NAME}].[dbo].[PNVR_Priorizaciones] pr ON c.[id_priorizacion] = pr.[id_priorizacion]
        LEFT JOIN [${envVars.DB_NAME}].[dbo].[PNVR_Tipos_Meta] tme ON c.[id_tipo_meta] = tme.[id_tipo_meta]
        LEFT JOIN [${envVars.DB_NAME}].[dbo].[PNVR_Localidad] l ON c.[id_Localidad] = l.[id_Localidad]
        LEFT JOIN [${envVars.DB_NAME}].[dbo].[PNVR_Distrito] dis ON c.[id_Distrito] = dis.[id_Distrito]
        LEFT JOIN [${envVars.DB_NAME}].[dbo].[PNVR_Provincia] p ON c.[id_Provincia] = p.[id_Provincia]
        LEFT JOIN [${envVars.DB_NAME}].[dbo].[PNVR_Departamento] d ON c.[id_Departamento] = d.[id_Departamento]
        WHERE c.[id_convenio] = @id_convenio
      `);

    if (convenioResult.recordset.length === 0) {
      return NextResponse.json({ error: "Convenio not found" }, { status: 404 });
    }

    const convenio = convenioResult.recordset[0];

    // Consulta para obtener el personal asignado
    const personalResult = await pool.request()
      .input("id_convenio", sql.NVarChar(50), id)
      .query(`
        SELECT 
          cp.id_convenio,
          p.id_personal,
          p.nombre,
          p.apellido_paterno,
          p.apellido_materno,
          ca.descripcion AS cargo,
          cp.fecha_inicio,
          cp.fecha_fin
        FROM [${envVars.DB_NAME}].[dbo].[PNVR_convenio_personal] cp
        JOIN [${envVars.DB_NAME}].[dbo].[PNVR_personal] p ON cp.id_personal = p.id_personal
        JOIN [${envVars.DB_NAME}].[dbo].[PNVR_cargo] ca ON cp.id_cargo = ca.id_cargo
        WHERE cp.id_convenio = @id_convenio
      `);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const personal = personalResult.recordset.map((item: any) => ({
      id_persona: item.id_personal,
      nombre: item.nombre,
      apellido_paterno: item.apellido_paterno,
      apellido_materno: item.apellido_materno,
      cargo: item.cargo,
      fecha_inicio: item.fecha_inicio,
      fecha_fin: item.fecha_fin,
    }));

    // Combinar datos del convenio con el personal asignado
    const result = {
      ...convenio,
      personal_asignado: personal,
    };

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to retrieve convenio", details: errorMessage },
      { status: 500 }
    );
  }
}