import { NextRequest, NextResponse } from "next/server";
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
  ItemPadre: string;
  ItemHijo: string;
  ItemNieto: string;
  Descripción: string;
  Unidad: string;
  Cantidad: number;
  PrecioUnitario: number;
  CostoTotal: number;
  Category: string;
  Level: number;
  Parent?: string;
  Segmento: string;
}

interface ValidationReport {
  warnings: string[];
  errors: string[];
  isValid: boolean;
}

async function parseExcelFile(filePath: string): Promise<{ items: BudgetItem[]; validation: ValidationReport }> {
  console.log('Iniciando procesamiento de archivo Excel desde:', filePath);
  const buffer = await fs.readFile(filePath);

  console.log('Parseando el archivo Excel con XLSX');
  const workbook = XLSX.read(buffer, { type: 'buffer', cellText: true, cellDates: false });
  const sheetName = workbook.SheetNames.find(name => name.toLowerCase() === 'presupuesto');
  if (!sheetName) {
    console.log('No se encontró la pestaña "PRESUPUESTO" en el archivo Excel');
    throw new Error('No se encontró la pestaña "PRESUPUESTO" en el archivo Excel');
  }

  console.log('Hoja seleccionada:', sheetName);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' }) as any[][];
  console.log('Primeras 5 filas del archivo Excel:', data.slice(0, 5));

  // Definir los encabezados esperados con sinónimos
  const headerSynonyms = [
    { expected: 'Item', synonyms: ['item', 'código', 'codigo', 'id'] },
    { expected: 'Descripción', synonyms: ['descripción', 'descripcion', 'nombre', 'detalle'] },
    { expected: 'Und.', synonyms: ['und', 'unidad', 'unid', 'u'] },
    { expected: 'Metrado', synonyms: ['metrado', 'cantidad', 'cant', 'qty'] },
    { expected: 'P.U.', synonyms: ['p.u', 'precio unitario', 'precio', 'unitario', 'pu'] },
    { expected: 'Parcial', synonyms: ['parcial', 'total', 'costo', 'subtotal'] },
  ];

  // Inicializar validación
  const validation: ValidationReport = { warnings: [], errors: [], isValid: true };

  // Buscar la fila de encabezados
  let headerRowIndex = -1;
  let headerIndices: { [key: string]: number } = {};
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    if (row.length >= 6 && row.some(cell => cell?.toString().trim())) {
      const headers = row.map(h => h?.toString().trim() || '');
      const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/\s+/g, '').replace(/\./g, ''));

      let matches = 0;
      const tempHeaders: { [key: string]: number } = {};
      for (let j = 0; j < headerSynonyms.length; j++) {
        const { expected, synonyms } = headerSynonyms[j];
        const normalizedExpected = expected.toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
        const foundIndex = normalizedHeaders.findIndex(h =>
          h && (h === normalizedExpected || synonyms.some(syn => h.includes(syn.toLowerCase().replace(/\s+/g, '').replace(/\./g, '')))
        ));
        if (foundIndex !== -1) {
          matches++;
          tempHeaders[expected] = foundIndex;
        }
      }

      if (matches >= 5) {
        headerRowIndex = i;
        headerIndices = tempHeaders;
        console.log('Encabezados encontrados en la fila', i + 1, ':', headers);
        break;
      }
    }
  }

  if (headerRowIndex === -1) {
    console.log('No se encontraron encabezados válidos en las primeras 20 filas');
    validation.warnings.push('No se encontraron encabezados válidos; asumiendo estructura estándar');
    if (data.some(row => row.length >= 6 && row[0]?.toString().trim() && row[1]?.toString().trim())) {
      headerRowIndex = 0;
      headerIndices = {
        'Item': 0,
        'Descripción': 1,
        'Und.': 2,
        'Metrado': 3,
        'P.U.': 4,
        'Parcial': 5,
      };
      console.log('Asumiendo encabezados por defecto:', headerIndices);
    } else {
      throw new Error('Formato de archivo Excel inválido: no se encontraron encabezados ni datos válidos');
    }
  }

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
  let currentSegment: string = '';

  console.log('Procesando datos a partir de la fila', headerRowIndex + 1);

  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i] as any[];
    const itemRaw = row[headerIndices['Item']]?.toString().trim() || '';
    const descIndex = headerIndices['Descripción'];
    const descripcion = row[descIndex]?.toString().replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim() || '';

    console.log(`Fila ${i + 1}: ItemRaw = "${itemRaw}", Descripción = "${descripcion}"`);

    // Ignorar filas vacías o sin código
    if (!itemRaw || !descripcion) {
      console.log(`Fila ${i + 1}: Saltando fila vacía o sin datos`);
      continue;
    }

    // Ignorar filas de resumen
    if (descripcion.toUpperCase().includes('COSTO DIRECTO') ||
        descripcion.toUpperCase().includes('COSTO INDIRECTO') ||
        descripcion.toUpperCase().includes('COSTO TOTAL') ||
        descripcion.toUpperCase().includes('APORTE') ||
        descripcion.toUpperCase().includes('FINANCIA PNVR')) {
      console.log(`Fila ${i + 1}: Saltando fila de resumen`);
      continue;
    }

    // Determinar el nivel y separar ItemPadre, ItemHijo, ItemNieto
    const itemParts = itemRaw.split(/\s+/).filter(part => part !== '');
    const level = itemParts.length - 1; // "1" → 0, "1 1" → 1, "1 1 1" → 2
    const itemPadre = itemParts[0] || '';
    const itemHijo = itemParts.length > 1 ? itemParts[1] : '';
    const itemNieto = itemParts.length > 2 ? itemParts[2] : '';

    console.log(`Fila ${i + 1}: Nivel detectado = ${level}, Partes = ${itemParts}, ItemPadre = "${itemPadre}", ItemHijo = "${itemHijo}", ItemNieto = "${itemNieto}"`);

    const codigo = itemRaw && descripcion ? `${itemRaw} - ${descripcion}` : itemRaw;

    const unitIndex = headerIndices['Und.'];
    const metradoRaw = row[headerIndices['Metrado']]?.toString().trim() || '0';
    const precioUnitarioRaw = row[headerIndices['P.U.']]?.toString().trim() || '0';
    const partialRaw = row[headerIndices['Parcial']]?.toString().trim() || '0';

    const metrado = parseFloat(metradoRaw) || 0;
    const precioUnitario = parseFloat(precioUnitarioRaw) || 0;
    const partial = parseFloat(partialRaw) || 0;

    const unidad = row[unitIndex]?.toString().trim() || '';

    // Validaciones
    if (!descripcion) {
      validation.warnings.push(`Fila ${i + 1}: Descripción vacía para el código ${codigo}`);
      console.log(`Fila ${i + 1}: Advertencia - Descripción vacía`);
      continue;
    }
    if (level === 2 && (!unidad || isNaN(metrado) || isNaN(precioUnitario) || isNaN(partial) || metrado === 0 || precioUnitario === 0 || partial === 0)) {
      validation.errors.push(`Fila ${i + 1}: Ítem de nivel 2 con datos incompletos o inválidos (Unidad: ${unidad}, Metrado: ${metrado}, P.U.: ${precioUnitario}, Parcial: ${partial})`);
      validation.isValid = false;
      console.log(`Fila ${i + 1}: Error - Datos inválidos para nivel 2`);
      continue;
    }

    console.log(`Fila ${i + 1}: Procesando ítem - Código: ${codigo}, Nivel: ${level}, Unidad: ${unidad}, Metrado: ${metrado}, PrecioUnitario: ${precioUnitario}`);

    const category = categories.find(cat => codigo.startsWith(cat.name));
    if (category && level === 2) category.value += partial;

    // Asignar segmento
    if (level === 0) {
      currentSegment = descripcion;
      console.log(`Fila ${i + 1}: Segmento asignado = ${currentSegment}`);
    }

    // Asignar padre
    let parent: string | null = null;
    if (level === 1 && lastLevel0Parent) {
      parent = lastLevel0Parent;
      console.log(`Fila ${i + 1}: Padre asignado (Nivel 1) = ${parent}`);
    } else if (level === 2 && lastLevel1Parent) {
      parent = lastLevel1Parent;
      console.log(`Fila ${i + 1}: Padre asignado (Nivel 2) = ${parent}`);
    }

    if (level === 0) {
      lastLevel0Parent = descripcion;
      lastLevel1Parent = null;
      console.log(`Fila ${i + 1}: Nuevo padre de nivel 0 = ${lastLevel0Parent}`);
    } else if (level === 1) {
      lastLevel1Parent = descripcion;
      console.log(`Fila ${i + 1}: Nuevo padre de nivel 1 = ${lastLevel1Parent}`);
    }

    // Acumular totales para los niveles superiores
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
      console.log(`Fila ${i + 1}: Total acumulado para ${parent} = ${groupTotals[parent]}`);
    }

    items.push({
      Codigo: codigo,
      ItemPadre: itemPadre,
      ItemHijo: itemHijo,
      ItemNieto: itemNieto,
      Descripción: descripcion,
      Unidad: unidad,
      Cantidad: metrado,
      PrecioUnitario: precioUnitario,
      CostoTotal: partial,
      Category: category ? category.name : 'Other',
      Level: level,
      Parent: parent,
      Segmento: currentSegment,
    });
  }

  // Actualizar CostoTotal para niveles superiores
  for (let item of items) {
    if (item.Level < 2) {
      item.CostoTotal = groupTotals[item.Descripción] || item.CostoTotal;
      console.log(`Actualizando CostoTotal para ${item.Descripción} a ${item.CostoTotal}`);
    }
  }

  console.log('Datos procesados, total de ítems:', items.length, 'Lista de ítems:', items);
  console.log('Reporte de validación:', validation);
  return { items, validation };
}

export async function POST(request: NextRequest) {
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

    const files = formData.entries();
    let filePath: string | null = null;

    for (const [key, value] of files) {
      if (key.startsWith("file-") && value instanceof File) {
        const file = value as File;
        const fileName = file.name;
        const fileExtension = fileName.split(".").pop()?.toLowerCase();

        const allowedTypes = ["xlsx", "xls"];
        if (!fileExtension || !allowedTypes.includes(fileExtension)) {
          return NextResponse.json(
            { error: `Tipo de archivo no permitido: ${fileName}. Solo se permiten Excel.` },
            { status: 400 }
          );
        }

        const categoryFolder = category.replace(/[^a-zA-Z0-9]/g, "_");
        const uploadDir = path.join(process.cwd(), "public", "Expedientes", categoryFolder);
        filePath = path.join(uploadDir, fileName);

        await fs.mkdir(uploadDir, { recursive: true });
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(filePath, buffer);
        break;
      }
    }

    if (!filePath) {
      return NextResponse.json(
        { error: "No se encontró ningún archivo para previsualizar." },
        { status: 400 }
      );
    }

    const { items, validation } = await parseExcelFile(filePath);
    return NextResponse.json(
      { success: true, items, validation },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error en la previsualización:", error);
    return NextResponse.json(
      { error: "No se pudo previsualizar el archivo Excel", details: error.message },
      { status: 400 }
    );
  }
}