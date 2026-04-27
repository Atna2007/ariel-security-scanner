import { Target, VulnerabilityModule, Vulnerability, Severity } from '../../types/index.js';
import { httpGet } from '../../utils/http.js';

const REQUIRED_HEADERS = [
  { name: 'X-Frame-Options', recommendation: 'Add X-Frame-Options header to prevent clickjacking', cweId: 'CWE-1021' },
  { name: 'X-Content-Type-Options', recommendation: 'Add X-Content-Type-Options: nosniff to prevent MIME sniffing', cweId: 'CWE-16' },
  { name: 'Content-Security-Policy', recommendation: 'Implement Content-Security-Policy header to prevent XSS', cweId: 'CWE-79' },
  { name: 'Strict-Transport-Security', recommendation: 'Add HSTS header to enforce HTTPS', cweId: 'CWE-319' },
  { name: 'X-XSS-Protection', recommendation: 'Add X-XSS-Protection header for legacy browser support', cweId: 'CWE-79' },
  { name: 'Referrer-Policy', recommendation: 'Add Referrer-Policy header to control referrer information', cweId: 'CWE-200' },
];

export class HeadersModule implements VulnerabilityModule {
  name = 'Headers';
  severity: Severity = 'MEDIUM';

  async scan(target: Target): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];

    try {
      const response = await httpGet(target.getFullUrl());
      const headers = Object.keys(response.headers).reduce<Record<string, string>>((acc, key) => {
        acc[key.toLowerCase()] = response.headers[key];
        return acc;
      }, {});

      for (const header of REQUIRED_HEADERS) {
        const headerName = header.name.toLowerCase();
        if (!headers[headerName]) {
          vulnerabilities.push({
            type: 'MissingHeader',
            severity: 'MEDIUM',
            url: target.getFullUrl(),
            evidence: `${header.name} header missing`,
            description: `Security header ${header.name} is not present`,
            recommendation: header.recommendation,
            cweId: header.cweId,
          });
        }
      }
    } catch (error) {
      throw new Error(`Headers module failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return vulnerabilities;
  }
}