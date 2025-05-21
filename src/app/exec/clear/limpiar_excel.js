
const XLSX = require('xlsx');
const fs = require('fs');

// Leer el archivo original
const filePath = 'NE_007.xlsx'; // Ajusta la ruta según tu entorno
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convertir a JSON para inspeccionar
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
console.log('Primeras 5 filas originales:', data.slice(0, 5));

// Limpiar la primera fila (encabezados)
data[0] = ['Item', 'Descripción', 'Und.', 'Metrado', 'P.U.', 'Parcial'];

// Crear un nuevo libro y hoja
const newWorkbook = XLSX.utils.book_new();
const newSheet = XLSX.utils.aoa_to_sheet(data);
XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);

// Guardar el archivo limpio
XLSX.writeFile(newWorkbook, 'NE_007_clean.xlsx');
console.log('Archivo limpio guardado como NE_007_clean.xlsx');
