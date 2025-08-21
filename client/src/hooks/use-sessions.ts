import { useQuery } from "@tanstack/react-query";
import type { SessionWithStats } from "@shared/schema";

export function useSessions() {
  return useQuery<SessionWithStats[]>({
    queryKey: ['/api/sessions'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
