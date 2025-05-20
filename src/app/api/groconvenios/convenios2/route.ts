
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
      SELECT [NombreProyecto]
            ,[Localidad]
            ,[Distrito]
            ,[Provincia]
            ,[Departamento]
            ,[Entidad]
            ,[Programa]
            ,[Proyectista]
            ,[Evaluador]
            ,[PresupuestoBase]
            ,[PresupuestoFinanciamiento]
            ,[AporteBeneficiario]
            ,[SimboloMonetario]
            ,[IGV]
            ,[PlazoEjecucionMeses]
            ,[PlazoEjecucionDias]
            ,[NumeroBeneficiarios]
            ,[CreadoEn]
            ,[ActualizadoEn]
      FROM [PNVR].[dbo].[Convenio]
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
    const nombreProyecto = formData.get("NombreProyecto") as string;
    const localidad = formData.get("Localidad") as string | null;
    const distrito = formData.get("Distrito") as string | null;
    const provincia = formData.get("Provincia") as string | null;
    const departamento = formData.get("Departamento") as string | null;
    const entidad = formData.get("Entidad") as string | null;
    const programa = formData.get("Programa") as string | null;
    const proyectista = formData.get("Proyectista") as string | null;
    const evaluador = formData.get("Evaluador") as string | null;
    const presupuestoBase = formData.get("PresupuestoBase")
      ? parseFloat(formData.get("PresupuestoBase") as string)
      : null;
    const presupuestoFinanciamiento = formData.get("PresupuestoFinanciamiento")
      ? parseFloat(formData.get("PresupuestoFinanciamiento") as string)
      : null;
    const aporteBeneficiario = formData.get("AporteBeneficiario")
      ? parseFloat(formData.get("AporteBeneficiario") as string)
      : null;
    const simboloMonetario = formData.get("SimboloMonetario") as string | null;
    const igv = formData.get("IGV")
      ? parseFloat(formData.get("IGV") as string)
      : null;
    const plazoEjecucionMeses = formData.get("PlazoEjecucionMeses")
      ? parseInt(formData.get("PlazoEjecucionMeses") as string)
      : null;
    const plazoEjecucionDias = formData.get("PlazoEjecucionDias")
      ? parseInt(formData.get("PlazoEjecucionDias") as string)
      : null;
    const numeroBeneficiarios = formData.get("NumeroBeneficiarios")
      ? parseInt(formData.get("NumeroBeneficiarios") as string)
      : null;

    // Use current date and time for CreadoEn and ActualizadoEn
    const currentDate = new Date().toISOString();

    const request = pool.request();
    request
      .input("NombreProyecto", sql.NVarChar(500), nombreProyecto)
      .input("Localidad", sql.NVarChar(255), localidad)
      .input("Distrito", sql.NVarChar(255), distrito)
      .input("Provincia", sql.NVarChar(255), provincia)
      .input("Departamento", sql.NVarChar(255), departamento)
      .input("Entidad", sql.NVarChar(255), entidad)
      .input("Programa", sql.NVarChar(255), programa)
      .input("Proyectista", sql.NVarChar(255), proyectista)
      .input("Evaluador", sql.NVarChar(255), evaluador)
      .input("PresupuestoBase", sql.Decimal(18, 2), presupuestoBase)
      .input("PresupuestoFinanciamiento", sql.Decimal(18, 2), presupuestoFinanciamiento)
      .input("AporteBeneficiario", sql.Decimal(18, 2), aporteBeneficiario)
      .input("SimboloMonetario", sql.NVarChar(10), simboloMonetario)
      .input("IGV", sql.Decimal(5, 2), igv)
      .input("PlazoEjecucionMeses", sql.Int, plazoEjecucionMeses)
      .input("PlazoEjecucionDias", sql.Int, plazoEjecucionDias)
      .input("NumeroBeneficiarios", sql.Int, numeroBeneficiarios)
      .input("CreadoEn", sql.DateTime, currentDate)
      .input("ActualizadoEn", sql.DateTime, currentDate);

    const result = await request.query(`
      INSERT INTO [PNVR].[dbo].[Convenio] (
        NombreProyecto, Localidad, Distrito, Provincia, Departamento, Entidad, Programa,
        Proyectista, Evaluador, PresupuestoBase, PresupuestoFinanciamiento, AporteBeneficiario,
        SimboloMonetario, IGV, PlazoEjecucionMeses, PlazoEjecucionDias, NumeroBeneficiarios,
        CreadoEn, ActualizadoEn
      ) OUTPUT INSERTED.*
      VALUES (
        @NombreProyecto, @Localidad, @Distrito, @Provincia, @Departamento, @Entidad, @Programa,
        @Proyectista, @Evaluador, @PresupuestoBase, @PresupuestoFinanciamiento, @AporteBeneficiario,
        @SimboloMonetario, @IGV, @PlazoEjecucionMeses, @PlazoEjecucionDias, @NumeroBeneficiarios,
        @CreadoEn, @ActualizadoEn
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


