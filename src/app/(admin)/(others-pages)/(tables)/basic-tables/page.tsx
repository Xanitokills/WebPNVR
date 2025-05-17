import { Metadata } from 'next';
import BasicTablesClient from '@/components/tables/BasicTablesClient';

export const metadata: Metadata = {
  title: 'Next.js Basic Table | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Basic Table page for TailAdmin Tailwind CSS Admin Dashboard Template',
};

export default async function BasicTables() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003'}/api/convenios`, {
    cache: 'no-store',
  });
  const data = await response.json();

  return <BasicTablesClient initialData={data} />;
}