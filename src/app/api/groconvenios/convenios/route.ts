import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  const requiredEnvVars = {
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SERVER: process.env.DB_SERVER,
  };

  const missingEnvVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingEnvVars.length > 0) {
    return NextResponse.json(
      {
        error: `Missing required environment variables: ${missingEnvVars.join(
          ", "
        )}`,
      },
      { status: 500 }
    );
  }

  const config = {
    user: requiredEnvVars.DB_USER as string,
    password: requiredEnvVars.DB_PASSWORD as string,
    server: requiredEnvVars.DB_SERVER as string,
    database: "PNVR",
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT [id_convenio]
            ,[cod_ugt]
            ,[nombre_proyecto]
            ,[id_grupo]
            ,[id_tipo_intervencion]
            ,[id_programa_presupuestal]
            ,[id_tipo_fenomeno]
            ,[id_tipo_material]
            ,[id_estado]
            ,[id_sub_estado]
            ,[id_priorizacion]
            ,[id_tipo_meta]
            ,[id_ubicacion]
            ,[fecha_convenio]
            ,[fecha_transferencia]
            ,[fecha_limite_inicio]
            ,[fecha_inicio]
            ,[plazo_ejecucion]
            ,[dias_paralizados]
            ,[dias_ampliacion]
            ,[fecha_termino]
            ,[fecha_acta_termino]
            ,[motivo_atraso]
            ,[accion_mitigacion]
            ,[fecha_inicio_estimada]
            ,[fecha_termino_estimada]
            ,[anio_intervencion]
      FROM [PNVR].[dbo].[Convenios]
    `);
    return NextResponse.json(result.recordset);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to retrieve convenios", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const requiredEnvVars = {
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SERVER: process.env.DB_SERVER,
  };

  const missingEnvVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingEnvVars.length > 0) {
    return NextResponse.json(
      {
        error: `Missing required environment variables: ${missingEnvVars.join(
          ", "
        )}`,
      },
      { status: 500 }
    );
  }

  const config = {
    user: requiredEnvVars.DB_USER as string,
    password: requiredEnvVars.DB_PASSWORD as string,
    server: requiredEnvVars.DB_SERVER as string,
    database: "PNVR",
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  try {
    const pool = await sql.connect(config);

    // Extract form data
    const cod_ugt = formData.get("cod_ugt") as string;
    const nombre_proyecto = formData.get("nombre_proyecto") as string;
    const id_grupo = formData.get("id_grupo")
      ? parseInt(formData.get("id_grupo") as string)
      : null;
    const id_tipo_intervencion = formData.get("id_tipo_intervencion")
      ? parseInt(formData.get("id_tipo_intervencion") as string)
      : null;
    const id_programa_presupuestal = formData.get("id_programa_presupuestal")
      ? parseInt(formData.get("id_programa_presupuestal") as string)
      : null;
    const id_tipo_fenomeno = formData.get("id_tipo_fenomeno")
      ? parseInt(formData.get("id_tipo_fenomeno") as string)
      : null;
    const id_tipo_material = formData.get("id_tipo_material")
      ? parseInt(formData.get("id_tipo_material") as string)
      : null;
    const id_estado = formData.get("id_estado")
      ? parseInt(formData.get("id_estado") as string)
      : null;
    const id_sub_estado = formData.get("id_sub_estado")
      ? parseInt(formData.get("id_sub_estado") as string)
      : null;
    const id_priorizacion = formData.get("id_priorizacion")
      ? parseInt(formData.get("id_priorizacion") as string)
      : null;
    const id_tipo_meta = formData.get("id_tipo_meta")
      ? parseInt(formData.get("id_tipo_meta") as string)
      : null;
    const id_ubicacion = formData.get("id_ubicacion")
      ? parseInt(formData.get("id_ubicacion") as string)
      : null;
    const fecha_convenio = formData.get("fecha_convenio") as string | null;
    const fecha_transferencia = formData.get("fecha_transferencia") as
      | string
      | null;
    const fecha_limite_inicio = formData.get("fecha_limite_inicio") as
      | string
      | null;
    const fecha_inicio = formData.get("fecha_inicio") as string | null;
    const plazo_ejecucion = formData.get("plazo_ejecucion")
      ? parseInt(formData.get("plazo_ejecucion") as string)
      : null;
    const dias_paralizados = formData.get("dias_paralizados")
      ? parseInt(formData.get("dias_paralizados") as string)
      : null;
    const dias_ampliacion = formData.get("dias_ampliacion")
      ? parseInt(formData.get("dias_ampliacion") as string)
      : null;
    const fecha_termino = formData.get("fecha_termino") as string | null;
    const fecha_acta_termino = formData.get("fecha_acta_termino") as
      | string
      | null;
    const motivo_atraso = formData.get("motivo_atraso") as string | null;
    const accion_mitigacion = formData.get("accion_mitigacion") as
      | string
      | null;
    const fecha_inicio_estimada = formData.get("fecha_inicio_estimada") as
      | string
      | null;
    const fecha_termino_estimada = formData.get("fecha_termino_estimada") as
      | string
      | null;
    const anio_intervencion = formData.get("anio_intervencion")
      ? parseInt(formData.get("anio_intervencion") as string)
      : null;

    // File handling (optional, assuming no file uploads based on schema)
    // If files are needed, you can add similar logic as the original for uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const request = pool.request();
    request
      .input("cod_ugt", sql.NVarChar(50), cod_ugt)
      .input("nombre_proyecto", sql.NVarChar(255), nombre_proyecto)
      .input("id_grupo", sql.Int, id_grupo)
      .input("id_tipo_intervencion", sql.Int, id_tipo_intervencion)
      .input("id_programa_presupuestal", sql.Int, id_programa_presupuestal)
      .input("id_tipo_fenomeno", sql.Int, id_tipo_fenomeno)
      .input("id_tipo_material", sql.Int, id_tipo_material)
      .input("id_estado", sql.Int, id_estado)
      .input("id_sub_estado", sql.Int, id_sub_estado)
      .input("id_priorizacion", sql.Int, id_priorizacion)
      .input("id_tipo_meta", sql.Int, id_tipo_meta)
      .input("id_ubicacion", sql.Int, id_ubicacion)
      .input("fecha_convenio", sql.Date, fecha_convenio)
      .input("fecha_transferencia", sql.Date, fecha_transferencia)
      .input("fecha_limite_inicio", sql.Date, fecha_limite_inicio)
      .input("fecha_inicio", sql.Date, fecha_inicio)
      .input("plazo_ejecucion", sql.Int, plazo_ejecucion)
      .input("dias_paralizados", sql.Int, dias_paralizados)
      .input("dias_ampliacion", sql.Int, dias_ampliacion)
      .input("fecha_termino", sql.Date, fecha_termino)
      .input("fecha_acta_termino", sql.Date, fecha_acta_termino)
      .input("motivo_atraso", sql.NVarChar(1000), motivo_atraso)
      .input("accion_mitigacion", sql.NVarChar(1000), accion_mitigacion)
      .input("fecha_inicio_estimada", sql.Date, fecha_inicio_estimada)
      .input("fecha_termino_estimada", sql.Date, fecha_termino_estimada)
      .input("anio_intervencion", sql.Int, anio_intervencion);

    const result = await request.query(`
      INSERT INTO [PNVR].[dbo].[Convenios] (
        cod_ugt, nombre_proyecto, id_grupo, id_tipo_intervencion, id_programa_presupuestal,
        id_tipo_fenomeno, id_tipo_material, id_estado, id_sub_estado, id_priorizacion,
        id_tipo_meta, id_ubicacion, fecha_convenio, fecha_transferencia, fecha_limite_inicio,
        fecha_inicio, plazo_ejecucion, dias_paralizados, dias_ampliacion, fecha_termino,
        fecha_acta_termino, motivo_atraso, accion_mitigacion, fecha_inicio_estimada,
        fecha_termino_estimada, anio_intervencion
      ) OUTPUT INSERTED.* VALUES (
        @cod_ugt, @nombre_proyecto, @id_grupo, @id_tipo_intervencion, @id_programa_presupuestal,
        @id_tipo_fenomeno, @id_tipo_material, @id_estado, @id_sub_estado, @id_priorizacion,
        @id_tipo_meta, @id_ubicacion, @fecha_convenio, @fecha_transferencia, @fecha_limite_inicio,
        @fecha_inicio, @plazo_ejecucion, @dias_paralizados, @dias_ampliacion, @fecha_termino,
        @fecha_acta_termino, @motivo_atraso, @accion_mitigacion, @fecha_inicio_estimada,
        @fecha_termino_estimada, @anio_intervencion
      )
    `);

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create convenio", details: errorMessage },
      { status: 500 }
    );
  }
}