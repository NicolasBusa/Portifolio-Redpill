export function getSiteUrl() {
  const explicit = process.env.SITE_URL;
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const origin = explicit || (production ? `https://${production}` : undefined);
  return origin ? new URL(origin).origin : undefined;
}
