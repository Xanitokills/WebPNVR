import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';

export async function GET(request: NextRequest, context: { params: Promise<{ numeroConvenio: string[] }> }) {
  const params = await context.params;
  const numeroConvenio = params.numeroConvenio.join('/');

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
      .input('numeroConvenio', sql.NVarChar(255), numeroConvenio)
      .query(`
        SELECT 
          [OBJECTID], [Departamento], [Provincia], [Distrito], [Centro Poblado], [Ubigeo], [Ubigeo CP], [Comunidad],
          [Prioridad (1)], [Prioridad (2)], [Número de Convenio], [Nombre de Proyecto], [Codigo UGT], [Agrupación],
          [Año Intervención], [Tipo Fenómeno], [Tipo Material], [Tipo de Intervención], [ID_Usuario], [Nombre],
          [Ape_Paterno], [Ape_Materno], [DNI], [CUV], [Sexo], [Fecha de Nacimiento], [edad], [Número de Miembros],
          [Estado Sit# vivienda], [Sub Estado], [Fecha de Inicio], [Fecha de Termino], [Año Culminación vivienda],
          [latitud], [longitud], [altitud], [ID SSP], [Documento], [Modalidad], [observaciones_1], [observaciones_2],
          [Fuente], [fech_actual], [ID_Deductivos], [Programación Linea Base 2], [Paquete Programadas],
          [Reprogramación], [Cartera], [Tipo], [Programación Linea Base 1], [Sectoristas], [Fecha Inicio Proyectada],
          [Fecha Termino Proyectada], [Transferencia PNVR], [Aporte del beneficiario], [Costo Total], [Monto Liquidacion],
          [calculo]
        FROM [DB-PNVR].[dbo].[BD_Beneficiario]
        WHERE [Número de Convenio] = @numeroConvenio
      `);
    return NextResponse.json(resultado.recordset);
  } catch (error) {
    console.error('Error en la consulta GET:', error);
    return NextResponse.json({ error: 'No se pudieron obtener los datos de los beneficiarios', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ numeroConvenio: string[] }> }) {
  const params = await context.params;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const numeroConvenio = params.numeroConvenio.join('/');

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
    const body = await request.json();
    const {
      OBJECTID,
      Departamento,
      Provincia,
      Distrito,
      'Centro Poblado': CentroPoblado,
      Ubigeo,
      'Ubigeo CP': UbigeoCP,
      Comunidad,
      'Prioridad (1)': Prioridad1,
      'Prioridad (2)': Prioridad2,
      'Número de Convenio': NumeroConvenio,
      'Nombre de Proyecto': NombreProyecto,
      'Codigo UGT': CodigoUGT,
      Agrupación,
      'Año Intervención': AñoIntervencion,
      'Tipo Fenómeno': TipoFenomeno,
      'Tipo Material': TipoMaterial,
      'Tipo de Intervención': TipoIntervencion,
      ID_Usuario,
      Nombre,
      Ape_Paterno,
      Ape_Materno,
      DNI,
      CUV,
      Sexo,
      'Fecha de Nacimiento': FechaNacimiento,
      edad,
      'Número de Miembros': NumeroMiembros,
      'Estado Sit# vivienda': EstadoSitVivienda,
      'Sub Estado': SubEstado,
      'Fecha de Inicio': FechaInicio,
      'Fecha de Termino': FechaTermino,
      'Año Culminación vivienda': AñoCulminacionVivienda,
      latitud,
      longitud,
      altitud,
      'ID SSP': IDSSP,
      Documento,
      Modalidad,
      observaciones_1,
      observaciones_2,
      Fuente,
      fech_actual,
      ID_Deductivos,
      'Programación Linea Base 2': ProgramacionLineaBase2,
      'Paquete Programadas': PaqueteProgramadas,
      Reprogramación,
      Cartera,
      Tipo,
      'Programación Linea Base 1': ProgramacionLineaBase1,
      Sectoristas,
      'Fecha Inicio Proyectada': FechaInicioProyectada,
      'Fecha Termino Proyectada': FechaTerminoProyectada,
      'Transferencia PNVR': TransferenciaPNVR,
      'Aporte del beneficiario': AporteBeneficiario,
      'Costo Total': CostoTotal,
      'Monto Liquidacion': MontoLiquidacion,
      calculo,
    } = body;

    const pool = await sql.connect(configuracion);
    await pool.request()
      .input('OBJECTID', sql.Float, OBJECTID ? parseFloat(OBJECTID) : null)
      .input('Departamento', sql.NVarChar(255), Departamento || null)
      .input('Provincia', sql.NVarChar(255), Provincia || null)
      .input('Distrito', sql.NVarChar(255), Distrito || null)
      .input('CentroPoblado', sql.NVarChar(255), CentroPoblado || null)
      .input('Ubigeo', sql.NVarChar(255), Ubigeo || null)
      .input('UbigeoCP', sql.NVarChar(255), UbigeoCP || null)
      .input('Comunidad', sql.NVarChar(255), Comunidad || null)
      .input('Prioridad1', sql.Float, Prioridad1 ? parseFloat(Prioridad1) : null)
      .input('Prioridad2', sql.Float, Prioridad2 ? parseFloat(Prioridad2) : null)
      .input('NumeroConvenio', sql.NVarChar(255), NumeroConvenio || null)
      .input('NombreProyecto', sql.NVarChar(255), NombreProyecto || null)
      .input('CodigoUGT', sql.NVarChar(255), CodigoUGT || null)
      .input('Agrupacion', sql.NVarChar(255), Agrupación || null)
      .input('AñoIntervencion', sql.NVarChar(255), AñoIntervencion || null)
      .input('TipoFenomeno', sql.NVarChar(255), TipoFenomeno || null)
      .input('TipoMaterial', sql.NVarChar(255), TipoMaterial || null)
      .input('TipoIntervencion', sql.NVarChar(255), TipoIntervencion || null)
      .input('ID_Usuario', sql.Float, parseFloat(ID_Usuario))
      .input('Nombre', sql.NVarChar(255), Nombre || null)
      .input('Ape_Paterno', sql.NVarChar(255), Ape_Paterno || null)
      .input('Ape_Materno', sql.NVarChar(255), Ape_Materno || null)
      .input('DNI', sql.NVarChar(255), DNI || null)
      .input('CUV', sql.NVarChar(255), CUV || null)
      .input('Sexo', sql.NVarChar(255), Sexo || null)
      .input('FechaNacimiento', sql.DateTime, FechaNacimiento ? new Date(FechaNacimiento) : null)
      .input('edad', sql.Float, edad ? parseFloat(edad) : null)
      .input('NumeroMiembros', sql.Float, NumeroMiembros ? parseFloat(NumeroMiembros) : null)
      .input('EstadoSitVivienda', sql.NVarChar(255), EstadoSitVivienda || null)
      .input('SubEstado', sql.NVarChar(255), SubEstado || null)
      .input('FechaInicio', sql.DateTime, FechaInicio ? new Date(FechaInicio) : null)
      .input('FechaTermino', sql.DateTime, FechaTermino ? new Date(FechaTermino) : null)
      .input('AñoCulminacionVivienda', sql.NVarChar(255), AñoCulminacionVivienda || null)
      .input('latitud', sql.Float, latitud ? parseFloat(latitud) : null)
      .input('longitud', sql.Float, longitud ? parseFloat(longitud) : null)
      .input('altitud', sql.Float, altitud ? parseFloat(altitud) : null)
      .input('IDSSP', sql.Float, IDSSP ? parseFloat(IDSSP) : null)
      .input('Documento', sql.NVarChar(255), Documento || null)
      .input('Modalidad', sql.NVarChar(255), Modalidad || null)
      .input('observaciones_1', sql.NVarChar(255), observaciones_1 || null)
      .input('observaciones_2', sql.NVarChar(255), observaciones_2 || null)
      .input('Fuente', sql.NVarChar(255), Fuente || null)
      .input('fech_actual', sql.DateTime, fech_actual ? new Date(fech_actual) : null)
      .input('ID_Deductivos', sql.Float, ID_Deductivos ? parseFloat(ID_Deductivos) : null)
      .input('ProgramacionLineaBase2', sql.NVarChar(255), ProgramacionLineaBase2 || null)
      .input('PaqueteProgramadas', sql.NVarChar(255), PaqueteProgramadas || null)
      .input('Reprogramacion', sql.NVarChar(255), Reprogramación || null)
      .input('Cartera', sql.NVarChar(255), Cartera || null)
      .input('Tipo', sql.NVarChar(255), Tipo || null)
      .input('ProgramacionLineaBase1', sql.NVarChar(255), ProgramacionLineaBase1 || null)
      .input('Sectoristas', sql.NVarChar(255), Sectoristas || null)
      .input('FechaInicioProyectada', sql.NVarChar(255), FechaInicioProyectada || null)
      .input('FechaTerminoProyectada', sql.NVarChar(255), FechaTerminoProyectada || null)
      .input('TransferenciaPNVR', sql.NVarChar(255), TransferenciaPNVR || null)
      .input('AporteBeneficiario', sql.NVarChar(255), AporteBeneficiario || null)
      .input('CostoTotal', sql.NVarChar(255), CostoTotal || null)
      .input('MontoLiquidacion', sql.NVarChar(255), MontoLiquidacion || null)
      .input('calculo', sql.NVarChar(255), calculo || null)
      .query(`
        UPDATE [DB-PNVR].[dbo].[BD_Beneficiario]
        SET 
          [Departamento] = @Departamento,
          [Provincia] = @Provincia,
          [Distrito] = @Distrito,
          [Centro Poblado] = @CentroPoblado,
          [Ubigeo] = @Ubigeo,
          [Ubigeo CP] = @UbigeoCP,
          [Comunidad] = @Comunidad,
          [Prioridad (1)] = @Prioridad1,
          [Prioridad (2)] = @Prioridad2,
          [Número de Convenio] = @NumeroConvenio,
          [Nombre de Proyecto] = @NombreProyecto,
          [Codigo UGT] = @CodigoUGT,
          [Agrupación] = @Agrupacion,
          [Año Intervención] = @AñoIntervencion,
          [Tipo Fenómeno] = @TipoFenomeno,
          [Tipo Material] = @TipoMaterial,
          [Tipo de Intervención] = @TipoIntervencion,
          [ID_Usuario] = @ID_Usuario,
          [Nombre] = @Nombre,
          [Ape_Paterno] = @Ape_Paterno,
          [Ape_Materno] = @Ape_Materno,
          [DNI] = @DNI,
          [CUV] = @CUV,
          [Sexo] = @Sexo,
          [Fecha de Nacimiento] = @FechaNacimiento,
          [edad] = @edad,
          [Número de Miembros] = @NumeroMiembros,
          [Estado Sit# vivienda] = @EstadoSitVivienda,
          [Sub Estado] = @SubEstado,
          [Fecha de Inicio] = @FechaInicio,
          [Fecha de Termino] = @FechaTermino,
          [Año Culminación vivienda] = @AñoCulminacionVivienda,
          [latitud] = @latitud,
          [longitud] = @longitud,
          [altitud] = @altitud,
          [ID SSP] = @IDSSP,
          [Documento] = @Documento,
          [Modalidad] = @Modalidad,
          [observaciones_1] = @observaciones_1,
          [observaciones_2] = @observaciones_2,
          [Fuente] = @Fuente,
          [fech_actual] = @fech_actual,
          [ID_Deductivos] = @ID_Deductivos,
          [Programación Linea Base 2] = @ProgramacionLineaBase2,
          [Paquete Programadas] = @PaqueteProgramadas,
          [Reprogramación] = @Reprogramacion,
          [Cartera] = @Cartera,
          [Tipo] = @Tipo,
          [Programación Linea Base 1] = @ProgramacionLineaBase1,
          [Sectoristas] = @Sectoristas,
          [Fecha Inicio Proyectada] = @FechaInicioProyectada,
          [Fecha Termino Proyectada] = @FechaTerminoProyectada,
          [Transferencia PNVR] = @TransferenciaPNVR,
          [Aporte del beneficiario] = @AporteBeneficiario,
          [Costo Total] = @CostoTotal,
          [Monto Liquidacion] = @MontoLiquidacion,
          [calculo] = @calculo
        WHERE [OBJECTID] = @OBJECTID
      `);

    return NextResponse.json({ message: 'Beneficiario actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar el beneficiario:', error);
    return NextResponse.json({ error: 'No se pudo actualizar el beneficiario', details: error.message }, { status: 500 });
  }
}