import sql from "mssql";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import * as XLSX from "xlsx";
dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || "",
  database: process.env.DB_NAME2, // Usando DB-UGT
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const connectToDatabase = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      const pool = await new sql.ConnectionPool(config).connect();
      console.log("Connected to SQL Server at", new Date().toLocaleString());
      return pool;
    } catch (err) {
      console.error("Database Connection Failed! Retrying...", err);
      retries -= 1;
      if (retries === 0) throw err;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

class Mailer {
  transporter: any;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      tls: {
        rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "false",
      },
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(options: { from: string; to: string; subject: string; text?: string; attachments?: any[] }) {
    if (!options.from) throw new Error("El campo 'from' es obligatorio");
    if (!options.to) throw new Error("El campo 'to' es obligatorio");
    if (!options.subject) throw new Error("El campo 'subject' es obligatorio");
    try {
      await this.transporter.sendMail(options);
      console.log(`Correo enviado a ${options.to} at ${new Date().toLocaleString()}`);
      return true;
    } catch (error) {
      console.error("Error al enviar correo:", error);
      return false;
    }
  }
}

const mailer = new Mailer();

export async function POST(request: Request) {
  const { destinatario, año, mes } = await request.json();

  // Validate input
  if (!destinatario || !año || !mes) {
    return new Response(JSON.stringify({ success: false, message: "Todos los campos son obligatorios" }), { status: 400 });
  }

  let pool;
  try {
    pool = await connectToDatabase();
    const query = `
      SELECT * 
      FROM GeovisorV52025 
      WHERE YEAR(fecha_hora) = @año 
        AND MONTH(fecha_hora) = @mes
    `;
    const result = await pool.request()
      .input("año", sql.Int, parseInt(año))
      .input("mes", sql.Int, parseInt(mes))
      .query(query);

    if (result.recordset.length === 0) {
      return new Response(JSON.stringify({ success: false, message: "No se encontraron datos para los criterios seleccionados" }), { status: 404 });
    }

    const worksheet = XLSX.utils.json_to_sheet(result.recordset);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GeovisorData");

    // Generar el archivo en memoria como buffer
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: destinatario,
      subject: `Exportación de Datos - GeovisorV52025 ${año}-${mes}`,
      text: `Adjunto se encuentra el archivo Excel con los datos de GeovisorV52025 para todos los departamentos en ${año}-${mes}.`,
      attachments: [
        {
          filename: `GeovisorV52025_export_${año}_${mes}.xlsx`,
          content: buffer,
        },
      ],
    };

    const emailSent = await mailer.sendMail(mailOptions);
    if (!emailSent) {
      throw new Error("Error al enviar el correo");
    }

    console.log(`Export and email process completed at ${new Date().toLocaleString()} from ${config.database}`);
    return new Response(JSON.stringify({ success: true, message: "Datos exportados y enviados por correo exitosamente" }), { status: 200 });
  } catch (error) {
    console.error("Error in export and send process:", error);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  } finally {
    if (pool) await pool.close();
  }
}


