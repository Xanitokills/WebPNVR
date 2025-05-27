import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";

interface BudgetItem {
  Codigo: string;
  Descripción: string;
  Unidad: string;
  Metrado: number | null;
  PrecioUnitario: number | null;
  CostoTotal: number;
  Category: string;
  Level: number;
  Categoria: string;
  Subcategoria: string;
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

const ALLOWED_FILE_TYPES = ["xlsx", "xls"];
const MAX_HEADER_SEARCH_ROWS = 20;
const MAX_ROWS = 10000;

const HEADER_SYNONYMS = [
  { expected: "Item", synonyms: ["item", "código", "codigo", "id"] },
  { expected: "Descripción", synonyms: ["descripción", "descripcion", "nombre", "detalle"] },
  { expected: "Und.", synonyms: ["und.", "unidad", "unid", "u"] },
  { expected: "Metrado", synonyms: ["metrado", "cantidad", "cant", "qty"] },
  { expected: "P.U.", synonyms: ["p.u.", "precio unitario", "precio", "unitario", "pu"] },
  { expected: "Parcial", synonyms: ["parcial", "total", "costo", "subtotal"] },
  { expected: "Categoría", synonyms: ["categoría", "category", "cat"] },
  { expected: "Subcategoría", synonyms: ["subcategoría", "subcategory", "subcat"] },
];

const VALID_CONVENIO_IDS = [1, 2, 3, 4, 5];

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");
}

function findHeaderRow(data: unknown[][]): { rowIndex: number; headers: { [key: string]: number } } {
  const targetRowIndex = 14; // Fila 15 (índice 14)
  if (data.length <= targetRowIndex || !data[targetRowIndex]) {
    console.log("Datos disponibles:", data.map(row => row.map(cell => cell?.toString().trim() || "").join("|")).slice(0, 20));
    throw new Error("Formato de archivo Excel inválido: no se encontraron datos en la fila 15");
  }

  const row = data[targetRowIndex];
  console.log("Fila 15 cruda (índices 0-9):", row.slice(0, 10).map((cell, idx) => `${idx}: ${cell?.toString().trim() || '<vacío>'}`).join(", "));
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

  const expectedOrder = ["Item", "Categoría", "Subcategoría", "Descripción", "Und.", "Metrado", "P.U.", "Parcial"];
  for (let i = 0; i < Math.min(normalizedHeaders.length, expectedOrder.length); i++) {
    const expected = expectedOrder[i];
    const header = normalizedHeaders[i];
    console.log(`Índice ${i}: Esperado '${expected}', Encontrado '${header}'`);

    if (header && (header === normalizeHeader(expected) || HEADER_SYNONYMS.find(s => s.expected === expected)?.synonyms.some(syn => header.includes(normalizeHeader(syn))))) {
      foundHeaders[expected] = i;
      matches++;
      console.log(`Encabezado '${expected}' encontrado en índice ${i}`);
    }
  }

  console.log("Total de coincidencias:", matches);
  console.log("Mapeo de encabezados:", foundHeaders);

  if (matches < 8) {
    throw new Error(`Formato de archivo Excel inválido: se esperaban al menos 8 encabezados en la fila 15, encontrados: ${headers.filter(h => h).join(", ")}`);
  }

  return { rowIndex: targetRowIndex, headers: foundHeaders };
}

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
    if (!row || row.length < 8) continue;

    const itemStr = row[headers["Item"]] || "";
    const categoriaStr = row[headers["Categoría"]] || "";
    const subcategoriaStr = row[headers["Subcategoría"]] || "";
    const description = row[headers["Descripción"]] || "";
    const unit = row[headers["Und."]] || "";
    const quantityStr = row[headers["Metrado"]] || "";
    const precioUnitarioStr = row[headers["P.U."]] || "";
    const parcialStr = row[headers["Parcial"]] || "";

    if (!itemStr && !description) continue;

    const level = subcategoriaStr ? 2 : categoriaStr ? 1 : 0;
    const code = itemStr || (level === 0 ? "01" : level === 1 ? categoriaStr : subcategoriaStr);

    const quantity = level === 2 ? parseFloat(quantityStr.replace(/[^0-9.-]/g, "")) || null : null;
    const precioUnitario = level === 2 ? parseFloat(precioUnitarioStr.replace(/[^0-9.-]/g, "")) || null : null;
    const parcial = parseFloat(parcialStr.replace(/[^0-9.-]/g, "")) || 0;

    // Validar que los datos se estén leyendo correctamente
    if (level === 2 && (!unit || !quantityStr || !precioUnitarioStr)) {
      validation.warnings.push(`Fila ${i + 1}: Datos incompletos para nivel 2 en ${description}`);
    }

    items.push({
      Codigo: code,
      Descripción: description,
      Unidad: level === 2 ? unit : "",
      Metrado: quantity,
      PrecioUnitario: precioUnitario,
      CostoTotal: parcial,
      Category: "METRADOS Y PRESUPUESTO",
      Level: level,
      Categoria: level >= 1 ? categoriaStr : "",
      Subcategoria: level === 2 ? subcategoriaStr : "",
    });
  }

  if (items.length === 0) {
    validation.errors.push("No se encontraron ítems válidos en el archivo Excel");
    validation.isValid = false;
  }

  return { items, validation };
}

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

    const fileBuffer = await fs.readFile(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    const { items, validation } = parseExcelFile(workbook);
    
    console.log("Datos procesados del archivo Excel:", {
      items: items,
      validation: validation,
      category: category,
      id_convenio: id_convenio
    });
    
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