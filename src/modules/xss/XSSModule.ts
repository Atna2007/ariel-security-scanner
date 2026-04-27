import { Target, VulnerabilityModule, Vulnerability, Severity } from '../../types/index.js';
import { httpGet } from '../../utils/http.js';

const XSS_PAYLOADS = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  '"><script>alert(1)</script>',
  "'><script>alert(1)</script>",
];

export class XSSModule implements VulnerabilityModule {
  name = 'XSS';
  severity: Severity = 'HIGH';

  async scan(target: Target): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];
    const params = target.url.searchParams;

    for (const [param] of params.entries()) {
      for (const payload of XSS_PAYLOADS) {
        try {
          const testUrl = new URL(target.getFullUrl());
          testUrl.searchParams.set(param, payload);

          const response = await httpGet(testUrl.toString());

          if (response.body.includes(payload)) {
            vulnerabilities.push({
              type: 'XSS',
              severity: 'HIGH',
              url: testUrl.toString(),
              parameter: param,
              evidence: `Payload reflected in response`,
              description: 'Reflected XSS vulnerability - user input is reflected without proper encoding',
              recommendation: 'Sanitize and HTML-encode all user input before rendering',
              cweId: 'CWE-79',
            });
            break;
          }
        } catch (error) {
          continue;
        }
      }
    }

    return vulnerabilities;
  }
}