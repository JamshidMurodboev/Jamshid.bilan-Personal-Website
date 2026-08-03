'use client';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { trackActivity } from '@/hooks/useActivity';

export default function ActivityTracker({ entityType, entityId, entityName }: { entityType: string; entityId: string; entityName: string }) {
  const { user } = useAuth();
  useEffect(() => {
    if (user) trackActivity(user.id, entityType, entityId, entityName);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
  return null;
}
