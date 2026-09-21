import { useCallback, useEffect, useRef, useState } from 'react';

import type { AsyncState } from '@/types';

type Options = {
  /** Considère un tableau vide comme l'état `empty` plutôt que `ready`. */
  emptyWhenArrayEmpty?: boolean;
};

export type UseAsyncResult<T> = {
  state: AsyncState<T>;
  refreshing: boolean;
  reload: () => void;
  refresh: () => void;
};

/**
 * Exécute une lecture asynchrone et expose un état exhaustif
 * loading / error / empty / ready, plus le rafraîchissement par
 * tirage. Évite de réécrire trois `useState` dans chaque écran.
 */
export function useAsync<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[] = [],
  options: Options = {},
): UseAsyncResult<T> {
  const { emptyWhenArrayEmpty = true } = options;

  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [refreshing, setRefreshing] = useState(false);

  // Évite de poser un état sur un écran déjà démonté.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const run = useCallback(
    async (isRefresh: boolean) => {
      if (isRefresh) setRefreshing(true);
      else setState({ status: 'loading' });

      try {
        const data = await loader();
        if (!alive.current) return;

        const isEmpty =
          data == null || (emptyWhenArrayEmpty && Array.isArray(data) && data.length === 0);

        setState(isEmpty ? { status: 'empty' } : { status: 'ready', data });
      } catch (error) {
        if (!alive.current) return;
        const message = error instanceof Error ? error.message : 'Une erreur est survenue.';
        setState({ status: 'error', error: message });
      } finally {
        if (alive.current) setRefreshing(false);
      }
    },
    // `loader` est recréé à chaque rendu par l'appelant : on se fie aux deps fournies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...deps, emptyWhenArrayEmpty],
  );

  useEffect(() => {
    void run(false);
  }, [run]);

  return {
    state,
    refreshing,
    reload: () => void run(false),
    refresh: () => void run(true),
  };
}
