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
  Cantidad: number;
  PrecioUnitario: number;
  CostoTotal: number;
  Category: string;
  Level: number;
  Parent?: string;
  CategoriaID?: number;
  SubcategoriaID?: number;
}

const variablesRequeridas = {
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_SERVER: process.env.DB_SERVER,
  DB_NAME: process.env.DB_NAME,
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
  database: variablesRequeridas.DB_NAME as string,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// ... (importaciones y definiciones previas permanecen iguales)

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
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  console.log('Primeras 5 filas del archivo Excel:', data.slice(0, 5));

  // Forzar la fila de encabezados a la fila 15
  const headerRowIndex = 14; // Fila 15 (índice 14 en base 0)
  if (data[headerRowIndex].length < 6 || !data[headerRowIndex][0]?.toString().trim().startsWith('Item')) {
    console.log('Encabezados no encontrados en la fila 15:', data[headerRowIndex]);
    throw new Error('Formato de archivo Excel inválido: los encabezados no se encuentran en la fila 15');
  }

  const expectedHeaders = ['Item', 'Descripción', 'Und.', 'Metrado', 'P.U.', 'Parcial'];
  const headers = data[headerRowIndex].slice(0, 6).map(h => h?.toString().trim());
  if (!expectedHeaders.every((header, idx) => headers[idx] === header)) {
    console.log('Encabezados esperados no coinciden:', expectedHeaders, 'Encontrados:', headers);
    throw new Error('Formato de archivo Excel inválido: los encabezados no coinciden');
  }

  console.log('Encabezados encontrados en la fila', headerRowIndex + 1, ':', headers);

  const categories = [
    { name: 'Materials', value: 0, codes: ['201', '204', '205', '207', '210', '211', '213', '216', '217', '222', '231', '234', '237', '238', '240', '241', '251', '262', '264', '265', '267', '268', '270', '272', '276', '293', '294', '295', '296', '298', '299'] },
    { name: 'Labor', value: 0, codes: ['101'] },
    { name: 'Equipment', value: 0, codes: ['301'] },
    { name: 'Freight', value: 0, codes: ['203'] },
  ];

  const items: BudgetItem[] = [];
  const groupTotals: { [key: string]: number } = {};
  let lastLevel0Parent: string | null = null;
  let lastLevel1Parent: string | null = null;

  console.log('Procesando datos a partir de la fila', headerRowIndex + 2);

  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i] as any[];
    const startIndex = row.findIndex((cell, idx) => idx >= 0 && cell?.toString().trim());
    if (startIndex === -1 || !row[0]) {
      console.log('Saltando fila vacía o sin código:', row);
      continue;
    }

    const codigo = row[0]?.toString().trim() || 'N/A';
    const slicedRow = row.slice(0, 6);
    console.log('Procesando fila', i + 1, 'con datos:', slicedRow);

    // Determinar el nivel basado en el número de puntos en el código
    const levelMatch = codigo.match(/\./g)?.length || 0;
    const level = levelMatch === 0 ? 0 : levelMatch === 1 ? 1 : 2;
    const unidad = slicedRow[2]?.toString().trim() || '';
    const metrado = parseFloat(slicedRow[3]) || 0;
    const precioUnitario = parseFloat(slicedRow[4]) || 0;
    const descripcion = slicedRow[1]?.toString().trim() || 'N/A';
    const partial = parseFloat(slicedRow[5]) || 0;

    if (!descripcion || descripcion === 'N/A') {
      console.log(`Fila ${i + 1}: Descripción vacía para el código ${codigo}, saltando...`);
      continue;
    }

    console.log(`Ítem: ${descripcion}, Código: ${codigo}, Nivel: ${level}, Unidad: ${unidad}, Metrado: ${metrado}, PrecioUnitario: ${precioUnitario}`);

    const category = categories.find(cat => cat.codes.some(prefix => codigo.startsWith(prefix)));
    if (category && level === 2) category.value += partial;

    let parent: string | null = null;
    if (level > 0) {
      for (let j = i - 1; j >= headerRowIndex + 1; j--) {
        const prevRow = data[j] as any[];
        const prevCodigo = prevRow[0]?.toString().trim() || 'N/A';
        const prevLevel = prevCodigo.match(/\./g)?.length || 0;
        if (prevLevel === level - 1 && prevRow[1]) {
          parent = prevRow[1]?.toString().trim() || null;
          break;
        }
      }

      if (!parent) {
        if (level === 1 && lastLevel0Parent) {
          parent = lastLevel0Parent;
        } else if (level === 2 && lastLevel1Parent) {
          parent = lastLevel1Parent;
        } else if (lastLevel0Parent) {
          parent = lastLevel0Parent;
        }
      }
    }

    if (level === 0) {
      lastLevel0Parent = descripcion;
      lastLevel1Parent = null;
    } else if (level === 1) {
      lastLevel1Parent = descripcion;
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
      Descripción: descripcion,
      Unidad: unidad,
      Cantidad: metrado,
      PrecioUnitario: precioUnitario,
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

  console.log('Datos procesados, total de ítems:', items.length, 'Lista de ítems:', items);
  return { items };
}

// ... (el resto del archivo permanece igual)

export async function POST(request: NextRequest) {
  let pool;

  try {
    const formData = await request.formData();
    const category = formData.get("category") as string;
    const id_convenio = formData.get("id_convenio") as string;

    if (!category || !id_convenio) {
      return NextResponse.json(
        { error: "Category and id_convenio are required." },
        { status: 400 }
      );
    }

    pool = await sql.connect(configuracion);

    const convenioCheck = await pool
      .request()
      .input('id_convenio', sql.Int, parseInt(id_convenio))
      .query(`SELECT Id_convenio FROM [${process.env.DB_NAME}].[dbo].[PNVR_Convenios] WHERE Id_convenio = @id_convenio`);

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
        const fileSize = file.size / 1024;

        const categoryFolder = category.replace(/[^a-zA-Z0-9]/g, "_");
        const uploadDir = path.join(process.cwd(), "public", "Expedientes", categoryFolder);
        const filePath = path.join(uploadDir, fileName);
        const relativeFilePath = `/Expedientes/${categoryFolder}/${fileName}`;

        await fs.mkdir(uploadDir, { recursive: true });

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(filePath, buffer);

        uploadedFiles.push(fileName);

        const description = `Archivo subido para ${category}`;

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
            INSERT INTO [${process.env.DB_NAME}].[dbo].[PNVR_ExpedienteTecnico] 
            (id_convenio, NombreArchivo, TipoArchivo, RutaArchivo, TamañoArchivo, Descripcion, Categoria, FechaCarga)
            VALUES (@id_convenio, @NombreArchivo, @TipoArchivo, @RutaArchivo, @TamañoArchivo, @Descripcion, @Categoria, @FechaCarga)
          `);

        if (fileType === "Excel" && category === "3. METRADOS Y PRESUPUESTO" && !excelParsed) {
          try {
            const { items } = await parseExcelFile(filePath);

            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
              const categoryMap: { [key: string]: number } = {};
              const subcategoryMap: { [key: string]: number } = {};

              for (const item of items) {
                if (item.Level === 0) {
                  if (!item.Descripción) continue;
                  const categoryResult = await transaction
                    .request()
                    .input('CodigoCategoria', sql.NVarChar, item.Codigo)
                    .input('NombreCategoria', sql.NVarChar, item.Descripción)
                    .query(`
                      INSERT INTO [${process.env.DB_NAME}].[dbo].[PNVR_CategoriasPresupuesto] (CodigoCategoria, NombreCategoria, CreadoEn)
                      OUTPUT INSERTED.CategoriaID
                      VALUES (@CodigoCategoria, @NombreCategoria, GETDATE())
                    `);
                  categoryMap[item.Descripción] = categoryResult.recordset[0].CategoriaID;
                  item.CategoriaID = categoryMap[item.Descripción];
                  console.log(`Categoría insertada: ${item.Descripción} con CategoriaID: ${categoryMap[item.Descripción]}`);
                }
              }

              for (const item of items) {
                if (item.Level === 1) {
                  if (!item.Descripción) continue;
                  let categoriaID = null;
                  if (item.Parent && categoryMap[item.Parent]) {
                    categoriaID = categoryMap[item.Parent];
                  } else {
                    const lastCategory = Object.values(categoryMap).pop();
                    categoriaID = lastCategory || null;
                  }

                  if (!categoriaID) continue;

                  const subcategoryResult = await transaction
                    .request()
                    .input('CategoriaID', sql.Int, categoriaID)
                    .input('CodigoSubcategoria', sql.NVarChar, item.Codigo)
                    .input('NombreSubcategoria', sql.NVarChar, item.Descripción)
                    .query(`
                      INSERT INTO [${process.env.DB_NAME}].[dbo].[PNVR_SubcategoriasPresupuesto] (CategoriaID, CodigoSubcategoria, NombreSubcategoria, CreadoEn)
                      OUTPUT INSERTED.SubcategoriaID
                      VALUES (@CategoriaID, @CodigoSubcategoria, @NombreSubcategoria, GETDATE())
                    `);
                  subcategoryMap[item.Descripción] = subcategoryResult.recordset[0].SubcategoriaID;
                  item.SubcategoriaID = subcategoryMap[item.Descripción];
                  console.log(`Subcategoría insertada: ${item.Descripción} con SubcategoriaID: ${subcategoryMap[item.Descripción]}`);
                }
              }

              for (const item of items) {
                if (item.Level === 2) {
                  if (!item.Descripción) continue;
                  let categoriaID = null;
                  let subcategoriaID = null;

                  let currentParent = item.Parent;
                  while (currentParent) {
                    if (subcategoryMap[currentParent]) {
                      subcategoriaID = subcategoryMap[currentParent];
                      const parentSubcategory = items.find(i => i.Descripción === currentParent && i.Level === 1);
                      if (parentSubcategory && parentSubcategory.Parent) {
                        categoriaID = categoryMap[parentSubcategory.Parent];
                      }
                      break;
                    } else if (categoryMap[currentParent]) {
                      categoriaID = categoryMap[currentParent];
                      break;
                    }
                    const parentItem = items.find(i => i.Descripción === currentParent);
                    currentParent = parentItem?.Parent || null;
                  }

                  if (!categoriaID) {
                    const lastCategory = Object.values(categoryMap).pop();
                    categoriaID = lastCategory || null;
                    if (!categoriaID) continue;
                  }

                  await transaction
                    .request()
                    .input('Id_Convenio', sql.Int, parseInt(id_convenio))
                    .input('CategoriaID', sql.Int, categoriaID)
                    .input('SubcategoriaID', sql.Int, subcategoriaID || null)
                    .input('CodigoItem', sql.NVarChar, item.Codigo)
                    .input('Descripcion', sql.NVarChar, item.Descripción)
                    .input('Unidad', sql.NVarChar, item.Unidad === '' ? null : item.Unidad)
                    .input('Cantidad', sql.Decimal(18, 4), item.Cantidad || null)
                    .input('PrecioUnitario', sql.Decimal(18, 2), item.PrecioUnitario || null)
                    .input('CostoTotal', sql.Decimal(18, 2), item.CostoTotal || null)
                    .query(`
                      INSERT INTO [${process.env.DB_NAME}].[dbo].[PNVR_ItemsPresupuesto] (
                        Id_Convenio, CategoriaID, SubcategoriaID, CodigoItem, Descripcion, Unidad, Cantidad, PrecioUnitario, CostoTotal, CreadoEn
                      )
                      VALUES (
                        @Id_Convenio, @CategoriaID, @SubcategoriaID, @CodigoItem, @Descripcion, @Unidad, @Cantidad, @PrecioUnitario, @CostoTotal, GETDATE()
                      )
                    `);
                  console.log(`Ítem insertado: ${item.Descripción} para Id_Convenio: ${id_convenio}`);
                }
              }

              await transaction.commit();
              console.log('Transacción completada con éxito');
              excelParsed = true;
            } catch (error: any) {
              await transaction.rollback();
              console.error('Error al insertar datos del Excel. Detalle:', error.message);
              return NextResponse.json(
                { error: 'Error en la transacción', details: error.message },
                { status: 500 }
              );
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