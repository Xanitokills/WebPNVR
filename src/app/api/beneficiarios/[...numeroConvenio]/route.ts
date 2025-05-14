import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';

export async function GET(request: NextRequest, context: { params: Promise<{ numeroConvenio: string[] }> }) {
  // Esperamos a que se resuelvan los params
  const params = await context.params;
  // Unimos los segmentos del numeroConvenio en un solo string
  const numeroConvenio = params.numeroConvenio.join('/');

  // Verificamos las variables de entorno
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
      { error: `Faltan las siguientes variables de entorno: ${variablesFaltantes.join(', ')}` },
      { status: 500 }
    );
  }

  // Configuración de la conexión a la base de datos
  const configuracion = {
    user: variablesRequeridas.DB_USER as string,
    password: variablesRequeridas.DB_PASSWORD as string,
    server: variablesRequeridas.DB_SERVER as string,
    database: 'DB-PNVR',
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  try {
    const pool = await sql.connect(configuracion);
    const resultado = await pool.request()
      .input('numeroConvenio', sql.VarChar, numeroConvenio)
      .query(`
        SELECT Departamento, Provincia, Distrito, [Centro Poblado], Nombre, Ape_Paterno, Ape_Materno, DNI, Sexo, [Estado Sit# vivienda]
        FROM BD_Beneficiario
        WHERE [Número de Convenio] = @numeroConvenio
      `);
    return NextResponse.json(resultado.recordset);
  } catch (error) {
    console.error('Error en la consulta:', error);
    return NextResponse.json({ error: 'No se pudieron obtener los datos de los beneficiarios' }, { status: 500 });
  }
}