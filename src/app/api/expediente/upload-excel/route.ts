import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import path from "path";
import fs from "fs/promises";

// Importar dinámicamente xlsx para manejar módulos CommonJS
const XLSX = await import('xlsx').then(module => module.default || module);

if (!XLSX || !XLSX.read) {
  console.error('Error: El módulo XLSX no se cargó correctamente');
  throw new Error('El módulo XLSX no se cargó correctamente');
}

interface BudgetItem {
  Codigo: string;
  Descripción: string;
  Unidad: string;
  Cantidad: number; // Maps to 'Metrado' in Excel
  PrecioUnitario: number;
  CostoTotal: number;
  Category: string;
  Level: number;
  Parent?: string;
}

const variablesRequeridas = {
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_SERVER: process.env.DB_SERVER,
  DB_NAME: process.env.DB_NAME, // Add DB_NAME to required variables
};

const variablesFaltantes = Object.entries(variablesRequeridas)
  .filter(([, valor]) => !valor)
  .map(([clave]) => clave);

if (variablesFaltantes.length > 0) {
  throw new Error(`Faltan las siguientes variables de entorno: ${variablesFaltantes.join(", ")}`);
}

const configuracion = {
  user: variablesRequeridas.DB_USER as string,
  password: variablesRequeridas.DB_PASSWORD as string,
  server: variablesRequeridas.DB_SERVER as string,
  database: variablesRequeridas.DB_NAME as string, // Use DB_NAME from .env (RuralHousingProgram)
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function parseExcelFile(filePath: string): Promise<{ items: BudgetItem[] }> {
  console.log('Leyendo archivo Excel desde:', filePath);
  const buffer = await fs.readFile(filePath);

  console.log('Parseando el archivo Excel con XLSX');
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames.find(name => name.toLowerCase() === 'presupuesto');
  if (!sheetName) {
    console.log('No se encontró la pestaña "PRESUPUESTO" en el archivo Excel');
    throw new Error('No se encontró la pestaña "PRESUPUESTO" en el archivo Excel');
  }

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
    throw new Error('Formato de archivo Excel inválido: faltan los encabezados requeridos');
  }

  const categories = [
    { name: 'Materials', value: 0, codes: ['201', '204', '205', '207', '210', '211', '213', '216', '217', '222', '231', '234', '237', '238', '240', '241', '251', '262', '264', '265', '267', '268', '270', '272', '276', '293', '294', '295', '296', '298', '299'] },
    { name: 'Labor', value: 0, codes: ['101'] },
    { name: 'Equipment', value: 0, codes: ['301'] },
    { name: 'Freight', value: 0, codes: ['203'] },
  ];

  const items: BudgetItem[] = [];
  const groupTotals: { [key: string]: number } = {};
  console.log('Procesando datos a partir de la fila', headerRowIndex + 1);

  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i] as any[];
    const startIndex = row.findIndex((cell, idx) => idx >= 0 && cell?.toString().trim());
    if (startIndex === -1) {
      console.log('Saltando fila vacía:', row);
      continue;
    }

    const codigo = row[0]?.toString().trim() || 'N/A';
    const slicedRow = row.slice(0, 8);
    console.log('Procesando fila', i, 'con datos:', slicedRow);

    let level = 0;
    if (!row[1] && !row[2]) level = 0;
    else if (!row[2]) level = 1;
    else level = 2;

    const partial = parseFloat(slicedRow[7]) || 0;
    const category = categories.find(cat => cat.codes.some(prefix => codigo.startsWith(prefix)));
    if (category && level === 2) category.value += partial;

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

    if (level === 2 && parent) {
      let currentParent = parent;
      while (currentParent) {
        groupTotals[currentParent] = (groupTotals[currentParent] || 0) + partial;
        const parentIndex = items.findIndex(item => item.Descripción === currentParent);
        if (parentIndex !== -1) {
          currentParent = items[parentIndex].Parent || null;
        } else {
          currentParent = null;
        }
      }
    }

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

  for (let item of items) {
    if (item.Level < 2) {
      item.CostoTotal = groupTotals[item.Descripción] || item.CostoTotal;
    }
  }

  console.log('Datos procesados, total de ítems:', items.length);
  return { items };
}

export async function POST(request: NextRequest) {
  let pool;

  try {
    // Parse form data
    const formData = await request.formData();
    const category = formData.get("category") as string;
    const id_convenio = formData.get("id_convenio") as string;

    if (!category || !id_convenio) {
      return NextResponse.json(
        { error: "Category and id_convenio are required." },
        { status: 400 }
      );
    }

    // Connect to SQL Server
    pool = await sql.connect(configuracion);

    // Verify if the convenio exists
    const convenioCheck = await pool
      .request()
      .input('id_convenio', sql.Int, parseInt(id_convenio))
      .query(`SELECT Id_convenio FROM [${process.env.DB_NAME}].[dbo].[Convenios] WHERE Id_convenio = @id_convenio`);

    if (convenioCheck.recordset.length === 0) {
      console.log('Error: Convenio no encontrado para id_convenio:', id_convenio);
      return NextResponse.json(
        { error: 'El convenio especificado no existe' },
        { status: 404 }
      );
    }

    const files = formData.entries();
    const uploadedFiles: string[] = [];
    let excelParsed = false;

    for (const [key, value] of files) {
      if (key.startsWith("file-") && value instanceof File) {
        const file = value as File;
        const fileName = file.name;
        const fileExtension = fileName.split(".").pop()?.toLowerCase();

        // Validate file type (Word, Excel, PDF only)
        const allowedTypes = ["doc", "docx", "xlsx", "xls", "pdf"];
        if (!fileExtension || !allowedTypes.includes(fileExtension)) {
          return NextResponse.json(
            { error: `Tipo de archivo no permitido: ${fileName}. Solo se permiten Word, Excel y PDF.` },
            { status: 400 }
          );
        }

        const fileType =
          fileExtension === "pdf"
            ? "PDF"
            : fileExtension === "xlsx" || fileExtension === "xls"
            ? "Excel"
            : "Word";
        const fileSize = file.size / 1024; // Convert to KB

        // Define the file path for storage
        const categoryFolder = category.replace(/[^a-zA-Z0-9]/g, "_");
        const uploadDir = path.join(process.cwd(), "public", "Expedientes", categoryFolder);
        const filePath = path.join(uploadDir, fileName);
        const relativeFilePath = `/Expedientes/${categoryFolder}/${fileName}`;

        // Create directory if it doesn't exist
        await fs.mkdir(uploadDir, { recursive: true });

        // Save the file to the filesystem
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(filePath, buffer);

        uploadedFiles.push(fileName);

        const description = `Archivo subido para ${category}`;

        // Insert into ExpedienteTecnico table
        await pool
          .request()
          .input("ID_Convenio", sql.Int, parseInt(id_convenio))
          .input("NombreArchivo", sql.NVarChar, fileName)
          .input("TipoArchivo", sql.NVarChar, fileType)
          .input("RutaArchivo", sql.NVarChar, relativeFilePath)
          .input("TamañoArchivo", sql.Decimal(18, 2), fileSize)
          .input("Descripcion", sql.NVarChar, description)
          .input("Categoria", sql.NVarChar, category)
          .input("FechaCarga", sql.DateTime, new Date())
          .query(`
            INSERT INTO [${process.env.DB_NAME}].[dbo].[ExpedienteTecnico] 
            (id_convenio, NombreArchivo, TipoArchivo, RutaArchivo, TamañoArchivo, Descripcion, Categoria, FechaCarga)
            VALUES (@id_convenio, @NombreArchivo, @TipoArchivo, @RutaArchivo, @TamañoArchivo, @Descripcion, @Categoria, @FechaCarga)
          `);

        // If the file is Excel and category is "3. METRADOS Y PRESUPUESTO", parse and insert into ItemsPresupuesto
        if (fileType === "Excel" && category === "3. METRADOS Y PRESUPUESTO" && !excelParsed) {
          try {
            const { items } = await parseExcelFile(filePath);

            // Start a transaction for consistency
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
              // Insert categories (Level 0) into CategoriasPresupuesto
              const categoryMap: { [key: string]: number } = {};
              for (const item of items) {
                if (item.Level === 0) {
                  const categoryResult = await transaction
                    .request()
                    .input('CodigoCategoria', sql.NVarChar, item.Codigo)
                    .input('NombreCategoria', sql.NVarChar, item.Descripción)
                    .query(`
                      INSERT INTO [${process.env.DB_NAME}].[dbo].[CategoriasPresupuesto] (CodigoCategoria, NombreCategoria)
                      OUTPUT INSERTED.CategoriaID
                      VALUES (@CodigoCategoria, @NombreCategoria)
                    `);
                  categoryMap[item.Descripción] = categoryResult.recordset[0].CategoriaID;
                  console.log(`Categoría insertada: ${item.Descripción} con CategoriaID: ${categoryMap[item.Descripción]}`);
                }
              }

              // Insert items into ItemsPresupuesto
              for (const item of items) {
                let categoriaID = null;
                if (item.Level > 0 && item.Parent) {
                  let currentParent = item.Parent;
                  while (currentParent) {
                    if (categoryMap[currentParent]) {
                      categoriaID = categoryMap[currentParent];
                      break;
                    }
                    const parentItem = items.find(i => i.Descripción === currentParent);
                    currentParent = parentItem?.Parent || null;
                  }
                } else if (item.Level === 0) {
                  categoriaID = categoryMap[item.Descripción];
                }

                await transaction
                  .request()
                  .input('Id_Convenio', sql.Int, parseInt(id_convenio))
                  .input('CategoriaID', sql.Int, categoriaID)
                  .input('CodigoItem', sql.NVarChar, item.Codigo)
                  .input('Descripcion', sql.NVarChar, item.Descripción)
                  .input('Unidad', sql.NVarChar, item.Unidad === 'N/A' ? null : item.Unidad)
                  .input('Cantidad', sql.Decimal(18, 4), item.Cantidad)
                  .input('PrecioUnitario', sql.Decimal(18, 2), item.PrecioUnitario)
                  .input('CostoTotal', sql.Decimal(18, 2), item.CostoTotal)
                  .query(`
                    INSERT INTO [${process.env.DB_NAME}].[dbo].[ItemsPresupuesto] (
                      Id_Convenio, CategoriaID, CodigoItem, Descripcion, Unidad, Cantidad, PrecioUnitario, CostoTotal
                    )
                    VALUES (
                      @Id_Convenio, @CategoriaID, @CodigoItem, @Descripcion, @Unidad, @Cantidad, @PrecioUnitario, @CostoTotal
                    )
                  `);
                console.log(`Ítem insertado: ${item.Descripción} para Id_Convenio: ${id_convenio}`);
              }

              await transaction.commit();
              console.log('Transacción completada con éxito');
              excelParsed = true; // Prevent parsing multiple Excel files in the same request
            } catch (error: any) {
              await transaction.rollback();
              console.error('Error al insertar datos del Excel:', error);
              throw error;
            }
          } catch (error: any) {
            console.error('Error al parsear el archivo Excel:', error);
            return NextResponse.json(
              { error: 'No se pudo procesar el archivo Excel', details: error.message },
              { status: 400 }
            );
          }
        }
      }
    }

    return NextResponse.json(
      { success: true, uploadedFiles },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error en la consulta POST:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los archivos", details: error.message },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
