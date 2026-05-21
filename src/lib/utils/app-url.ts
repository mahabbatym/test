const FALLBACK_LOCAL_URL = "http://localhost:3000";

function ensureHttps(url: string): string {
  if (!url) return FALLBACK_LOCAL_URL;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
}

export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return ensureHttps(process.env.NEXT_PUBLIC_APP_URL);
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return ensureHttps(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  }

  if (process.env.VERCEL_URL) {
    return ensureHttps(process.env.VERCEL_URL);
  }

  return FALLBACK_LOCAL_URL;
}
