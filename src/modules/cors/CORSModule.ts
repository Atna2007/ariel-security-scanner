import { Target, VulnerabilityModule, Vulnerability, Severity } from '../../types/index.js';
import { httpGet } from '../../utils/http.js';

export class CORSModule implements VulnerabilityModule {
  name = 'CORS';
  severity: Severity = 'HIGH';

  async scan(target: Target): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];

    try {
      const response = await httpGet(target.getFullUrl());
      const headers = Object.keys(response.headers).reduce<Record<string, string>>((acc, key) => {
        acc[key.toLowerCase()] = response.headers[key];
        return acc;
      }, {});

      const allowOrigin = headers['access-control-allow-origin'];
      const allowCredentials = headers['access-control-allow-credentials'];

      if (allowOrigin === '*') {
        if (allowCredentials === 'true') {
          vulnerabilities.push({
            type: 'InsecureCORS',
            severity: 'CRITICAL',
            url: target.getFullUrl(),
            evidence: 'Access-Control-Allow-Origin: * with Access-Control-Allow-Credentials: true',
            description: 'CORS misconfiguration allows any origin to read responses with credentials',
            recommendation: 'Never use wildcard origin with credentials. Specify exact trusted origins.',
            cweId: 'CWE-942',
          });
        } else {
          vulnerabilities.push({
            type: 'InsecureCORS',
            severity: 'MEDIUM',
            url: target.getFullUrl(),
            evidence: 'Access-Control-Allow-Origin: *',
            description: 'CORS allows any origin to access this resource',
            recommendation: 'Restrict Access-Control-Allow-Origin to specific trusted domains',
            cweId: 'CWE-942',
          });
        }
      }
    } catch (error) {
      throw new Error(`CORS module failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return vulnerabilities;
  }
}