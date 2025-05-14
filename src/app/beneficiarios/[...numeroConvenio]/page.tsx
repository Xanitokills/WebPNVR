// app/beneficiarios/[...numeroConvenio]/page.tsx
import { Metadata } from 'next';
import BeneficiariosTable from '@/components/tables/BeneficiariosTable';

export const metadata: Metadata = {
  title: 'Beneficiarios por Convenio | TailAdmin - Next.js Dashboard Template',
  description: 'Página de beneficiarios por convenio en TailAdmin',
};

export default async function BeneficiariosPage({ params }: { params: Promise<{ numeroConvenio: string[] }> }) {
  const resolvedParams = await params;
  const numeroConvenio = resolvedParams.numeroConvenio.join('/');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Beneficiarios del Convenio: {numeroConvenio}</h1>
      <BeneficiariosTable numeroConvenio={numeroConvenio} />
    </div>
  );
}