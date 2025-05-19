import { NextResponse } from "next/server";
import sql from "mssql";

export async function GET() {
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
    const result = await pool.request().query(`
      SELECT 
        c.id_convocatoria,
        c.id_tipo,
        c.codigo_seace,
        c.titulo,
        c.descripcion,
        c.presupuesto,
        c.fecha_publicacion,
        c.fecha_limite_ofertas,
        c.fecha_estimada_adjudicacion,
        c.duracion_contrato,
        c.created_at,
        c.vigencia,
        c.pdf_file_path,
        c.word_file_path,
        c.id_estado_convocatoria,
        ec.descripcion AS estado_convocatoria,
        i.id_item_convocatoria,
        i.descripcion AS item_descripcion,
        i.id_tipo_item_convocatoria,
        c.cantidad,
        i.id_tipo_unidad_medida,
        d.id_documento,
        d.nombre AS documento_nombre,
        d.tipo AS documento_tipo,
        d.formato,
        d.ruta_archivo,
        d.version AS documento_version,
        v.id_validacion,
        v.nivel_validacion,
        v.estado AS validacion_estado,
        v.usuario_validador,
        v.fecha_validacion,
        v.comentarios AS validacion_comentarios
      FROM [PNVR].[dbo].[convocatoria] c 
      INNER JOIN [PNVR].[dbo].[Estado_Convocatoria] ec 
        ON c.id_estado_convocatoria = ec.id_estado_convocatoria
      LEFT JOIN [PNVR].[dbo].[Item_Convocatoria2] i 
        ON c.id_convocatoria = i.id_item_convocatoria
      LEFT JOIN [PNVR].[dbo].[Documento] d 
        ON c.id_convocatoria = d.id_convocatoria
      LEFT JOIN [PNVR].[dbo].[Validacion_Bases] v 
        ON d.id_documento = v.id_documento
      WHERE d.tipo = 'Bases' OR d.tipo IS NULL
    `);

    // Agrupar datos para evitar duplicados
    const convocatoriasMap = new Map();
    result.recordset.forEach(row => {
      if (!convocatoriasMap.has(row.id_convocatoria)) {
        convocatoriasMap.set(row.id_convocatoria, {
          id_convocatoria: row.id_convocatoria,
          id_tipo: row.id_tipo,
          codigo_seace: row.codigo_seace,
          titulo: row.titulo,
          descripcion: row.descripcion,
          presupuesto: row.presupuesto,
          fecha_publicacion: row.fecha_publicacion,
          fecha_limite_ofertas: row.fecha_limite_ofertas,
          fecha_estimada_adjudicacion: row.fecha_estimada_adjudicacion,
          duracion_contrato: row.duracion_contrato,
          created_at: row.created_at,
          vigencia: row.vigencia,
          pdf_file_path: row.pdf_file_path,
          word_file_path: row.word_file_path,
          id_estado_convocatoria: row.id_estado_convocatoria,
          estado_convocatoria: row.estado_convocatoria,
          cantidad: row.cantidad,
          items: [],
          documentos: [],
        });
      }
      const convocatoria = convocatoriasMap.get(row.id_convocatoria);
      if (row.id_item_convocatoria) {
        convocatoria.items.push({
          id_item_convocatoria: row.id_item_convocatoria,
          descripcion: row.item_descripcion,
          id_tipo_item_convocatoria: row.id_tipo_item_convocatoria,
          id_tipo_unidad_medida: row.id_tipo_unidad_medida,
        });
      }
      if (row.id_documento) {
        let documento = convocatoria.documentos.find(d => d.id_documento === row.id_documento);
        if (!documento) {
          documento = {
            id_documento: row.id_documento,
            nombre: row.documento_nombre,
            tipo: row.documento_tipo,
            formato: row.formato,
            ruta_archivo: row.ruta_archivo,
            version: row.documento_version,
            validaciones: [],
          };
          convocatoria.documentos.push(documento);
        }
        if (row.id_validacion) {
          documento.validaciones.push({
            id_validacion: row.id_validacion,
            nivel_validacion: row.nivel_validacion,
            estado: row.validacion_estado,
            usuario_validador: row.usuario_validador,
            fecha_validacion: row.fecha_validacion,
            comentarios: row.validacion_comentarios,
          });
        }
      }
    });

    return NextResponse.json(Array.from(convocatoriasMap.values()));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "No se pudo obtener las convocatorias", details: errorMessage },
      { status: 500 }
    );
  }
}