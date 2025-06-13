// api/convocatoria/[id]/routes.ts
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = parseInt(params.id);
  const body = await request.json();

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const variablesRequeridas = {
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SERVER: process.env.DB_SERVER,
  };

  const variablesFaltantes = Object.entries(variablesRequeridas)
    .filter(([, valor]) => !valor)
    .map(([clave]) => clave);

  if (variablesFaltantes.length > 0) {
    return NextResponse.json(
      { error: `Faltan las siguientes variables de entorno: ${variablesFaltantes.join(", ")}` },
      { status: 500 }
    );
  }

  const configuracion = {
    user: variablesRequeridas.DB_USER as string,
    password: variablesRequeridas.DB_PASSWORD as string,
    server: variablesRequeridas.DB_SERVER as string,
    database: "PNVR",
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  try {
    const pool = await sql.connect(configuracion);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Actualizar Convocatoria
      const updatesConvocatoria = [];
      const requestConvocatoria = new sql.Request(transaction);
      requestConvocatoria.input("id", sql.Int, id);
      if (body.titulo !== undefined) {
        requestConvocatoria.input("titulo", sql.NVarChar(255), body.titulo);
        updatesConvocatoria.push("titulo = @titulo");
      }
      if (body.descripcion !== undefined) {
        requestConvocatoria.input("descripcion", sql.NVarChar(1000), body.descripcion);
        updatesConvocatoria.push("descripcion = @descripcion");
      }
      if (body.fecha_inicio !== undefined) {
        requestConvocatoria.input("fecha_inicio", sql.Date, body.fecha_inicio);
        updatesConvocatoria.push("fecha_inicio = @fecha_inicio");
      }
      if (body.fecha_fin !== undefined) {
        requestConvocatoria.input("fecha_fin", sql.Date, body.fecha_fin);
        updatesConvocatoria.push("fecha_fin = @fecha_fin");
      }
      if (body.vigencia !== undefined) {
        requestConvocatoria.input("vigencia", sql.Int, body.vigencia);
        updatesConvocatoria.push("vigencia = @vigencia");
      }
      if (body.id_Estado_Convocatoria !== undefined) {
        requestConvocatoria.input("id_Estado_Convocatoria", sql.Int, body.id_Estado_Convocatoria);
        updatesConvocatoria.push("id_Estado_Convocatoria = @id_Estado_Convocatoria");
      }

      if (updatesConvocatoria.length > 0) {
        const queryConvocatoria = `
          UPDATE [PNVR].[dbo].[PNVR_Convocatoria] 
          SET ${updatesConvocatoria.join(", ")} 
          OUTPUT INSERTED.* 
          WHERE id_convocatoria = @id
        `;
        const resultConvocatoria = await requestConvocatoria.query(queryConvocatoria);
        if (resultConvocatoria.recordset.length === 0) {
          throw new Error("Convocatoria no encontrada");
        }
      }

      // Actualizar Item_Convocatoria
      if (body.items && Array.isArray(body.items)) {
        for (const item of body.items) {
          if (item.id_item) {
            const requestItem = new sql.Request(transaction);
            requestItem.input("id_item", sql.Int, item.id_item);
            requestItem.input("descripcion", sql.NVarChar(1000), item.descripcion);
            requestItem.input("tipo_material", sql.NVarChar(100), item.tipo_material);
            requestItem.input("cantidad", sql.Int, item.cantidad);
            requestItem.input("unidad_medida", sql.NVarChar(50), item.unidad_medida);
            requestItem.input("precio_referencial", sql.Decimal(15, 2), item.precio_referencial);
            requestItem.input("especificaciones_tecnicas", sql.NVarChar(sql.MAX), item.especificaciones_tecnicas);
            await requestItem.query(`
              UPDATE [PNVR].[dbo].[PNVR_Item_Convocatoria]
              SET descripcion = @descripcion,
                  tipo_material = @tipo_material,
                  cantidad = @cantidad,
                  unidad_medida = @unidad_medida,
                  precio_referencial = @precio_referencial,
                  especificaciones_tecnicas = @especificaciones_tecnicas
              WHERE id_item = @id_item
            `);
          }
        }
      }

      // Actualizar Validacion_Bases
      if (body.documentos && Array.isArray(body.documentos)) {
        for (const documento of body.documentos) {
          if (documento.validaciones && Array.isArray(documento.validaciones)) {
            for (const validacion of documento.validaciones) {
              if (validacion.id_validacion) {
                const requestValidacion = new sql.Request(transaction);
                requestValidacion.input("id_validacion", sql.Int, validacion.id_validacion);
                requestValidacion.input("estado", sql.NVarChar(20), validacion.estado);
                requestValidacion.input("usuario_validador", sql.NVarChar(100), validacion.usuario_validador);
                requestValidacion.input("comentarios", sql.NVarChar(sql.MAX), validacion.comentarios);
                await requestValidacion.query(`
                  UPDATE [PNVR].[dbo].[PNVR_Validacion_Bases]
                  SET estado = @estado,
                      usuario_validador = @usuario_validador,
                      comentarios = @comentarios,
                      fecha_validacion = GETDATE()
                  WHERE id_validacion = @id_validacion
                `);
              }
            }
          }
        }
      }

      await transaction.commit();
      return NextResponse.json({ message: "Datos actualizados correctamente" });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "No se pudo actualizar los datos", details: errorMessage },
      { status: 500 }
    );
  }
}