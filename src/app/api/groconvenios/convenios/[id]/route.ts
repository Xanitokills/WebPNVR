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
        FROM [${envVars.DB_NAME}].[dbo].[convenio_personal] cp
        JOIN [${envVars.DB_NAME}].[dbo].[personal] p ON cp.id_personal = p.id_personal
        JOIN [${envVars.DB_NAME}].[dbo].[cargo] ca ON cp.id_cargo = ca.id_cargo
        WHERE cp.id_convenio = @id_convenio
      `);

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

// Mantener el resto de los métodos (PUT, etc.) tal como están
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  const body = await request.json();

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  if (!body.nombre_Convenio) {
    return NextResponse.json({ error: "Nombre Convenio is required" }, { status: 400 });
  }

  const envVars = validateEnvVars();
  if (envVars instanceof NextResponse) return envVars;

  try {
    const pool = await sql.connect(getDbConfig(envVars));
    const request = pool.request();

    // Verificar si el convenio existe y no está finalizado
    const checkQuery = `
      SELECT id_estado FROM [${envVars.DB_NAME}].[dbo].[Convenios] WHERE id_convenio = @id
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

    // Preparar inputs
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

    // Construir la consulta de actualización dinámicamente
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
      UPDATE [${envVars.DB_NAME}].[dbo].[Convenios]
      SET ${updates.join(", ")}
      OUTPUT INSERTED.*
      WHERE id_convenio = @id_convenio
    `;
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Convenio not found" }, { status: 404 });
    }

    // Actualizar las asignaciones de personal
    if (body.personal_asignado && Array.isArray(body.personal_asignado)) {
      // Eliminar asignaciones existentes (opcional, dependiendo de la lógica deseada)
      await pool.request()
        .input("id_convenio", sql.NVarChar(50), id)
        .query(`
          DELETE FROM [${envVars.DB_NAME}].[dbo].[convenio_personal]
          WHERE id_convenio = @id_convenio
        `);

      // Insertar nuevas asignaciones
      for (const asignacion of body.personal_asignado) {
        const cargoResult = await pool.request()
          .input("descripcion", sql.NVarChar(255), asignacion.cargo)
          .query(`
            SELECT id_cargo FROM [${envVars.DB_NAME}].[dbo].[cargo]
            WHERE descripcion = @descripcion
          `);

        if (cargoResult.recordset.length === 0) {
          return NextResponse.json(
            { error: `Cargo ${asignacion.cargo} not found` },
            { status: 400 }
          );
        }

        const id_cargo = cargoResult.recordset[0].id_cargo;

        await pool.request()
          .input("id_convenio", sql.NVarChar(50), id)
          .input("id_personal", sql.Int, asignacion.id_persona)
          .input("id_cargo", sql.Int, id_cargo)
          .input("fecha_inicio", sql.Date, new Date(asignacion.fecha_inicio))
          .input("fecha_fin", sql.Date, asignacion.fecha_fin ? new Date(asignacion.fecha_fin) : null)
          .query(`
            INSERT INTO [${envVars.DB_NAME}].[dbo].[convenio_personal]
            (id_convenio, id_personal, id_cargo, fecha_inicio, fecha_fin)
            VALUES (@id_convenio, @id_personal, @id_cargo, @fecha_inicio, @fecha_fin)
          `);
      }
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