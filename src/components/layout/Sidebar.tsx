import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-900 h-screen p-4">
      <ul className="space-y-2">
        <li>
          <Link href="/" className="block p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            Inicio
          </Link>
        </li>
        <li>
          <Link href="/cuaderno-obra" className="block p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            Cuaderno de Obra
          </Link>
        </li>
        <li>
          <Link href="/cuaderno-obra/reportes" className="block p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            Reportes
          </Link>
        </li>
      </ul>
    </aside>
  );
}