import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';

const dbConfig = {
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  server: process.env.DB_SERVER as string,
  database: process.env.DB_NAME as string,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

interface BudgetItem {
  Codigo: string;
  Descripción: string;
  Unidad: string;
  Metrado: number;
  PrecioUnitario: number;
  CostoTotal: number;
  Level: number;
  Parent?: string;
  CategoriaID?: number;
  SubcategoriaID?: number;
  NombreCategoria?: string;
  NombreSubcategoria?: string;
}

interface Category {
  name: string;
  value: number;
  codes: string[];
}

export async function GET(request: NextRequest) {
  let pool;
  try {
    const { searchParams } = new URL(request.url);
    const id_convenio = searchParams.get('id_convenio');

    if (!id_convenio) {
      return NextResponse.json({ error: 'El id_convenio es requerido' }, { status: 400 });
    }

    pool = await sql.connect(dbConfig);

    // Obtener categorías
    const categoriesResult = await pool.query(`
      SELECT CategoriaID, NombreCategoria
      FROM [dbo].[PNVR_CategoriasPresupuesto]
    `);

    // Obtener subcategorías
    const subcategoriesResult = await pool.query(`
      SELECT SubcategoriaID, CategoriaID, NombreSubcategoria AS Descripción
      FROM [dbo].[PNVR_SubcategoriasPresupuesto]
    `);

    // Obtener ítems detallados
    const itemsResult = await pool
      .request()
      .input('id_convenio', sql.Int, parseInt(id_convenio))
      .query(`
        SELECT ip.ItemPresupuestoID, ip.id_convenio, ip.CategoriaID, ip.SubcategoriaID, ip.CodigoItem, ip.Descripcion, ip.Unidad, ip.Cantidad AS Metrado, ip.PrecioUnitario, ip.CostoTotal, cp.NombreCategoria, sp.NombreSubcategoria
        FROM [dbo].[PNVR_ItemsPresupuesto] ip
        LEFT JOIN [dbo].[PNVR_CategoriasPresupuesto] cp ON ip.CategoriaID = cp.CategoriaID
        LEFT JOIN [dbo].[PNVR_SubcategoriasPresupuesto] sp ON ip.SubcategoriaID = sp.SubcategoriaID
        WHERE ip.id_convenio = @id_convenio
        ORDER BY ip.CodigoItem
      `);

    if (itemsResult.recordset.length === 0) {
      return NextResponse.json({ error: 'No se encontraron ítems de presupuesto para este convenio' }, { status: 404 });
    }

    const categories: Category[] = [
      { name: 'Materials', value: 0, codes: ['201', '204', '205', '207', '210', '211', '213', '216', '217', '222', '231', '234', '237', '238', '240', '241', '251', '262', '264', '265', '267', '268', '270', '272', '276', '293', '294', '295', '296', '298', '299'] },
      { name: 'Labor', value: 0, codes: ['101'] },
      { name: 'Equipment', value: 0, codes: ['301'] },
      { name: 'Freight', value: 0, codes: ['203'] },
    ];

    const items: BudgetItem[] = [];
    const groupTotals: { [key: string]: number } = {};

    // Paso 1: Agregar categorías (nivel 0)
    for (const category of categoriesResult.recordset) {
      items.push({
        Codigo: category.CategoriaID.toString(),
        Descripción: category.NombreCategoria,
        Unidad: '',
        Metrado: 0,
        PrecioUnitario: 0,
        CostoTotal: 0,
        Level: 0,
        CategoriaID: category.CategoriaID,
        NombreCategoria: category.NombreCategoria,
      });
    }

    // Paso 2: Agregar subcategorías (nivel 1)
    for (const subcategory of subcategoriesResult.recordset) {
      const parentCategory = categoriesResult.recordset.find(cat => cat.CategoriaID === subcategory.CategoriaID)?.NombreCategoria;
      items.push({
        Codigo: subcategory.SubcategoriaID.toString(),
        Descripción: subcategory.Descripción,
        Unidad: '',
        Metrado: 0,
        PrecioUnitario: 0,
        CostoTotal: 0,
        Level: 1,
        Parent: parentCategory,
        SubcategoriaID: subcategory.SubcategoriaID,
        CategoriaID: subcategory.CategoriaID,
        NombreCategoria: parentCategory,
        NombreSubcategoria: subcategory.Descripción,
      });
    }

    // Paso 3: Procesar ítems detallados (nivel 2)
    for (const row of itemsResult.recordset) {
      const codigo = row.CodigoItem;
      const parts = codigo?.split('.').map(Number) || [];
      const level = parts.length - 1;
      let parent: string | undefined;

      if (level > 0) {
        const parentParts = parts.slice(0, -1);
        const parentCodigo = parentParts.join('.');
        if (level === 2) {
          const parentItem = itemsResult.recordset.find(item => item.CodigoItem === parentCodigo);
          parent = parentItem?.NombreSubcategoria || parentItem?.NombreCategoria;
        }
      }

      // Calcular CostoTotal solo para ítems de nivel 2 si tienen Metrado y PrecioUnitario
      let cost = row.CostoTotal || 0;
      if (level === 2 && row.Metrado && row.PrecioUnitario) {
        cost = row.Metrado * row.PrecioUnitario;
      }

      const category = categories.find(cat => cat.codes.some(prefix => codigo?.startsWith(prefix) || ''));
      if (category && level === 2) category.value += cost;

      items.push({
        Codigo: codigo || '',
        Descripción: row.Descripcion,
        Unidad: row.Unidad || '',
        Metrado: row.Metrado || 0,
        PrecioUnitario: row.PrecioUnitario || 0,
        CostoTotal: cost,
        Level: level,
        Parent: parent,
        CategoriaID: row.CategoriaID,
        SubcategoriaID: row.SubcategoriaID,
        NombreCategoria: row.NombreCategoria,
        NombreSubcategoria: row.NombreSubcategoria,
      });

      // Sumar los costos para los ítems padres (nivel 0 y 1)
      if (level === 2 && parent) {
        let currentParent = parent;
        while (currentParent) {
          groupTotals[currentParent] = (groupTotals[currentParent] || 0) + cost;
          const parentItem = items.find(item => item.Descripción === currentParent);
          currentParent = parentItem?.Parent;
        }
        if (row.NombreCategoria) {
          groupTotals[row.NombreCategoria] = (groupTotals[row.NombreCategoria] || 0) + cost;
        }
      }
    }

    // Paso 4: Actualizar CostoTotal para ítems de nivel 0 y 1 con la suma de sus hijos
    for (let item of items) {
      if (item.Level < 2) {
        item.CostoTotal = groupTotals[item.Descripción] || item.CostoTotal;
        item.Metrado = 0;
        item.PrecioUnitario = 0;
      }
    }

    // Paso 5: Incluir ítems de resumen como FINANCIA PNVR
    const summaryCategories = [
      { CategoriaID: 51, Descripción: 'COSTO DIRECTO' },
      { CategoriaID: 52, Descripción: 'COSTO INDIRECTO' },
      { CategoriaID: 53, Descripción: 'COSTO TOTAL' },
      { CategoriaID: 54, Descripción: 'APORTE' },
      { CategoriaID: 55, Descripción: 'FINANCIA PNVR' },
    ];

    for (const summary of summaryCategories) {
      const total = items
        .filter(item => item.CategoriaID === summary.CategoriaID && item.Level === 0)
        .reduce((sum, item) => sum + item.CostoTotal, 0);
      items.push({
        Codigo: summary.CategoriaID.toString(),
        Descripción: summary.Descripción,
        Unidad: '',
        Metrado: 0,
        PrecioUnitario: 0,
        CostoTotal: total > 0 ? total : (itemsResult.recordset.find(item => item.CategoriaID === summary.CategoriaID)?.CostoTotal || 0),
        Level: 0,
        CategoriaID: summary.CategoriaID,
        NombreCategoria: summary.Descripción,
      });
    }

    const budgetData = { items, categories: categories.map(cat => ({ name: cat.name, value: cat.value })) };

    return NextResponse.json(budgetData, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'No se pudo procesar los datos del presupuesto', details: error.message }, { status: 500 });
  } finally {
    if (pool) await pool.close();
  }
}