"use client";

import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import "leaflet/dist/leaflet.css";
import { jsPDF } from "jspdf";

// Leaflet will be imported dynamically inside useEffect where needed

interface Persona {
  proyecto: string;
  sFecha: string;
  departamento: string;
  provincia: string;
  distrito: string;
  centropoblado: string;
  beneficiario: string;
  comunidad: string;
  dni: string;
  proyectista: string;
  evaluador: string;
  foto1: string;
  foto2: string;
  confirmainformacion: string;
  confirmadoc: string;
  otrotipodoc: string;
  tipodoc: string;
  latitud: number;
  longitud: number;
  ubicoordx: number;
  ubicoordy: number;
  altitud: number;
  confirmamedidas: string;
  observamedidasterreno: string;
  pendiente: string;
  confirmariesgo: string;
  observariesgo: string;
}

export default function SearchCard() {
  const [dni, setDni] = useState("");
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(true);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni || dni.length !== 8 || !/^\d{8}$/.test(dni)) {
      setError("DNI inválido: debe ser una cadena de 8 dígitos.");
      return;
    }

    setLoading(true);
    setError("");
    setPersona(null);

    try {
      // Using the actual API endpoint provided by the user
      const response = await fetch("/api/expediente/terreno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.persona) {
        setPersona(data.persona);
        setShowForm(false);
      } else {
        setError(data.message || "No se encontró a la persona.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor. Por favor, intenta de nuevo.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const content = document.getElementById("ficha-tecnica");
    if (content) {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(content, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      doc.save("ficha_tecnica.pdf");
    }
  };

  useEffect(() => {
    if (persona && typeof window !== "undefined") {
      import("leaflet").then((L) => {
        // Fix for default marker icon issue with Webpack/Leaflet
        // @ts-expect-error: _getIconUrl is not typed in Leaflet's TypeScript definitions but is required for icon fix
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });

        const map = L.map("map").setView([persona.latitud, persona.longitud], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        L.marker([persona.latitud, persona.longitud])
          .addTo(map)
          .bindPopup("<b>Ubicación del Terreno</b>")
          .openPopup();

        const map2 = L.map("map2").setView([persona.ubicoordy, persona.ubicoordx], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map2);
        L.marker([persona.ubicoordy, persona.ubicoordx])
          .addTo(map2)
          .bindPopup("<b>Coordenadas de ubicación de la carretera más cercana al terreno</b>")
          .openPopup();

        // Cleanup function to remove maps when component unmounts or persona changes
        return () => {
          map.remove();
          map2.remove();
        };
      });
    }
  }, [persona]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center rounded-md">
          Ficha Técnica - Búsqueda por DNI
        </h1>

        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 max-w-lg mx-auto border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Búsqueda de Terreno</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Ingrese el DNI para iniciar el análisis geográfico</p>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <FiSearch className="text-2xl text-blue-600" />
                <input
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Ingrese DNI (8 dígitos)"
                  className="w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  required
                  maxLength={8}
                  pattern="\d{8}"
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                type="submit"
                className="w-full max-w-xs mx-auto block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md"
                disabled={loading}
              >
                {loading ? "Buscando..." : "Iniciar Análisis"}
              </button>
            </form>
          </div>
        )}

        {persona && (
          <div id="ficha-tecnica" className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">FICHA TÉCNICA</h2>
            </div>
            <div className="overflow-x-auto"> {/* Added for horizontal scrolling on small screens */}
              <table className="min-w-full border-collapse table-fixed"> {/* table-fixed for consistent column widths */}
                <tbody>
                  <tr>
                    <th className="border p-3 text-left bg-gray-100 dark:bg-gray-700 w-1/4 rounded-tl-md">Proyecto</th>
                    <td className="border p-3 w-1/4">{persona.proyecto}</td>
                    <th className="border p-3 text-left bg-gray-100 dark:bg-gray-700 w-1/4">Fecha</th>
                    <td className="border p-3 w-1/4 rounded-tr-md">{persona.sFecha}</td>
                  </tr>
                  <tr>
                    <th className="border p-3 text-left bg-gray-100 dark:bg-gray-700">Departamento</th>
                    <td className="border p-3">{persona.departamento}</td>
                    <th className="border p-3 text-left bg-gray-100 dark:bg-gray-700">Provincia</th>
                    <td className="border p-3">{persona.provincia}</td>
                  </tr>
                  <tr>
                    <th className="border p-3 text-left bg-gray-100 dark:bg-gray-700">Distrito</th>
                    <td className="border p-3">{persona.distrito}</td>
                    <th className="border p-3 text-left bg-gray-100 dark:bg-gray-700">Centro Poblado</th>
                    <td className="border p-3">{persona.centropoblado}</td>
                  </tr>
                  <tr>
                    <th className="border p-3 text-left bg-gray-100 dark:bg-gray-700">Datos del Beneficiario</th>
                    <td className="border p-3">{persona.beneficiario}</td>
                    <th className="border p-3 text-left bg-gray-100 dark:bg-gray-700">Comunidad</th>
                    <td className="border p-3">{persona.comunidad}</td>
                  </tr>
                  <tr>
                    <th className="border p-3 text-left bg-gray-100 dark:bg-gray-700">DNI</th>
                    <td className="border p-3" colSpan={3}>{persona.dni}</td>
                  </tr>
                  <tr>
                    <th className="border p-3 text-left bg-gray-100 dark:bg-gray-700">Proyectista</th>
                    <td className="border p-3" colSpan={3}>{persona.proyectista}</td>
                  </tr>
                  <tr>
                    <th className="border p-3 text-left bg-gray-100 dark:bg-gray-700 rounded-bl-md">Evaluador</th>
                    <td className="border p-3" colSpan={3} rounded-br-md>{persona.evaluador}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
              {persona.foto1 && (
                <div className="w-full max-w-md bg-gray-100 dark:bg-gray-700 p-2 rounded-md shadow-sm">
                  {/* The API returns base64 string, so direct use in src is fine */}
                  <img src={`data:image/jpeg;base64,${persona.foto1}`} alt="Foto 1" className="w-full h-auto rounded-md object-cover" onError={(e) => { e.currentTarget.src = "https://placehold.co/400x300/E0E0E0/000000?text=Imagen+no+disponible"; }} />
                  <p className="text-center text-gray-700 dark:text-gray-300 mt-2 text-sm">Foto del Terreno 1</p>
                </div>
              )}
              {persona.foto2 && (
                <div className="w-full max-w-md bg-gray-100 dark:bg-gray-700 p-2 rounded-md shadow-sm">
                  {/* The API returns base64 string, so direct use in src is fine */}
                  <img src={`data:image/jpeg;base64,${persona.foto2}`} alt="Foto 2" className="w-full h-auto rounded-md object-cover" onError={(e) => { e.currentTarget.src = "https://placehold.co/400x300/D0D0D0/000000?text=Imagen+no+disponible"; }} />
                  <p className="text-center text-gray-700 dark:text-gray-300 mt-2 text-sm">Foto del Terreno 2</p>
                </div>
              )}
            </div>

            <div className="mt-8 overflow-x-auto"> {/* Added for horizontal scrolling on small screens */}
              <table className="min-w-full border-collapse table-fixed"> {/* table-fixed for consistent column widths */}
                <thead>
                  <tr>
                    <th className="border p-3 bg-blue-600 text-white text-center w-1/12 rounded-tl-md">Actividad</th>
                    <th className="border p-3 bg-blue-600 text-white text-left w-7/12">Descripción</th>
                    <th className="border p-3 bg-blue-600 text-white text-center w-2/12 rounded-tr-md">Respuesta</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-3 text-center font-bold">1</td>
                    <td className="border p-3">El beneficiario recibió la información sobre los aportes comunales?</td>
                    <td className="border p-3 text-center">{persona.confirmainformacion}</td>
                  </tr>
                  <tr>
                    <td className="border p-3 text-center font-bold">2</td>
                    <td className="border p-3">Los Documentos de la propiedad están en regla?</td>
                    <td className="border p-3 text-center">{persona.confirmadoc}</td>
                  </tr>
                  <tr>
                    <td className="border p-3 text-center font-bold">2.1</td>
                    <td className="border p-3">Otro tipo Documento</td>
                    <td className="border p-3 text-center">{persona.otrotipodoc}</td>
                  </tr>
                  <tr>
                    <td className="border p-3 text-center font-bold">2.2</td>
                    <td className="border p-3">Tipo de Documento</td>
                    <td className="border p-3 text-center">{persona.tipodoc}</td>
                  </tr>
                  <tr>
                    <th className="border p-3 bg-gray-100 dark:bg-gray-700 text-left" rowSpan={2}>3. Coordenadas de Ubicación del Terreno</th>
                    <td className="border p-3" colSpan={2}>
                      Latitud: {persona.latitud}, Longitud: {persona.longitud}
                      <div id="map" className="h-64 mt-4 w-full rounded-md shadow-md"></div>
                    </td>
                  </tr>
                  <tr>
                    <th className="border p-3 bg-gray-100 dark:bg-gray-700 text-left" rowSpan={2}>4. Coordenadas de ubicación de la carretera más cercana al terreno</th>
                    <td className="border p-3" colSpan={2}>
                      Latitud: {persona.ubicoordy}, Longitud: {persona.ubicoordx}
                      <div id="map2" className="h-64 mt-4 w-full rounded-md shadow-md"></div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-3 text-center font-bold">5</td>
                    <td className="border p-3">Altitud Aproximada del terreno (msnm)</td>
                    <td className="border p-3 text-center">{persona.altitud} Msnm</td>
                  </tr>
                  <tr>
                    <td className="border p-3 text-center font-bold">6</td>
                    <td className="border p-3">El Terreno cumple con las medidas mínimas establecidas (8.50 x 9 m2)</td>
                    <td className="border p-3 text-center">{persona.confirmamedidas}</td>
                  </tr>
                  <tr>
                    <td className="border p-3 text-center font-bold">6.1</td>
                    <td className="border p-3">Observación de medidas de Terreno</td>
                    <td className="border p-3 text-center">{persona.observamedidasterreno}</td>
                  </tr>
                  <tr>
                    <td className="border p-3 text-center font-bold">7</td>
                    <td className="border p-3">Pendiente del Terreno (%)</td>
                    <td className="border p-3 text-center">{persona.pendiente}</td>
                  </tr>
                  <tr>
                    <td className="border p-3 text-center font-bold">8</td>
                    <td className="border p-3">El Terreno se encuentra en zona de riesgo?</td>
                    <td className="border p-3 text-center">{persona.confirmariesgo}</td>
                  </tr>
                  <tr>
                    <td className="border p-3 text-center font-bold rounded-bl-md">8.1</td>
                    <td className="border p-3">Observaciones de Riesgo (cual?)</td>
                    <td className="border p-3 text-center rounded-br-md">{persona.observariesgo}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={handleDownloadPDF}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center space-x-2"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4V2a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h2zm2-2h6v2H7V2zm-4 4h14v10H3V6zm5 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <span>Descargar PDF</span>
              </button>
              <button
                onClick={() => {
                  setShowForm(true);
                  setPersona(null);
                  setDni("");
                  setError(""); // Clear error when starting new search
                }}
                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors duration-200 shadow-md flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0L5 11.414a1 1 0 010-1.414l3.293-3.293a1 1 0 011.414 1.414L7.414 10H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <span>Nueva Búsqueda</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
