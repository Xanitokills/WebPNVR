import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';

// Importar dinámicamente xlsx para manejar módulos CommonJS
const XLSX = await import('xlsx').then(module => module.default || module);

if (!XLSX || !XLSX.read) {
  console.error('Error: El módulo XLSX no se cargó correctamente');
  throw new Error('El módulo XLSX no se cargó correctamente');
}

// Configuración de la base de datos
const dbConfig = {
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  server: process.env.DB_SERVER as string,
  database: 'PNVR2',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

interface BudgetItem {
  Codigo: string;
  Descripción: string;
  Unidad: string;
  Cantidad: number;
  PrecioUnitario: number;
  CostoTotal: number;
  Category: string;
  Level: number; // 0 for top-level, 1 for subgroup, 2 for sub-subgroup
  Parent?: string; // Reference to the parent item's Descripción
}

export async function GET(request: NextRequest) {
  let pool;
  try {
    console.log('Iniciando solicitud GET /api/expediente/budget con id_convenio:', request.url);
    const { searchParams } = new URL(request.url);
    const id_convenio = searchParams.get('id_convenio');

    if (!id_convenio) {
      console.log('Error: id_convenio no proporcionado');
      return NextResponse.json(
        { error: 'El id_convenio es requerido' },
        { status: 400 }
      );
    }

    console.log('Conectando a la base de datos con id_convenio:', id_convenio);
    pool = await sql.connect(dbConfig);

    console.log('Ejecutando consulta SQL para obtener archivo Excel');
    const result = await pool
      .request()
      .input('id_convenio', sql.Int, parseInt(id_convenio))
      .input('category', sql.NVarChar, '3. METRADOS Y PRESUPUESTO')
      .query(`
        SELECT 
          NombreArchivo,
          TipoArchivo,
          RutaArchivo,
          TamañoArchivo,
          Descripcion,
          FechaCarga,
          CreadoEn,
          ActualizadoEn
        FROM [PNVR2].[dbo].[ExpedienteTecnico]
        WHERE id_convenio = @id_convenio
          AND Categoria = @category
          AND TipoArchivo = 'Excel'
      `);

    if (result.recordset.length === 0) {
      console.log('No se encontró un archivo Excel en la categoría "3. METRADOS Y PRESUPUESTO" para id_convenio:', id_convenio);
      return NextResponse.json(
        { error: 'No se encontró un archivo Excel en la categoría "3. METRADOS Y PRESUPUESTO"' },
        { status: 404 }
      );
    }

    const file = result.recordset[0];
    const fileUrl = `http://localhost:3003${file.RutaArchivo.replace(/^\/+/, '/')}`;
    console.log('Archivo encontrado, URL generada:', fileUrl);

    console.log('Iniciando fetch del archivo desde:', fileUrl);
    const response = await fetch(fileUrl);
    if (!response.ok) {
      console.error('Error al obtener el archivo:', response.statusText);
      throw new Error(`No se pudo obtener el archivo desde ${fileUrl}: ${response.statusText}`);
    }
    console.log('Archivo fetched exitosamente, convirtiendo a buffer');
    const buffer = await response.arrayBuffer();

    console.log('Parseando el archivo Excel con XLSX');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    console.log('Hoja seleccionada:', sheetName);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log('Primeras 5 filas del archivo Excel:', data.slice(0, 5));

    // Encontrar la fila de encabezados
    let headerRowIndex = -1;
    const expectedHeaders = ['Item', 'Descripción', 'Und.', 'Metrado', 'P.U.', 'Parcial'];
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as string[];
      console.log(`Verificando fila ${i}:`, row);
      const itemIndex = row.findIndex((cell, idx) => idx <= 2 && cell?.toString().trim() === 'Item');
      if (itemIndex !== -1) {
        const headersSlice = [row[itemIndex]].concat(row.slice(3, 3 + expectedHeaders.length - 1));
        console.log('Encabezados encontrados en la fila:', headersSlice);
        if (headersSlice.length === expectedHeaders.length && 
            expectedHeaders.every((header, idx) => headersSlice[idx]?.toString().trim() === header)) {
          headerRowIndex = i;
          console.log('Encabezados encontrados en la fila', i, 'en índice inicial', itemIndex);
          break;
        }
      }
    }

    if (headerRowIndex === -1) {
      console.log('No se encontraron los encabezados esperados:', expectedHeaders);
      return NextResponse.json(
        { error: 'Formato de archivo Excel inválido: faltan los encabezados requeridos' },
        { status: 400 }
      );
    }

    const categories = [
      { name: 'Materials', value: 0, codes: ['201', '204', '205', '207', '210', '211', '213', '216', '217', '222', '231', '234', '237', '238', '240', '241', '251', '262', '264', '265', '267', '268', '270', '272', '276', '293', '294', '295', '296', '298', '299'] },
      { name: 'Labor', value: 0, codes: ['101'] },
      { name: 'Equipment', value: 0, codes: ['301'] },
      { name: 'Freight', value: 0, codes: ['203'] },
    ];

    const items: BudgetItem[] = [];
    const groupTotals: { [key: string]: number } = {}; // To store totals for groups
    console.log('Procesando datos a partir de la fila', headerRowIndex + 1);

    // First pass: Process items and calculate totals for groups
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i] as any[];
      const startIndex = row.findIndex((cell, idx) => idx >= 0 && cell?.toString().trim());
      if (startIndex === -1) {
        console.log('Saltando fila vacía:', row);
        continue; // Saltar filas completamente vacías
      }

      const codigo = row[0]?.toString().trim() || 'N/A';
      const slicedRow = row.slice(0, 8); // Take the first 8 columns to cover Item to Parcial
      console.log('Procesando fila', i, 'con datos:', slicedRow);

      // Determine level based on empty cells in B and C
      let level = 0;
      if (!row[1] && !row[2]) level = 0; // Top-level group (e.g., "OBRAS PROVISIONALES...")
      else if (!row[2]) level = 1; // Subgroup (e.g., "TRABAJOS PRELIMINARES")
      else level = 2; // Sub-subgroup (e.g., "CARTEL DE OBRA 4.00 X 2.50")

      const partial = parseFloat(slicedRow[7]) || 0; // Parcial (CostoTotal) is in column H (index 7)
      const category = categories.find(cat => cat.codes.some(prefix => codigo.startsWith(prefix)));
      if (category && level === 2) category.value += partial; // Only add to categories for actual items (Level 2)

      // Find the parent description for subgroups and sub-subgroups
      let parent = null;
      if (level > 0) {
        for (let j = i - 1; j >= headerRowIndex + 1; j--) {
          const prevRow = data[j] as any[];
          const prevLevel = (!prevRow[1] && !prevRow[2]) ? 0 : (!prevRow[2] ? 1 : 2);
          if (prevLevel < level) {
            parent = prevRow[3]?.toString().trim() || null;
            break;
          }
        }
      }

      // Update group totals
      if (level === 2 && parent) {
        let currentParent = parent;
        while (currentParent) {
          groupTotals[currentParent] = (groupTotals[currentParent] || 0) + partial;
          // Find the parent's parent (for nested groups)
          const parentIndex = items.findIndex(item => item.Descripción === currentParent);
          if (parentIndex !== -1) {
            currentParent = items[parentIndex].Parent || null;
          } else {
            currentParent = null;
          }
        }
      }

      // Add the item to the list
      items.push({
        Codigo: codigo,
        Descripción: slicedRow[3]?.toString().trim() || 'N/A',
        Unidad: slicedRow[4]?.toString().trim() || 'N/A',
        Cantidad: parseFloat(slicedRow[5]) || 0,
        PrecioUnitario: parseFloat(slicedRow[6]) || 0,
        CostoTotal: partial,
        Category: category ? category.name : 'Other',
        Level: level,
        Parent: parent,
      });
    }

    // Second pass: Update group rows with their aggregated totals
    for (let item of items) {
      if (item.Level < 2) {
        item.CostoTotal = groupTotals[item.Descripción] || item.CostoTotal;
      }
    }

    console.log('Datos procesados, total de ítems:', items.length);
    const budgetData = {
      items,
      categories,
    };

    console.log('Enviando respuesta JSON con éxito');
    return NextResponse.json(budgetData, { status: 200 });
  } catch (error: any) {
    console.error('Error en GET /api/expediente/budget:', error);
    return NextResponse.json(
      { error: 'No se pudo procesar los datos del presupuesto', details: error.message },
      { status: 500 }
    );
  } finally {
    if (pool) {
      console.log('Cerrando conexión a la base de datos');
      await pool.close();
    }
  }
}