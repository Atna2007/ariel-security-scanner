import { Target, VulnerabilityModule, Vulnerability, Severity } from '../../types/index.js';
import { httpGet } from '../../utils/http.js';

export class CookiesModule implements VulnerabilityModule {
  name = 'Cookies';
  severity: Severity = 'MEDIUM';

  async scan(target: Target): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];

    try {
      const response = await httpGet(target.getFullUrl());
      const setCookieHeaders = response.headers['set-cookie'];

      if (!setCookieHeaders) {
        return vulnerabilities;
      }

      const cookies = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];

      for (const cookie of cookies) {
        const cookieName = cookie.split('=')[0]?.trim() || 'unknown';
        const cookieLower = cookie.toLowerCase();

        if (!cookieLower.includes('secure') && target.url.protocol === 'https:') {
          vulnerabilities.push({
            type: 'InsecureCookie',
            severity: 'MEDIUM',
            url: target.getFullUrl(),
            parameter: cookieName,
            evidence: `Cookie '${cookieName}' missing Secure flag`,
            description: 'Cookie can be transmitted over unencrypted HTTP',
            recommendation: 'Add Secure flag to cookie',
            cweId: 'CWE-319',
          });
        }

        if (!cookieLower.includes('httponly')) {
          vulnerabilities.push({
            type: 'CookieWithoutHttpOnly',
            severity: 'MEDIUM',
            url: target.getFullUrl(),
            parameter: cookieName,
            evidence: `Cookie '${cookieName}' missing HttpOnly flag`,
            description: 'Cookie accessible via JavaScript (XSS risk)',
            recommendation: 'Add HttpOnly flag to cookie',
            cweId: 'CWE-79',
          });
        }

        if (!cookieLower.includes('samesite')) {
          vulnerabilities.push({
            type: 'CookieWithoutSameSite',
            severity: 'LOW',
            url: target.getFullUrl(),
            parameter: cookieName,
            evidence: `Cookie '${cookieName}' missing SameSite attribute`,
            description: 'Cookie sent with cross-site requests (CSRF risk)',
            recommendation: 'Add SameSite=Strict or SameSite=Lax attribute',
            cweId: 'CWE-352',
          });
        }
      }
    } catch (error) {
      throw new Error(`Cookies module failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return vulnerabilities;
  }
}