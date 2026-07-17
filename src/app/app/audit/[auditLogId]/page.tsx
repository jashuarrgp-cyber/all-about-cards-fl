import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { safeJson } from '@/lib/audit/redaction';
export default async function Page({
  params,
}: {
  params: Promise<{ auditLogId: string }>;
}) {
  await requirePermission('audit:read');
  const { auditLogId } = await params;
  const a = await prisma.auditLog.findUnique({
    where: { id: auditLogId },
    select: {
      id: true,
      action: true,
      entityType: true,
      beforeState: true,
      afterState: true,
      createdAt: true,
    },
  });
  if (!a) notFound();
  return (
    <section>
      <h1 className="text-3xl font-bold">Audit {a.action}</h1>
      <pre>{safeJson({ before: a.beforeState, after: a.afterState })}</pre>
    </section>
  );
}
