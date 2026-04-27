import { describe, it, expect } from 'vitest';
import { httpGet } from '../../src/utils/http.js';

describe('httpGet', () => {
  it('returns response with status, headers, and body', async () => {
    const response = await httpGet('https://httpbin.org/get');
    expect(response.status).toBe(200);
    expect(response.headers).toBeDefined();
    expect(response.body).toBeDefined();
  });

  it('throws on network error', async () => {
    await expect(httpGet('https://invalid-domain-that-does-not-exist.com')).rejects.toThrow();
  });
});