const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api';

type RequestOptions = RequestInit & {
  token?: string | null;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') ?? '';

  if (!response.ok) {
    let message = 'Request failed';
    try {
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (Array.isArray(data?.message)) {
          message = data.message.join(', ');
        } else {
          message = data?.message ?? message;
        }
      } else {
        message = await response.text();
      }
    } catch {
      try {
        message = await response.text();
      } catch {
        // keep fallback message
      }
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return (await response.text()) as unknown as T;
}
