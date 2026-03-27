import axios from 'axios';

export function extractApiError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err) && err.response?.data) {
    const data = err.response.data as Record<string, unknown>;
    if (typeof data.error === 'string') return data.error;
  }
  return fallback;
}
