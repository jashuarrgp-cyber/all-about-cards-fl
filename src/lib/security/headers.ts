export const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value:
      // images.pokemontcg.io serves official public card images for the live
      // pricing search — explicitly allowlisted, nothing else external.
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.pokemontcg.io; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  {
    // Camera is allowed for this origin only: the card scanner and AI
    // Centering capture run on-device. Microphone and geolocation stay off.
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(), geolocation=()',
  },
];
export function isSafeRedirect(path: string) {
  return path.startsWith('/') && !path.startsWith('//');
}
