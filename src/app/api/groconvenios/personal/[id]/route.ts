import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

// Interfaz para tipar la respuesta
interface Personal {
  id_personal: number;
  id_cargo: number | null;
  descripcion?: string;
  nombre: string;
  Apellido_Paterno: string;
  Apellido_Materno: string;
  dni: string;
  celular: string;
  correo: string;
  profesion: string;
}

// Función para validar y obtener la configuración de la base de datos
const getDbConfig = () => {
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
    throw new Error(
      `Faltan las siguientes variables de entorno: ${variablesFaltantes.join(", ")}`
    );
  }

  return {
    user: variablesRequeridas.DB_USER as string,
    password: variablesRequeridas.DB_PASSWORD as string,
    server: variablesRequeridas.DB_SERVER as string,
    database: variablesRequeridas.DB_NAME as string,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
};

// Función para conectar a la base de datos
const connectToDatabase = async () => {
  try {
    const config = getDbConfig();
    const pool = await sql.connect(config);
    return pool;
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    throw error;
  }
};

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    
    // Validar el ID
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: "ID inválido, debe ser un número positivo" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validación de campos requeridos
    const requiredFields = ["nombre", "Apellido_Paterno", "Apellido_Materno", "dni"];
    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Faltan los siguientes campos requeridos: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("id_cargo", sql.Int, body.id_cargo || null)
      .input("nombre", sql.NVarChar(100), body.nombre)
      .input("Apellido_Paterno", sql.NVarChar(100), body.Apellido_Paterno)
      .input("Apellido_Materno", sql.NVarChar(100), body.Apellido_Materno)
      .input("dni", sql.NVarChar(20), body.dni)
      .input("celular", sql.NVarChar(20), body.celular || null)
      .input("correo", sql.NVarChar(100), body.correo || null)
      .input("profesion", sql.NVarChar(100), body.profesion || null)
      .query(`
        UPDATE [${process.env.DB_NAME}].[dbo].[Personal] 
        SET id_cargo = @id_cargo, 
            nombre = @nombre, 
            Apellido_Paterno = @Apellido_Paterno, 
            Apellido_Materno = @Apellido_Materno, 
            dni = @dni, 
            celular = @celular, 
            correo = @correo, 
            profesion = @profesion 
        WHERE id_personal = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "Personal no encontrado" }, { status: 404 });
    }

    const updatedPersonal: Personal = {
      id_personal: id,
      id_cargo: body.id_cargo || null,
      nombre: body.nombre,
      Apellido_Paterno: body.Apellido_Paterno,
      Apellido_Materno: body.Apellido_Materno,
      dni: body.dni,
      celular: body.celular || "",
      correo: body.correo || "",
      profesion: body.profesion || "",
    };

    return NextResponse.json(updatedPersonal);
  } catch (error) {
    console.error("Error en la consulta PUT:", error);
    return NextResponse.json(
      {
        error: "No se pudo actualizar el personal",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    // Validar el ID
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: "ID inválido, debe ser un número positivo" },
        { status: 400 }
      );
    }

    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM [${process.env.DB_NAME}].[dbo].[Personal] WHERE id_personal = @id`);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "Personal no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Personal eliminado" });
  } catch (error) {
    console.error("Error en la consulta DELETE:", error);
    return NextResponse.json(
      {
        error: "No se pudo eliminar el personal",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}