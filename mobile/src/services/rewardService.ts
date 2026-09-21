import { mockCoinHistory, mockRewards } from '@/mock/data';
import type { CoinEntry, Reward } from '@/types';

import { delay } from './source';

/**
 * Lecture seule côté client.
 * Tout gain ou dépense de NabeCoins passera par une Cloud Function
 * (Phase 10) : l'application ne doit jamais écrire un solde elle-même.
 */
export const rewardService = {
  async history(): Promise<CoinEntry[]> {
    return delay(mockCoinHistory);
  },

  async rewards(): Promise<Reward[]> {
    return delay(mockRewards);
  },
};
