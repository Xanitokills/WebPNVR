export function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Cuaderno de Obra Digital</h1>
        <div>
          <button className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}