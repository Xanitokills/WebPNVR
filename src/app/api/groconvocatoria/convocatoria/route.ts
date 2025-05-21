<<<<<<< HEAD:src/app/api/convocatoria/route.ts
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
        c.id_convenio,
        c.id_tipo,
        c.codigo_seace,
        c.titulo,
        c.descripcion,
        c.presupuesto,
        c.fecha_publicacion,
        c.fecha_fin_publicacion,
        c.fecha_inicio_ofertas,
        c.fecha_otorgamiento_buena_pro,
        c.fecha_limite_ofertas,
        c.fecha_apertura_sobre,
        c.fecha_estimada_adjudicacion,
        c.duracion_contrato,
        c.created_at,
        c.vigencia,
        c.pdf_file_path,
        c.word_file_path,
        c.id_item_convocatoria,
        c.id_tipo_item_convocatoria,
        c.cantidad,
        c.id_estado,
        c.Anexos,
        c.QR_PATH,
        c.id_convocatoria_documento,
        ec.estado AS estado_convocatoria,
        i.id_item_convocatoria AS item_id_item_convocatoria,
        i.descripcion AS item_descripcion,
        i.id_item_convocatoria AS item_id_tipo_item_convocatoria,
        i.id_unidad_medida AS id_tipo_unidad_medida,
        cd.id_convocatoria_documento,
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
      FROM [PNVR].[dbo].[Convocatoria] c 
      INNER JOIN [PNVR].[dbo].[Estado_Convocatoria] ec 
        ON c.id_estado = ec.id_estado
      LEFT JOIN [PNVR].[dbo].[Item_Convocatoria] i 
        ON c.id_item_convocatoria = i.id_item_convocatoria
      LEFT JOIN [PNVR].[dbo].[convocatoria_documento] cd 
        ON c.id_convocatoria_documento = cd.id_convocatoria_documento
      LEFT JOIN [PNVR].[dbo].[documento] d 
        ON d.id_documento = cd.id_documento
      LEFT JOIN [PNVR].[dbo].[Validacion_Bases] v 
        ON d.id_documento = v.id_documento
      WHERE d.tipo = 'Bases' OR d.tipo IS NULL
    `);

    const convocatoriasMap = new Map();
    result.recordset.forEach((row) => {
      if (!convocatoriasMap.has(row.id_convocatoria)) {
        convocatoriasMap.set(row.id_convocatoria, {
          id_convocatoria: row.id_convocatoria,
          id_convenio: row.id_convenio,
          id_tipo: row.id_tipo,
          codigo_seace: row.codigo_seace,
          titulo: row.titulo,
          descripcion: row.descripcion,
          presupuesto: row.presupuesto,
          fecha_publicacion: row.fecha_publicacion,
          fecha_fin_publicacion: row.fecha_fin_publicacion,
          fecha_inicio_ofertas: row.fecha_inicio_ofertas,
          fecha_otorgamiento_buena_pro: row.fecha_otorgamiento_buena_pro,
          fecha_limite_ofertas: row.fecha_limite_ofertas,
          fecha_apertura_sobre: row.fecha_apertura_sobre,
          fecha_estimada_adjudicacion: row.fecha_estimada_adjudicacion,
          duracion_contrato: row.duracion_contrato,
          created_at: row.created_at,
          vigencia: row.vigencia,
          pdf_file_path: row.pdf_file_path,
          word_file_path: row.word_file_path,
          id_item_convocatoria: row.id_item_convocatoria,
          id_tipo_item_convocatoria: row.id_tipo_item_convocatoria,
          cantidad: row.cantidad,
          id_estado: row.id_estado,
          Anexos: row.Anexos,
          QR_PATH: row.QR_PATH,
          id_convocatoria_documento: row.id_convocatoria_documento,
          estado_convocatoria: row.estado_convocatoria,
          items: [],
          documentos: [],
        });
      }
      const convocatoria = convocatoriasMap.get(row.id_convocatoria);
      if (row.item_id_item_convocatoria) {
        convocatoria.items.push({
          id_item_convocatoria: row.item_id_item_convocatoria,
          descripcion: row.item_descripcion,
          id_tipo_item_convocatoria: row.item_id_tipo_item_convocatoria,
          id_tipo_unidad_medida: row.id_tipo_unidad_medida,
        });
      }
      if (row.id_convocatoria_documento) {
        let documento = convocatoria.documentos.find(
          (d: any) => d.id_convocatoria_documento === row.id_convocatoria_documento
        );
        if (!documento) {
          documento = {
            id_convocatoria_documento: row.id_convocatoria_documento,
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
    if (error instanceof sql.ConnectionError) {
      return NextResponse.json(
        { error: "No se pudo conectar a la base de datos", details: error.message },
        { status: 500 }
      );
    }
    if (error instanceof sql.RequestError) {
      return NextResponse.json(
        { error: "Error en la consulta a la base de datos", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Error desconocido al obtener convocatorias", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    const body = await request.json();
    const {
      id_convenio,
      id_tipo,
      codigo_seace,
      titulo,
      descripcion,
      presupuesto,
      fecha_publicacion,
      fecha_limite_ofertas,
      fecha_estimada_adjudicacion,
      duracion_contrato,
      vigencia,
      pdf_file_path,
      word_file_path,
      id_item_convocatoria,
      id_tipo_item_convocatoria,
      cantidad,
      id_estado,
      fecha_fin_publicacion,
      fecha_apertura_sobre,
      fecha_inicio_ofertas,
      fecha_otorgamiento_buena_pro,
      Anexos,
      QR_PATH,
      id_convocatoria_documento,
    } = body;

    // Validar campos requeridos
    const requiredFields = [
      { field: "id_convenio", value: id_convenio, label: "ID Convenio" },
      { field: "id_tipo", value: id_tipo, label: "Tipo de Convocatoria" },
      { field: "codigo_seace", value: codigo_seace, label: "Código SEACE" },
      { field: "titulo", value: titulo, label: "Título" },
      { field: "descripcion", value: descripcion, label: "Descripción" },
      { field: "presupuesto", value: presupuesto, label: "Presupuesto" },
      { field: "fecha_publicacion", value: fecha_publicacion, label: "Fecha de Publicación" },
      { field: "fecha_limite_ofertas", value: fecha_limite_ofertas, label: "Fecha Límite de Ofertas" },
      { field: "fecha_estimada_adjudicacion", value: fecha_estimada_adjudicacion, label: "Fecha Estimada de Adjudicación" },
      { field: "duracion_contrato", value: duracion_contrato, label: "Duración del Contrato" },
      { field: "id_estado", value: id_estado, label: "Estado" },
    ];
    const missingFields = requiredFields.filter(({ value }) => value === undefined || value === null);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Faltan los siguientes campos requeridos: ${missingFields.map(f => f.label).join(", ")}` },
        { status: 400 }
      );
    }

    // Validar tipos de datos
    if (typeof id_convenio !== "string" || id_convenio.length > 50) {
      return NextResponse.json({ error: "ID Convenio debe ser una cadena de máximo 50 caracteres" }, { status: 400 });
    }
    if (!Number.isInteger(id_tipo) || id_tipo <= 0) {
      return NextResponse.json({ error: "ID Tipo debe ser un número entero positivo" }, { status: 400 });
    }
    if (typeof codigo_seace !== "string" || codigo_seace.length > 50) {
      return NextResponse.json({ error: "Código SEACE debe ser una cadena de máximo 50 caracteres" }, { status: 400 });
    }
    if (typeof titulo !== "string" || titulo.length > 255) {
      return NextResponse.json({ error: "Título debe ser una cadena de máximo 255 caracteres" }, { status: 400 });
    }
    if (typeof descripcion !== "string") {
      return NextResponse.json({ error: "Descripción debe ser una cadena" }, { status: 400 });
    }
    if (typeof presupuesto !== "number" || presupuesto <= 0 || presupuesto > 9999999999999.99) {
      return NextResponse.json({ error: "Presupuesto debe ser un número positivo menor a 9999999999999.99" }, { status: 400 });
    }
    if (!Number.isInteger(duracion_contrato) || duracion_contrato <= 0) {
      return NextResponse.json({ error: "Duración del contrato debe ser un número entero positivo" }, { status: 400 });
    }
    if (!Number.isInteger(id_estado) || id_estado <= 0) {
      return NextResponse.json({ error: "ID Estado debe ser un número entero positivo" }, { status: 400 });
    }
    if (id_item_convocatoria && (!Number.isInteger(id_item_convocatoria) || id_item_convocatoria <= 0)) {
      return NextResponse.json({ error: "ID Ítem de Convocatoria debe ser un número entero positivo" }, { status: 400 });
    }
    if (id_tipo_item_convocatoria && (!Number.isInteger(id_tipo_item_convocatoria) || id_tipo_item_convocatoria <= 0)) {
      return NextResponse.json({ error: "ID Tipo de Ítem de Convocatoria debe ser un número entero positivo" }, { status: 400 });
    }
    if (cantidad && (!Number.isInteger(cantidad) || cantidad <= 0)) {
      return NextResponse.json({ error: "Cantidad debe ser un número entero positivo" }, { status: 400 });
    }

    const pool = await sql.connect(configuracion);

    // Validar claves foráneas
    const convenioResult = await pool
      .request()
      .input("id_convenio", sql.VarChar(50), id_convenio)
      .query("SELECT 1 FROM [PNVR].[dbo].[Convenio] WHERE id_convenio = @id_convenio");
    if (convenioResult.recordset.length === 0) {
      return NextResponse.json({ error: "El ID Convenio proporcionado no existe" }, { status: 400 });
    }

    const tipoResult = await pool
      .request()
      .input("id_tipo", sql.Int, id_tipo)
      .query("SELECT 1 FROM [PNVR].[dbo].[Tipo_Convocatoria] WHERE id_tipo = @id_tipo");
    if (tipoResult.recordset.length === 0) {
      return NextResponse.json({ error: "El ID Tipo proporcionado no existe" }, { status: 400 });
    }

    const estadoResult = await pool
      .request()
      .input("id_estado", sql.Int, id_estado)
      .query("SELECT 1 FROM [PNVR].[dbo].[Estado_Convocatoria] WHERE id_estado = @id_estado");
    if (estadoResult.recordset.length === 0) {
      return NextResponse.json({ error: "El ID Estado proporcionado no existe" }, { status: 400 });
    }

    if (id_item_convocatoria) {
      const itemResult = await pool
        .request()
        .input("id_item_convocatoria", sql.Int, id_item_convocatoria)
        .query("SELECT 1 FROM [PNVR].[dbo].[Item_Convocatoria] WHERE id_item_convocatoria = @id_item_convocatoria");
      if (itemResult.recordset.length === 0) {
        return NextResponse.json({ error: "El ID Ítem de Convocatoria proporcionado no existe" }, { status: 400 });
      }
    }

    if (id_tipo_item_convocatoria) {
      const tipoItemResult = await pool
        .request()
        .input("id_tipo_item_convocatoria", sql.Int, id_tipo_item_convocatoria)
        .query("SELECT 1 FROM [PNVR].[dbo].[Tipo_Item_Convocatoria] WHERE id_tipo_item_convocatoria = @id_tipo_item_convocatoria");
      if (tipoItemResult.recordset.length === 0) {
        return NextResponse.json({ error: "El ID Tipo de Ítem de Convocatoria proporcionado no existe" }, { status: 400 });
      }
    }

    // Validar fechas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(fecha_publicacion) < today) {
      return NextResponse.json({ error: "La fecha de publicación no puede ser anterior a hoy" }, { status: 400 });
    }
    if (new Date(fecha_estimada_adjudicacion) <= new Date(fecha_limite_ofertas)) {
      return NextResponse.json(
        { error: "La fecha estimada de adjudicación debe ser posterior a la fecha límite de ofertas" },
        { status: 400 }
      );
    }
    if (fecha_fin_publicacion && new Date(fecha_fin_publicacion) < new Date(fecha_publicacion)) {
      return NextResponse.json(
        { error: "La fecha de fin de publicación no puede ser anterior a la fecha de publicación" },
        { status: 400 }
      );
    }
    if (fecha_inicio_ofertas && new Date(fecha_inicio_ofertas) < new Date(fecha_publicacion)) {
      return NextResponse.json(
        { error: "La fecha de inicio de ofertas no puede ser anterior a la fecha de publicación" },
        { status: 400 }
      );
    }
    if (fecha_otorgamiento_buena_pro && new Date(fecha_otorgamiento_buena_pro) < new Date(fecha_limite_ofertas)) {
      return NextResponse.json(
        { error: "La fecha de otorgamiento de buena pro no puede ser anterior a la fecha límite de ofertas" },
        { status: 400 }
      );
    }
    if (fecha_apertura_sobre && fecha_inicio_ofertas && new Date(fecha_apertura_sobre) < new Date(fecha_inicio_ofertas)) {
      return NextResponse.json(
        { error: "La fecha de apertura de sobre no puede ser anterior a la fecha de inicio de ofertas" },
        { status: 400 }
      );
    }

    const result = await pool
      .request()
      .input("id_convenio", sql.VarChar(50), id_convenio)
      .input("id_tipo", sql.Int, id_tipo)
      .input("codigo_seace", sql.VarChar(50), codigo_seace)
      .input("titulo", sql.VarChar(255), titulo)
      .input("descripcion", sql.Text, descripcion)
      .input("presupuesto", sql.Decimal(15, 2), presupuesto)
      .input("fecha_publicacion", sql.Date, fecha_publicacion)
      .input("fecha_limite_ofertas", sql.Date, fecha_limite_ofertas)
      .input("fecha_estimada_adjudicacion", sql.Date, fecha_estimada_adjudicacion)
      .input("duracion_contrato", sql.Int, duracion_contrato)
      .input("created_at", sql.DateTime2(7), new Date())
      .input("vigencia", sql.Bit, vigencia)
      .input("pdf_file_path", sql.NVarChar(255), pdf_file_path || null)
      .input("word_file_path", sql.NVarChar(255), word_file_path || null)
      .input("id_item_convocatoria", sql.Int, id_item_convocatoria || null)
      .input("id_tipo_item_convocatoria", sql.Int, id_tipo_item_convocatoria || null)
      .input("cantidad", sql.Int, cantidad || null)
      .input("id_estado", sql.Int, id_estado)
      .input("fecha_fin_publicacion", sql.DateTime, fecha_fin_publicacion || null)
      .input("fecha_apertura_sobre", sql.DateTime, fecha_apertura_sobre || null)
      .input("fecha_inicio_ofertas", sql.DateTime, fecha_inicio_ofertas || null)
      .input("fecha_otorgamiento_buena_pro", sql.DateTime, fecha_otorgamiento_buena_pro || null)
      .input("Anexos", sql.VarChar(200), Anexos || null)
      .input("QR_PATH", sql.VarChar(500), QR_PATH || null)
      .input("id_convocatoria_documento", sql.Int, id_convocatoria_documento || null)
      .query(`
        INSERT INTO [PNVR].[dbo].[Convocatoria]
          ([id_convenio], [id_tipo], [codigo_seace], [titulo], [descripcion], [presupuesto], 
           [fecha_publicacion], [fecha_limite_ofertas], [fecha_estimada_adjudicacion], 
           [duracion_contrato], [created_at], [vigencia], [pdf_file_path], [word_file_path], 
           [id_item_convocatoria], [id_tipo_item_convocatoria], [cantidad], [id_estado], 
           [fecha_fin_publicacion], [fecha_apertura_sobre], [fecha_inicio_ofertas], 
           [fecha_otorgamiento_buena_pro], [Anexos], [QR_PATH], [id_convocatoria_documento])
        VALUES
          (@id_convenio, @id_tipo, @codigo_seace, @titulo, @descripcion, @presupuesto, 
           @fecha_publicacion, @fecha_limite_ofertas, @fecha_estimada_adjudicacion, 
           @duracion_contrato, @created_at, @vigencia, @pdf_file_path, @word_file_path, 
           @id_item_convocatoria, @id_tipo_item_convocatoria, @cantidad, @id_estado, 
           @fecha_fin_publicacion, @fecha_apertura_sobre, @fecha_inicio_ofertas, 
           @fecha_otorgamiento_buena_pro, @Anexos, @QR_PATH, @id_convocatoria_documento);
        SELECT SCOPE_IDENTITY() AS id_convocatoria;
      `);

    const newId = result.recordset[0]?.id_convocatoria;

    return NextResponse.json(
      { message: "Convocatoria creada exitosamente", id_convocatoria: newId },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof sql.ConnectionError) {
      return NextResponse.json(
        { error: "No se pudo conectar a la base de datos", details: error.message },
        { status: 500 }
      );
    }
    if (error instanceof sql.RequestError) {
      return NextResponse.json(
        { error: "Error en la consulta a la base de datos", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "No se pudo crear la convocatoria", details: error.message },
      { status: 500 }
    );
  }
=======
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
>>>>>>> 015254ef7979cf9a5be5b71805a4796ae0237606:src/app/api/groconvocatoria/convocatoria/route.ts
}