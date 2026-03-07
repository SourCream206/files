/**
 * Build API URL without double slashes.
 * If NEXT_PUBLIC_API_URL is "http://localhost:4000/", this ensures we get
 * "http://localhost:4000/api/..." not "http://localhost:4000//api/...".
 */
export function apiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

/**
 * Fetch from API and parse JSON safely. If the server returns HTML (e.g. 404 page)
 * instead of JSON, throws a clear error instead of "Unexpected token '<'".
 */
export async function apiFetch<T = unknown>(
  url: string,
  init?: RequestInit
): Promise<{ res: Response; data: T }> {
  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  if (!contentType.includes('application/json')) {
    throw new Error(
      `API error (${res.status}): server returned a non-JSON response. ` +
        `Check that the backend is running and NEXT_PUBLIC_API_URL is correct (e.g. http://localhost:4000).`
    );
  }

  let data: T;
  try {
    data = JSON.parse(text) as T;
  } catch {
    throw new Error(
      `API error (${res.status}): invalid JSON from server. ` +
        `Check that the backend is running at the correct URL.`
    );
  }

  return { res, data };
}
