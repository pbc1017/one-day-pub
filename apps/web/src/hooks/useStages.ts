import { GetStagesResponse } from '@one-day-pub/interface/dtos/festival.dto.js';
import { useSuspenseQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api';

export function useStages() {
  return useSuspenseQuery({
    queryKey: ['stages'],
    queryFn: () => apiClient<GetStagesResponse>('stages'),
  });
}
