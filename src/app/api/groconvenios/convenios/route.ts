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
    
    // Consulta principal para obtener los convenios
    const conveniosResult = await pool.request().query(`
      SELECT 
        c.[CONVENIO_ID],
        c.[CODIGO_UGT],
        c.[CODIGO_CONVENIO],
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
        c.[PRESUPUESTO_BASE],
        c.[PRESUPUESTO_FINANCIAMIENTO],
        c.[APORTE_BENEFICIARIO],
        c.[PLAZO_EJECUCION_MESES],
        c.[PLAZO_EJECUCION_DIAS],
        c.[NUMERO_BENEFICIARIOS],
        c.[CreadoEn],
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
    `);

    const convenios = conveniosResult.recordset;

    // Consulta para obtener el personal asignado a cada convenio
    const personalResult = await pool.request().query(`
      SELECT 
        cp.ID_CONVENIO,
        p.id_personal,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        ca.descripcion AS cargo,
        cp.fecha_inicio,
        cp.fecha_fin
      FROM [dbo].[PNVR_convenio_personal] cp
      JOIN [dbo].[PNVR_personal] p ON cp.id_personal = p.id_personal
      JOIN [dbo].[PNVR_cargo] ca ON cp.id_cargo = ca.id_cargo

    `);

    const personal = personalResult.recordset;

    // Agrupar el personal por CONVENIO_ID
    const personalByConvenio = personal.reduce((acc, item) => {
      if (!acc[item.CONVENIO_ID]) {
        acc[item.CONVENIO_ID] = [];
      }
      acc[item.CONVENIO_ID].push({
        id_personal: item.id_personal,
        nombre: item.nombre,
        apellido_paterno: item.apellido_paterno,
        apellido_materno: item.apellido_materno,
        cargo: item.cargo,
        fecha_inicio: item.fecha_inicio,
        fecha_fin: item.fecha_fin,
      });
      return acc;
    }, {});

    // Combinar los datos de convenios con el personal asignado
    const result = convenios.map((convenio) => ({
      ...convenio,
      personal_asignado: personalByConvenio[convenio.CONVENIO_ID] || [],
    }));

    return NextResponse.json(result);
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
    const CODIGO_UGT = formData.get("CODIGO_UGT") as string | null;
    const CODIGO_CONVENIO = formData.get("CODIGO_CONVENIO") as string | null;
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
    const PRESUPUESTO_BASE = formData.get("PRESUPUESTO_BASE") ? parseFloat(formData.get("PRESUPUESTO_BASE") as string) : null;
    const PRESUPUESTO_FINANCIAMIENTO = formData.get("PRESUPUESTO_FINANCIAMIENTO") ? parseFloat(formData.get("PRESUPUESTO_FINANCIAMIENTO") as string) : null;
    const APORTE_BENEFICIARIO = formData.get("APORTE_BENEFICIARIO") ? parseFloat(formData.get("APORTE_BENEFICIARIO") as string) : null;
    const PLAZO_EJECUCION_MESES = formData.get("PLAZO_EJECUCION_MESES") ? parseInt(formData.get("PLAZO_EJECUCION_MESES") as string) : null;
    const PLAZO_EJECUCION_DIAS = formData.get("PLAZO_EJECUCION_DIAS") ? parseInt(formData.get("PLAZO_EJECUCION_DIAS") as string) : null;
    const NUMERO_BENEFICIARIOS = formData.get("NUMERO_BENEFICIARIOS") ? parseInt(formData.get("NUMERO_BENEFICIARIOS") as string) : null;

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
      .input("CODIGO_UGT", sql.NVarChar(50), CODIGO_UGT)
      .input("CODIGO_CONVENIO", sql.NVarChar(50), CODIGO_CONVENIO)
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
      .input("PRESUPUESTO_BASE", sql.Decimal(18, 2), PRESUPUESTO_BASE)
      .input("PRESUPUESTO_FINANCIAMIENTO", sql.Decimal(18, 2), PRESUPUESTO_FINANCIAMIENTO)
      .input("APORTE_BENEFICIARIO", sql.Decimal(18, 2), APORTE_BENEFICIARIO)
      .input("PLAZO_EJECUCION_MESES", sql.Int, PLAZO_EJECUCION_MESES)
      .input("PLAZO_EJECUCION_DIAS", sql.Int, PLAZO_EJECUCION_DIAS)
      .input("NUMERO_BENEFICIARIOS", sql.Int, NUMERO_BENEFICIARIOS)
      .input("CreadoEn", sql.DateTime, currentDate)

    const result = await requestQuery.query(`
      INSERT INTO [${envVars.DB_NAME}].[dbo].[PNVR_Convenios] (
        CODIGO_UGT, CODIGO_CONVENIO, nombre_Convenio, id_grupo, id_tipo_intervencion, id_programa_presupuestal,
        id_tipo_fenomeno, id_tipo_material, id_estado, id_sub_estado, id_priorizacion, id_tipo_meta,
        id_Localidad, id_Distrito, id_Provincia, id_Departamento, fecha_Convenios, fecha_transferencia,
        fecha_limite_inicio, fecha_inicio, plazo_ejecucion, dias_paralizados, dias_ampliacion,
        fecha_termino, fecha_acta_termino, motivo_atraso, accion_mitigacion, fecha_inicio_estimada,
        fecha_termino_estimada, anio_intervencion, Entidad, Programa, Proyectista, Evaluador,
        PRESUPUESTO_BASE, PRESUPUESTO_FINANCIAMIENTO, APORTE_BENEFICIARIO, 
        PLAZO_EJECUCION_MESES, PLAZO_EJECUCION_DIAS, NUMERO_BENEFICIARIOS, CreadoEn
      ) OUTPUT INSERTED.*
      VALUES (
        @CODIGO_UGT, @CODIGO_CONVENIO, @nombre_Convenio, @id_grupo, @id_tipo_intervencion, @id_programa_presupuestal,
        @id_tipo_fenomeno, @id_tipo_material, @id_estado, @id_sub_estado, @id_priorizacion, @id_tipo_meta,
        @id_Localidad, @id_Distrito, @id_Provincia, @id_Departamento, @fecha_Convenios, @fecha_transferencia,
        @fecha_limite_inicio, @fecha_inicio, @plazo_ejecucion, @dias_paralizados, @dias_ampliacion,
        @fecha_termino, @fecha_acta_termino, @motivo_atraso, @accion_mitigacion, @fecha_inicio_estimada,
        @fecha_termino_estimada, @anio_intervencion, @Entidad, @Programa, @Proyectista, @Evaluador,
        @PRESUPUESTO_BASE, @PRESUPUESTO_FINANCIAMIENTO, @APORTE_BENEFICIARIO, 
        @PLAZO_EJECUCION_MESES, @PLAZO_EJECUCION_DIAS, @NUMERO_BENEFICIARIOS, @CreadoEn
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