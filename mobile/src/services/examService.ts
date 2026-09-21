import { mockCertifications, mockExams } from '@/mock/data';
import type { Certification, Exam } from '@/types';

import { delay } from './source';

export const examService = {
  async list(): Promise<Exam[]> {
    return delay(mockExams);
  },

  async certifications(): Promise<Certification[]> {
    return delay(mockCertifications);
  },
};
