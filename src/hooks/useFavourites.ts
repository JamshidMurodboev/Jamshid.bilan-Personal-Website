'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth';

export function useFavourites() {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) { setFavourites(new Set()); return; }
    const sb = createClient();
    sb.from('user_favorites').select('entity_type,entity_id').eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setFavourites(new Set(data.map((f: { entity_type: string; entity_id: string }) => `${f.entity_type}:${f.entity_id}`)));
      });
  }, [user?.id]);

  const toggle = useCallback(async (entityType: string, entityId: string): Promise<'added' | 'removed'> => {
    if (!user) return 'removed';
    const key = `${entityType}:${entityId}`;
    const sb = createClient();
    if (favourites.has(key)) {
      await sb.from('user_favorites').delete().eq('user_id', user.id).eq('entity_type', entityType).eq('entity_id', entityId);
      setFavourites(prev => { const n = new Set(prev); n.delete(key); return n; });
      return 'removed';
    } else {
      await sb.from('user_favorites').insert({ user_id: user.id, entity_type: entityType, entity_id: entityId });
      setFavourites(prev => { const n = new Set(prev); n.add(key); return n; });
      return 'added';
    }
  }, [user, favourites]);

  const isFavourite = useCallback((entityType: string, entityId: string) => {
    return favourites.has(`${entityType}:${entityId}`);
  }, [favourites]);

  return { isFavourite, toggle };
}
