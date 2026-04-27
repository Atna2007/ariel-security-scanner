import axios, { AxiosResponse } from 'axios';

export interface HttpResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export async function httpGet(
  url: string,
  params?: Record<string, string>,
  options?: { timeout?: number; followRedirects?: boolean }
): Promise<HttpResponse> {
  const timeout = options?.timeout ?? 10000;
  const followRedirects = options?.followRedirects ?? true;

  try {
    const response: AxiosResponse = await axios.get(url, {
      params,
      timeout,
      maxRedirects: followRedirects ? 5 : 0,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'Ariel-Security-Scanner/1.0',
      },
    });

    return {
      status: response.status,
      headers: response.headers as Record<string, string>,
      body: typeof response.data === 'string'
        ? response.data
        : JSON.stringify(response.data),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`HTTP request failed: ${error.message}`);
    }
    throw new Error('HTTP request failed: Unknown error');
  }
}