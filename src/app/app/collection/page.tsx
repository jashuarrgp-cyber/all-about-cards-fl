import { requirePermission } from '@/lib/auth/authorization';
import { getCollectionSnapshot } from '@/lib/collection/queries';
import { CollectionScreen } from '@/components/collection/collection-screen';

export const dynamic = 'force-dynamic';

export default async function CollectionPage() {
  await requirePermission('dashboard:access');
  const data = await getCollectionSnapshot();

  return <CollectionScreen data={data} />;
}
