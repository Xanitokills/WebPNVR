import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";

// Interfaces
interface BudgetItem {
  Codigo: string;
  ItemPadre: string;
  ItemHijo: string;
  ItemNieto: string;
  Descripción: string;
  Unidad: string;
  Metrado: number; // Renombrado de Cantidad a Metrado para mayor claridad
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

interface ExcelParseResult {
  items: BudgetItem[];
  validation: ValidationReport;
}

// Configuración
const ALLOWED_FILE_TYPES = ["xlsx", "xls"];
const MAX_HEADER_SEARCH_ROWS = 20;
const MAX_ROWS = 10000;

// Categorías predefinidas
const CATEGORIES = [
  { 
    name: "Materials", 
    codes: ["201", "204", "205", "207", "210", "211", "213", "216", "217", "222", 
            "231", "234", "237", "238", "240", "241", "251", "262", "264", "265", 
            "267", "268", "270", "272", "276", "293", "294", "295", "296", "298", "299"] 
  },
  { name: "Labor", codes: ["101"] },
  { name: "Equipment", codes: ["301"] },
  { name: "Freight", codes: ["203"] },
];

// Sinónimos para encabezados
const HEADER_SYNONYMS = [
  { expected: "Item", synonyms: ["item", "código", "codigo", "id"] },
  { expected: "Descripción", synonyms: ["descripción", "descripcion", "nombre", "detalle"] },
  { expected: "Und.", synonyms: ["und", "unidad", "unid", "u"] },
  { expected: "Metrado", synonyms: ["metrado", "cantidad", "cant", "qty"] },
  { expected: "P.U.", synonyms: ["p.u", "precio unitario", "precio", "unitario", "pu"] },
  { expected: "Parcial", synonyms: ["parcial", "total", "costo", "subtotal"] },
];

// Lista simulada de convenios válidos
const VALID_CONVENIO_IDS = [1, 2, 3, 4, 5];

/**
 * Normaliza un encabezado eliminando espacios y puntos.
 * @param header - El encabezado a normalizar.
 * @returns El encabezado normalizado.
 */
function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");
}

/**
 * Busca la fila de encabezados en los datos del Excel, enfocándose en la fila 15 y aceptando 2 celdas vacías después de 'Item'.
 * @param data - Matriz de datos del Excel.
 * @returns Objeto con el índice de la fila de encabezados y el mapeo de encabezados a índices de columna.
 * @throws Error si no se encuentran encabezados válidos en la fila 15.
 */
function findHeaderRow(data: unknown[][]): { rowIndex: number; headers: { [key: string]: number } } {
  const targetRowIndex = 14; // Fila 15
  if (data.length <= targetRowIndex || !data[targetRowIndex]) {
    console.log("Datos disponibles:", data.map(row => row.map(cell => cell?.toString().trim() || "").join("|")).slice(0, 20)); // Muestra las primeras 20 filas
    throw new Error("Formato de archivo Excel inválido: no se encontraron datos en la fila 15");
  }

  const row = data[targetRowIndex];
  console.log("Fila 15 cruda (índices 0-9):", row.slice(0, 10).map((cell, idx) => `${idx}: ${cell?.toString().trim() || '<vacío>'}`).join(", ")); // Muestra los primeros 10 elementos
  console.log("Longitud total de fila 15:", row.length);

  if (row.length < 8 || !row.some(cell => cell?.toString().trim())) {
    console.log("Contenido de fila 15 completo:", row.map((cell, idx) => `${idx}: ${cell?.toString().trim() || '<vacío>'}`).join(", "));
    throw new Error("Formato de archivo Excel inválido: la fila 15 no contiene suficientes columnas (se esperaban al menos 8)");
  }

  const headers = row.map(h => h?.toString().trim() || "");
  console.log("Encabezados crudos en fila 15:", headers);
  const normalizedHeaders = headers.map(normalizeHeader);
  console.log("Encabezados normalizados:", normalizedHeaders);

  const foundHeaders: { [key: string]: number } = {};
  let matches = 0;

  const expectedOrder = ["Item", null, null, "Descripción", "Und.", "Metrado", "P.U.", "Parcial"];
  for (let i = 0; i < Math.min(normalizedHeaders.length, expectedOrder.length); i++) {
    const expected = expectedOrder[i];
    const header = normalizedHeaders[i];
    console.log(`Índice ${i}: Esperado '${expected}', Encontrado '${header}'`);

    if (expected === null) {
      continue;
    }

    if (header && (header === normalizeHeader(expected) || HEADER_SYNONYMS.find(s => s.expected === expected)?.synonyms.some(syn => header.includes(normalizeHeader(syn))))) {
      foundHeaders[expected] = i;
      matches++;
      console.log(`Encabezado '${expected}' encontrado en índice ${i}`);
    }
  }

  console.log("Total de coincidencias:", matches);
  console.log("Mapeo de encabezados:", foundHeaders);

  if (matches < 5) {
    throw new Error(`Formato de archivo Excel inválido: se esperaban 5 encabezados en la fila 15 (Item, Descripción, Und., Metrado, P.U., Parcial), encontrados: ${headers.filter(h => h).join(", ")}`);
  }

  return { rowIndex: targetRowIndex, headers: foundHeaders };
}

/**
 * Procesa un archivo Excel y extrae ítems de presupuesto.
 * @param workbook - Workbook de XLSX.
 * @returns Resultado con ítems parseados y reporte de validación.
 * @throws Error si el archivo no es válido o no se encuentra la hoja requerida.
 */
function parseExcelFile(workbook: XLSX.WorkBook): { items: BudgetItem[]; validation: ValidationReport } {
  const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes("presupuesto"));
  if (!sheetName) {
    throw new Error(`No se encontró la pestaña 'PRESUPUESTO' en el archivo Excel. Hojas disponibles: ${workbook.SheetNames.join(", ")}`);
  }

  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: "" }) as unknown[][];

  const { rowIndex, headers } = findHeaderRow(data);
  const startDataRow = rowIndex + 1; // Datos comienzan en fila 16

  const items: BudgetItem[] = [];
  const validation: ValidationReport = { warnings: [], errors: [], isValid: true };

  for (let i = startDataRow; i < data.length; i++) {
    const row = data[i] as string[];
    if (!row || row.length < 8) continue; // Ignorar filas vacías o con menos de 8 columnas

    const itemStr = row[headers["Item"]] || "";
    const description = row[headers["Descripción"]] || "";
    const unit = row[headers["Und."]] || "";
    const quantityStr = row[headers["Metrado"]] || "";
    const precioUnitarioStr = row[headers["P.U."]] || "";
    const parcialStr = row[headers["Parcial"]] || "";

    if (!itemStr && !description) continue; // Ignorar filas completamente vacías

    // Imprimir valor crudo de Metrado para depuración
    console.log(`Fila ${i + 1} - Valor crudo de Metrado:`, quantityStr);

    const itemParts = itemStr.split(" - ").filter(part => part.trim());
    const level = itemParts.length - 1;
    const code = itemStr;
    const quantity = parseFloat(quantityStr.replace(/[^0-9.-]/g, "")) || 0;
    const precioUnitario = parseFloat(precioUnitarioStr.replace(/[^0-9.-]/g, "")) || 0;
    const parcial = parseFloat(parcialStr.replace(/[^0-9.-]/g, "")) || 0;

    items.push({
      Codigo: code,
      ItemPadre: level > 0 ? itemParts.slice(0, -1).join(" - ") : "",
      ItemHijo: level > 1 ? itemParts.slice(-2, -1).join(" - ") : "",
      ItemNieto: level > 2 ? itemParts.slice(-1).join(" - ") : "",
      Descripción: description,
      Unidad: unit,
      Metrado: quantity, // Renombrado de Cantidad a Metrado
      PrecioUnitario: precioUnitario,
      CostoTotal: parcial,
      Category: "METRADOS Y PRESUPUESTO", // Categoría fija
      Level: level,
      Parent: level > 0 ? itemParts.slice(0, -1).join(" - ") : undefined,
      Segmento: "", // Sin segmento definido
    });
  }

  return { items, validation };
}

/**
 * Maneja la solicitud POST para procesar un archivo Excel subido.
 * @param request - La solicitud Next.js.
 * @returns Respuesta JSON con los ítems procesados, validación y metadatos.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const category = formData.get("category")?.toString();
    const id_convenio = formData.get("id_convenio")?.toString();

    if (!category || !id_convenio) {
      return NextResponse.json(
        { error: "Se requieren category e id_convenio" },
        { status: 400 }
      );
    }

    // Validar id_convenio
    if (!VALID_CONVENIO_IDS.includes(Number(id_convenio))) {
      return NextResponse.json(
        { error: "ID de convenio inválido" },
        { status: 400 }
      );
    }

    let filePath: string | null = null;
    
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file-") && value instanceof File) {
        const file = value;
        const fileExtension = file.name.split(".").pop()?.toLowerCase();

        if (!fileExtension || !ALLOWED_FILE_TYPES.includes(fileExtension)) {
          return NextResponse.json(
            { error: "Solo se permiten archivos Excel (.xlsx, .xls)" },
            { status: 400 }
          );
        }

        const safeCategory = category.replace(/[^a-zA-Z0-9]/g, "_");
        const uploadDir = path.join(process.cwd(), "public", "Expedientes", safeCategory);
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;
        filePath = path.join(uploadDir, uniqueFileName);

        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
        break;
      }
    }

    if (!filePath) {
      return NextResponse.json(
        { error: "No se encontró archivo válido para procesar" },
        { status: 400 }
      );
    }

    // Leer el archivo Excel
    const fileBuffer = await fs.readFile(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    const { items, validation } = parseExcelFile(workbook);
    
    // Imprimir los datos en la consola del servidor
    console.log("Datos procesados del archivo Excel:", {
      items: items,
      validation: validation,
      category: category,
      id_convenio: id_convenio
    });
    
    // Eliminar el archivo temporal
    try {
      await fs.unlink(filePath);
    } catch (cleanupError) {
      console.warn("No se pudo eliminar el archivo temporal:", cleanupError);
    }

    return NextResponse.json(
      { 
        success: true, 
        data: {
          items,
          validation,
          metadata: {
            category,
            id_convenio,
            processedAt: new Date().toISOString(),
            itemCount: items.length
          }
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en el servidor:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { 
        error: "Error al procesar el archivo", 
        details: errorMessage,
        success: false
      },
      { status: 500 }
    );
  }
}