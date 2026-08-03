import { createClient } from '@/lib/supabase/client';

export async function trackActivity(userId: string, entityType: string, entityId: string, entityName: string) {
  const sb = createClient();
  await sb.from('user_activities').insert({ user_id: userId, entity_type: entityType, entity_id: entityId, entity_name: entityName });
}
