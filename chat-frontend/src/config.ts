/**
 * URL base del backend de chat.
 * En desarrollo puedes usar 'http://localhost:3000' si corres el backend local.
 */
const BACKEND_URL =
  import.meta.env.VITE_API_URL ?? 'https://chat-backend-miriam.onrender.com';

export function getApiUrl(): string {
  return BACKEND_URL;
}
