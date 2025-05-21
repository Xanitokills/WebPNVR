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
    const result = await pool.request().query(`
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
      FROM [${envVars.DB_NAME}].[dbo].[Convenios] c
      LEFT JOIN [${envVars.DB_NAME}].[dbo].[Grupo] g ON c.[id_grupo] = g.[id_grupo]
      LEFT JOIN [${envVars.DB_NAME}].[dbo].[Tipo_Intervencion] ti ON c.[id_tipo_intervencion] = ti.[id_tipo_intervencion]
      LEFT JOIN [${envVars.DB_NAME}].[dbo].[Programa_Presupuestal] pp ON c.[id_programa_presupuestal] = pp.[id_programa_presupuestal]
      LEFT JOIN [${envVars.DB_NAME}].[dbo].[Tipo_Fenomeno] tf ON c.[id_tipo_fenomeno] = tf.[id_tipo_fenomeno]
      LEFT JOIN [${envVars.DB_NAME}].[dbo].[Tipo_Material] tm ON c.[id_tipo_material] = tm.[id_tipo_material]
      LEFT JOIN [${envVars.DB_NAME}].[dbo].[Estado_Conv] ec ON c.[id_estado] = ec.[id_estado]
      LEFT JOIN [${envVars.DB_NAME}].[dbo].[Sub_Estado_Conv] sec ON c.[id_sub_estado] = sec.[id_sub_estado]
      LEFT JOIN [${envVars.DB_NAME}].[dbo].[Priorizaciones] pr ON c.[id_priorizacion] = pr.[id_priorizacion]
      LEFT JOIN [${envVars.DB_NAME}].[dbo].[Tipos_Meta] tme ON c.[id_tipo_meta] = tme.[id_tipo_meta]
      LEFT JOIN [${envVars.DB_NAME}].[dbo].[Localidad] l ON c.[id_Localidad] = l.[id_Localidad]
      LEFT JOIN [${envVars.DB_NAME}].[dbo].[Distrito] dis ON c.[id_Distrito] = dis.[id_Distrito]
      LEFT JOIN [${envVars.DB_NAME}].[dbo].[Provincia] p ON c.[id_Provincia] = p.[id_Provincia]
      LEFT JOIN [${envVars.DB_NAME}].[dbo].[Departamento] d ON c.[id_Departamento] = d.[id_Departamento]
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

export async function POST(request: NextRequest) {
  const envVars = validateEnvVars();
  if (envVars instanceof NextResponse) return envVars;

  try {
    const pool = await sql.connect(getDbConfig(envVars));
    const formData = await request.formData();

    // Extract form data
    const cod_ugt = formData.get("cod_ugt") as string | null;
    const cod_Convenio = formData.get("cod_Convenio") as string | null;
    const nombre_Convenio = formData.get("nombre_Convenio") as string;
    const id_grupo = formData.get("id_grupo") ? parseInt(formData.get("id_grupo") as string) : null;
    const id_tipo_intervencion = formData.get("id_tipo_intervencion") ? parseInt(formData.get("id_tipo_intervencion") as string) : null;
    const id_programa_presupuestal = formData.get("id_programa_presupuestal") ? parseInt(formData.get("id_programa_presupuestal") as string) : null;
    const id_tipo_fenomeno = formData.get("id_tipo_fenomeno") ? parseInt(formData.get("id_tipo_fenomeno") as string) : null;
    const id_tipo_material = formData.get("id_tipo_material") ? parseInt(formData.get("id_tipo_material") as string) : null;
    const id_estado = formData.get("id_estado") ? parseInt(formData.get("id_estado") as string) : null;
    const id_sub_estado = formData.get("id_sub_estado") ? parseInt(formData.get("id_sub_estado") as string) : null;
    const id_priorizacion = formData.get("id_priorizacion") ? parseInt(formData.get("id_priorizacion") as string) : null;
    const id_tipo_meta = formData.get("id_tipo_meta") ? parseInt(formData.get("id_tipo_meta") as string) : null;
    const id_Localidad = formData.get("id_Localidad") ? parseInt(formData.get("id_Localidad") as string) : null;
    const id_Distrito = formData.get("id_Distrito") ? parseInt(formData.get("id_Distrito") as string) : null;
    const id_Provincia = formData.get("id_Provincia") ? parseInt(formData.get("id_Provincia") as string) : null;
    const id_Departamento = formData.get("id_Departamento") ? parseInt(formData.get("id_Departamento") as string) : null;
    const fecha_Convenios = formData.get("fecha_Convenios") as string | null;
    const fecha_transferencia = formData.get("fecha_transferencia") as string | null;
    const fecha_limite_inicio = formData.get("fecha_limite_inicio") as string | null;
    const fecha_inicio = formData.get("fecha_inicio") as string | null;
    const plazo_ejecucion = formData.get("plazo_ejecucion") ? parseInt(formData.get("plazo_ejecucion") as string) : null;
    const dias_paralizados = formData.get("dias_paralizados") ? parseInt(formData.get("dias_paralizados") as string) : null;
    const dias_ampliacion = formData.get("dias_ampliacion") ? parseInt(formData.get("dias_ampliacion") as string) : null;
    const fecha_termino = formData.get("fecha_termino") as string | null;
    const fecha_acta_termino = formData.get("fecha_acta_termino") as string | null;
    const motivo_atraso = formData.get("motivo_atraso") as string | null;
    const accion_mitigacion = formData.get("accion_mitigacion") as string | null;
    const fecha_inicio_estimada = formData.get("fecha_inicio_estimada") as string | null;
    const fecha_termino_estimada = formData.get("fecha_termino_estimada") as string | null;
    const anio_intervencion = formData.get("anio_intervencion") ? parseInt(formData.get("anio_intervencion") as string) : null;
    const Entidad = formData.get("Entidad") as string | null;
    const Programa = formData.get("Programa") as string | null;
    const Proyectista = formData.get("Proyectista") as string | null;
    const Evaluador = formData.get("Evaluador") as string | null;
    const PresupuestoBase = formData.get("PresupuestoBase") ? parseFloat(formData.get("PresupuestoBase") as string) : null;
    const PresupuestoFinanciamiento = formData.get("PresupuestoFinanciamiento") ? parseFloat(formData.get("PresupuestoFinanciamiento") as string) : null;
    const AporteBeneficiario = formData.get("AporteBeneficiario") ? parseFloat(formData.get("AporteBeneficiario") as string) : null;
    const SimboloMonetario = formData.get("SimboloMonetario") as string | null;
    const IGV = formData.get("IGV") ? parseFloat(formData.get("IGV") as string) : null;
    const PlazoEjecucionMeses = formData.get("PlazoEjecucionMeses") ? parseInt(formData.get("PlazoEjecucionMeses") as string) : null;
    const PlazoEjecucionDias = formData.get("PlazoEjecucionDias") ? parseInt(formData.get("PlazoEjecucionDias") as string) : null;
    const NumeroBeneficiarios = formData.get("NumeroBeneficiarios") ? parseInt(formData.get("NumeroBeneficiarios") as string) : null;

    // Validate required fields
    if (!nombre_Convenio) {
      return NextResponse.json(
        { error: "nombre_Convenio is required" },
        { status: 400 }
      );
    }

    const currentDate = new Date().toISOString();

    const requestQuery = pool.request();
    requestQuery
      .input("cod_ugt", sql.NVarChar(50), cod_ugt)
      .input("cod_Convenio", sql.NVarChar(50), cod_Convenio)
      .input("nombre_Convenio", sql.NVarChar(500), nombre_Convenio)
      .input("id_grupo", sql.Int, id_grupo)
      .input("id_tipo_intervencion", sql.Int, id_tipo_intervencion)
      .input("id_programa_presupuestal", sql.Int, id_programa_presupuestal)
      .input("id_tipo_fenomeno", sql.Int, id_tipo_fenomeno)
      .input("id_tipo_material", sql.Int, id_tipo_material)
      .input("id_estado", sql.Int, id_estado)
      .input("id_sub_estado", sql.Int, id_sub_estado)
      .input("id_priorizacion", sql.Int, id_priorizacion)
      .input("id_tipo_meta", sql.Int, id_tipo_meta)
      .input("id_Localidad", sql.Int, id_Localidad)
      .input("id_Distrito", sql.Int, id_Distrito)
      .input("id_Provincia", sql.Int, id_Provincia)
      .input("id_Departamento", sql.Int, id_Departamento)
      .input("fecha_Convenios", sql.DateTime, fecha_Convenios)
      .input("fecha_transferencia", sql.DateTime, fecha_transferencia)
      .input("fecha_limite_inicio", sql.DateTime, fecha_limite_inicio)
      .input("fecha_inicio", sql.DateTime, fecha_inicio)
      .input("plazo_ejecucion", sql.Int, plazo_ejecucion)
      .input("dias_paralizados", sql.Int, dias_paralizados)
      .input("dias_ampliacion", sql.Int, dias_ampliacion)
      .input("fecha_termino", sql.DateTime, fecha_termino)
      .input("fecha_acta_termino", sql.DateTime, fecha_acta_termino)
      .input("motivo_atraso", sql.NVarChar(1000), motivo_atraso)
      .input("accion_mitigacion", sql.NVarChar(1000), accion_mitigacion)
      .input("fecha_inicio_estimada", sql.DateTime, fecha_inicio_estimada)
      .input("fecha_termino_estimada", sql.DateTime, fecha_termino_estimada)
      .input("anio_intervencion", sql.Int, anio_intervencion)
      .input("Entidad", sql.NVarChar(255), Entidad)
      .input("Programa", sql.NVarChar(255), Programa)
      .input("Proyectista", sql.NVarChar(255), Proyectista)
      .input("Evaluador", sql.NVarChar(255), Evaluador)
      .input("PresupuestoBase", sql.Decimal(18, 2), PresupuestoBase)
      .input("PresupuestoFinanciamiento", sql.Decimal(18, 2), PresupuestoFinanciamiento)
      .input("AporteBeneficiario", sql.Decimal(18, 2), AporteBeneficiario)
      .input("SimboloMonetario", sql.NVarChar(10), SimboloMonetario)
      .input("IGV", sql.Decimal(5, 2), IGV)
      .input("PlazoEjecucionMeses", sql.Int, PlazoEjecucionMeses)
      .input("PlazoEjecucionDias", sql.Int, PlazoEjecucionDias)
      .input("NumeroBeneficiarios", sql.Int, NumeroBeneficiarios)
      .input("CreadoEn", sql.DateTime, currentDate)
      .input("ActualizadoEn", sql.DateTime, currentDate);

    const result = await requestQuery.query(`
      INSERT INTO [${envVars.DB_NAME}].[dbo].[Convenios] (
        cod_ugt, cod_Convenio, nombre_Convenio, id_grupo, id_tipo_intervencion, id_programa_presupuestal,
        id_tipo_fenomeno, id_tipo_material, id_estado, id_sub_estado, id_priorizacion, id_tipo_meta,
        id_Localidad, id_Distrito, id_Provincia, id_Departamento, fecha_Convenios, fecha_transferencia,
        fecha_limite_inicio, fecha_inicio, plazo_ejecucion, dias_paralizados, dias_ampliacion,
        fecha_termino, fecha_acta_termino, motivo_atraso, accion_mitigacion, fecha_inicio_estimada,
        fecha_termino_estimada, anio_intervencion, Entidad, Programa, Proyectista, Evaluador,
        PresupuestoBase, PresupuestoFinanciamiento, AporteBeneficiario, SimboloMonetario, IGV,
        PlazoEjecucionMeses, PlazoEjecucionDias, NumeroBeneficiarios, CreadoEn, ActualizadoEn
      ) OUTPUT INSERTED.*
      VALUES (
        @cod_ugt, @cod_Convenio, @nombre_Convenio, @id_grupo, @id_tipo_intervencion, @id_programa_presupuestal,
        @id_tipo_fenomeno, @id_tipo_material, @id_estado, @id_sub_estado, @id_priorizacion, @id_tipo_meta,
        @id_Localidad, @id_Distrito, @id_Provincia, @id_Departamento, @fecha_Convenios, @fecha_transferencia,
        @fecha_limite_inicio, @fecha_inicio, @plazo_ejecucion, @dias_paralizados, @dias_ampliacion,
        @fecha_termino, @fecha_acta_termino, @motivo_atraso, @accion_mitigacion, @fecha_inicio_estimada,
        @fecha_termino_estimada, @anio_intervencion, @Entidad, @Programa, @Proyectista, @Evaluador,
        @PresupuestoBase, @PresupuestoFinanciamiento, @AporteBeneficiario, @SimboloMonetario, @IGV,
        @PlazoEjecucionMeses, @PlazoEjecucionDias, @NumeroBeneficiarios, @CreadoEn, @ActualizadoEn
      )
    `);

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create convenio", details: errorMessage },
      { status: 500 }
    );
  }
}