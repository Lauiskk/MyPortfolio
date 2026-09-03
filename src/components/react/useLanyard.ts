import { useSyncExternalStore } from 'react';
import { getServerSnapshot, getSnapshot, subscribe, type State } from '../../lib/presence';

/**
 * Reads the shared presence store. Every island that calls this joins the same
 * WebSocket — the store refcounts, so the connection opens with the first
 * mount and closes with the last unmount.
 */
export function useLanyard(): State {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
