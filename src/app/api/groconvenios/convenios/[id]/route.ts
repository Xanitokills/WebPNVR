import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id; // No usar parseInt, mantener como string
  const body = await request.json();

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

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
      { error: `Missing required environment variables: ${missingEnvVars.join(", ")}` },
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
    const request = pool.request();

    // Check if convenio exists and is not finalized
    const checkQuery = `
      SELECT id_estado FROM [PNVR].[dbo].[Convenios] WHERE id_convenio = @id
    `;
    request.input("id", sql.NVarChar(50), id); // Usar NVarChar para id_convenio
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
    if (body.cod_ugt !== undefined)
      request.input("cod_ugt", sql.NVarChar(50), body.cod_ugt);
    if (body.nombre_proyecto !== undefined)
      request.input("nombre_proyecto", sql.NVarChar(255), body.nombre_proyecto);
    if (body.fecha_inicio !== undefined)
      request.input("fecha_inicio", sql.Date, body.fecha_inicio ? new Date(body.fecha_inicio) : null);
    if (body.fecha_termino !== undefined)
      request.input("fecha_termino", sql.Date, body.fecha_termino ? new Date(body.fecha_termino) : null);
    if (body.anio_intervencion !== undefined)
      request.input("anio_intervencion", sql.Int, body.anio_intervencion);
    if (body.id_estado !== undefined)
      request.input("id_estado", sql.Int, body.id_estado);

    // Dynamically construct the update query
    const updates = [];
    if (body.cod_ugt !== undefined) updates.push("cod_ugt = @cod_ugt");
    if (body.nombre_proyecto !== undefined) updates.push("nombre_proyecto = @nombre_proyecto");
    if (body.fecha_inicio !== undefined) updates.push("fecha_inicio = @fecha_inicio");
    if (body.fecha_termino !== undefined) updates.push("fecha_termino = @fecha_termino");
    if (body.anio_intervencion !== undefined) updates.push("anio_intervencion = @anio_intervencion");
    if (body.id_estado !== undefined) updates.push("id_estado = @id_estado");

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE [PNVR].[dbo].[Convenios]
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