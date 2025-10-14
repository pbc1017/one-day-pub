import { GetBoothsResponse } from '@one-day-pub/interface/dtos/festival.dto.js';
import { useSuspenseQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api';

export function useBooths() {
  return useSuspenseQuery({
    queryKey: ['booths'],
    queryFn: () => apiClient<GetBoothsResponse>('booths'),
  });
}
