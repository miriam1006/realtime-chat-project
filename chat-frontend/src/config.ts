const BACKEND_URL =
  import.meta.env.VITE_API_URL ?? 'https://chat-backend-miriam.onrender.com';

export function getApiUrl(): string {
  return BACKEND_URL;
}
