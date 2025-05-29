import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id; // Keep as string
  const body = await request.json();

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  // Validate mandatory fields
  if (!body.nombre_Convenio) {
    return NextResponse.json({ error: "Nombre Convenio is required" }, { status: 400 });
  }

  const requiredEnvVars = {
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SERVER: process.env.DB_SERVER,
    DB_NAME: process.env.DB_NAME,
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

  const config = {
    user: requiredEnvVars.DB_USER as string,
    password: requiredEnvVars.DB_PASSWORD as string,
    server: requiredEnvVars.DB_SERVER as string,
    database: requiredEnvVars.DB_NAME as string,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    // Check if convenio exists and is not finalized
    const checkQuery = `
      SELECT id_estado FROM [${requiredEnvVars.DB_NAME}].[dbo].[Convenios] WHERE id_convenio = @id
    `;
    request.input("id", sql.NVarChar(50), id);
    const checkResult = await request.query(checkQuery);

    if (checkResult.recordset.length === 0) {
      return NextResponse.json({ error: "Convenio not found" }, { status: 404 });
    }

    if (checkResult.recordset[0].id_estado === 3) {
      return NextResponse.json(
        { error: "Cannot edit a finalized convenio" },
        { status: 400 }
      );
    }

    // Prepare inputs
    request.input("id_convenio", sql.NVarChar(50), id);
    if (body.cod_ugt !== undefined) request.input("cod_ugt", sql.NVarChar(50), body.cod_ugt);
    if (body.cod_Convenio !== undefined) request.input("cod_Convenio", sql.NVarChar(50), body.cod_Convenio);
    if (body.nombre_Convenio !== undefined) request.input("nombre_Convenio", sql.NVarChar(255), body.nombre_Convenio);
    if (body.id_grupo !== undefined) request.input("id_grupo", sql.Int, body.id_grupo);
    if (body.id_tipo_intervencion !== undefined) request.input("id_tipo_intervencion", sql.Int, body.id_tipo_intervencion);
    if (body.id_programa_presupuestal !== undefined) request.input("id_programa_presupuestal", sql.Int, body.id_programa_presupuestal);
    if (body.id_tipo_fenomeno !== undefined) request.input("id_tipo_fenomeno", sql.Int, body.id_tipo_fenomeno);
    if (body.id_tipo_material !== undefined) request.input("id_tipo_material", sql.Int, body.id_tipo_material);
    if (body.id_estado !== undefined) request.input("id_estado", sql.Int, body.id_estado);
    if (body.id_sub_estado !== undefined) request.input("id_sub_estado", sql.Int, body.id_sub_estado);
    if (body.id_priorizacion !== undefined) request.input("id_priorizacion", sql.Int, body.id_priorizacion);
    if (body.id_tipo_meta !== undefined) request.input("id_tipo_meta", sql.Int, body.id_tipo_meta);
    if (body.id_Localidad !== undefined) request.input("id_Localidad", sql.Int, body.id_Localidad);
    if (body.id_Distrito !== undefined) request.input("id_Distrito", sql.Int, body.id_Distrito);
    if (body.id_Provincia !== undefined) request.input("id_Provincia", sql.Int, body.id_Provincia);
    if (body.id_Departamento !== undefined) request.input("id_Departamento", sql.Int, body.id_Departamento);
    if (body.fecha_Convenios !== undefined) request.input("fecha_Convenios", sql.Date, body.fecha_Convenios ? new Date(body.fecha_Convenios) : null);
    if (body.fecha_transferencia !== undefined) request.input("fecha_transferencia", sql.Date, body.fecha_transferencia ? new Date(body.fecha_transferencia) : null);
    if (body.fecha_limite_inicio !== undefined) request.input("fecha_limite_inicio", sql.Date, body.fecha_limite_inicio ? new Date(body.fecha_limite_inicio) : null);
    if (body.fecha_inicio !== undefined) request.input("fecha_inicio", sql.Date, body.fecha_inicio ? new Date(body.fecha_inicio) : null);
    if (body.plazo_ejecucion !== undefined) request.input("plazo_ejecucion", sql.Int, body.plazo_ejecucion);
    if (body.dias_paralizados !== undefined) request.input("dias_paralizados", sql.Int, body.dias_paralizados);
    if (body.dias_ampliacion !== undefined) request.input("dias_ampliacion", sql.Int, body.dias_ampliacion);
    if (body.fecha_termino !== undefined) request.input("fecha_termino", sql.Date, body.fecha_termino ? new Date(body.fecha_termino) : null);
    if (body.fecha_acta_termino !== undefined) request.input("fecha_acta_termino", sql.Date, body.fecha_acta_termino ? new Date(body.fecha_acta_termino) : null);
    if (body.motivo_atraso !== undefined) request.input("motivo_atraso", sql.NVarChar(255), body.motivo_atraso);
    if (body.accion_mitigacion !== undefined) request.input("accion_mitigacion", sql.NVarChar(255), body.accion_mitigacion);
    if (body.fecha_inicio_estimada !== undefined) request.input("fecha_inicio_estimada", sql.Date, body.fecha_inicio_estimada ? new Date(body.fecha_inicio_estimada) : null);
    if (body.fecha_termino_estimada !== undefined) request.input("fecha_termino_estimada", sql.Date, body.fecha_termino_estimada ? new Date(body.fecha_termino_estimada) : null);
    if (body.anio_intervencion !== undefined) request.input("anio_intervencion", sql.Int, body.anio_intervencion);
    if (body.Entidad !== undefined) request.input("Entidad", sql.NVarChar(255), body.Entidad);
    if (body.Programa !== undefined) request.input("Programa", sql.NVarChar(255), body.Programa);
    if (body.Proyectista !== undefined) request.input("Proyectista", sql.NVarChar(255), body.Proyectista);
    if (body.Evaluador !== undefined) request.input("Evaluador", sql.NVarChar(255), body.Evaluador);
    if (body.PresupuestoBase !== undefined) request.input("PresupuestoBase", sql.Decimal(18, 2), body.PresupuestoBase);
    if (body.PresupuestoFinanciamiento !== undefined) request.input("PresupuestoFinanciamiento", sql.Decimal(18, 2), body.PresupuestoFinanciamiento);
    if (body.AporteBeneficiario !== undefined) request.input("AporteBeneficiario", sql.Decimal(18, 2), body.AporteBeneficiario);
    if (body.SimboloMonetario !== undefined) request.input("SimboloMonetario", sql.NVarChar(10), body.SimboloMonetario);
    if (body.IGV !== undefined) request.input("IGV", sql.Decimal(18, 2), body.IGV);
    if (body.PlazoEjecucionMeses !== undefined) request.input("PlazoEjecucionMeses", sql.Int, body.PlazoEjecucionMeses);
    if (body.PlazoEjecucionDias !== undefined) request.input("PlazoEjecucionDias", sql.Int, body.PlazoEjecucionDias);
    if (body.NumeroBeneficiarios !== undefined) request.input("NumeroBeneficiarios", sql.Int, body.NumeroBeneficiarios);

    // Dynamically construct the update query
    const updates = [];
    if (body.cod_ugt !== undefined) updates.push("cod_ugt = @cod_ugt");
    if (body.cod_Convenio !== undefined) updates.push("cod_Convenio = @cod_Convenio");
    if (body.nombre_Convenio !== undefined) updates.push("nombre_Convenio = @nombre_Convenio");
    if (body.id_grupo !== undefined) updates.push("id_grupo = @id_grupo");
    if (body.id_tipo_intervencion !== undefined) updates.push("id_tipo_intervencion = @id_tipo_intervencion");
    if (body.id_programa_presupuestal !== undefined) updates.push("id_programa_presupuestal = @id_programa_presupuestal");
    if (body.id_tipo_fenomeno !== undefined) updates.push("id_tipo_fenomeno = @id_tipo_fenomeno");
    if (body.id_tipo_material !== undefined) updates.push("id_tipo_material = @id_tipo_material");
    if (body.id_estado !== undefined) updates.push("id_estado = @id_estado");
    if (body.id_sub_estado !== undefined) updates.push("id_sub_estado = @id_sub_estado");
    if (body.id_priorizacion !== undefined) updates.push("id_priorizacion = @id_priorizacion");
    if (body.id_tipo_meta !== undefined) updates.push("id_tipo_meta = @id_tipo_meta");
    if (body.id_Localidad !== undefined) updates.push("id_Localidad = @id_Localidad");
    if (body.id_Distrito !== undefined) updates.push("id_Distrito = @id_Distrito");
    if (body.id_Provincia !== undefined) updates.push("id_Provincia = @id_Provincia");
    if (body.id_Departamento !== undefined) updates.push("id_Departamento = @id_Departamento");
    if (body.fecha_Convenios !== undefined) updates.push("fecha_Convenios = @fecha_Convenios");
    if (body.fecha_transferencia !== undefined) updates.push("fecha_transferencia = @fecha_transferencia");
    if (body.fecha_limite_inicio !== undefined) updates.push("fecha_limite_inicio = @fecha_limite_inicio");
    if (body.fecha_inicio !== undefined) updates.push("fecha_inicio = @fecha_inicio");
    if (body.plazo_ejecucion !== undefined) updates.push("plazo_ejecucion = @plazo_ejecucion");
    if (body.dias_paralizados !== undefined) updates.push("dias_paralizados = @dias_paralizados");
    if (body.dias_ampliacion !== undefined) updates.push("dias_ampliacion = @dias_ampliacion");
    if (body.fecha_termino !== undefined) updates.push("fecha_termino = @fecha_termino");
    if (body.fecha_acta_termino !== undefined) updates.push("fecha_acta_termino = @fecha_acta_termino");
    if (body.motivo_atraso !== undefined) updates.push("motivo_atraso = @motivo_atraso");
    if (body.accion_mitigacion !== undefined) updates.push("accion_mitigacion = @accion_mitigacion");
    if (body.fecha_inicio_estimada !== undefined) updates.push("fecha_inicio_estimada = @fecha_inicio_estimada");
    if (body.fecha_termino_estimada !== undefined) updates.push("fecha_termino_estimada = @fecha_termino_estimada");
    if (body.anio_intervencion !== undefined) updates.push("anio_intervencion = @anio_intervencion");
    if (body.Entidad !== undefined) updates.push("Entidad = @Entidad");
    if (body.Programa !== undefined) updates.push("Programa = @Programa");
    if (body.Proyectista !== undefined) updates.push("Proyectista = @Proyectista");
    if (body.Evaluador !== undefined) updates.push("Evaluador = @Evaluador");
    if (body.PresupuestoBase !== undefined) updates.push("PresupuestoBase = @PresupuestoBase");
    if (body.PresupuestoFinanciamiento !== undefined) updates.push("PresupuestoFinanciamiento = @PresupuestoFinanciamiento");
    if (body.AporteBeneficiario !== undefined) updates.push("AporteBeneficiario = @AporteBeneficiario");
    if (body.SimboloMonetario !== undefined) updates.push("SimboloMonetario = @SimboloMonetario");
    if (body.IGV !== undefined) updates.push("IGV = @IGV");
    if (body.PlazoEjecucionMeses !== undefined) updates.push("PlazoEjecucionMeses = @PlazoEjecucionMeses");
    if (body.PlazoEjecucionDias !== undefined) updates.push("PlazoEjecucionDias = @PlazoEjecucionDias");
    if (body.NumeroBeneficiarios !== undefined) updates.push("NumeroBeneficiarios = @NumeroBeneficiarios");

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE [${requiredEnvVars.DB_NAME}].[dbo].[Convenios]
      SET ${updates.join(", ")}
      OUTPUT INSERTED.*
      WHERE id_convenio = @id_convenio
    `;
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Convenio not found" }, { status: 404 });
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update convenio", details: errorMessage },
      { status: 500 }
    );
  }
}