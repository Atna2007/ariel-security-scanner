import { Target, VulnerabilityModule, Vulnerability, Severity } from '../../types/index.js';
import { httpGet } from '../../utils/http.js';
import * as cheerio from 'cheerio';

const CSRF_TOKEN_NAMES = ['_csrf', 'csrf', 'csrf_token', '_token', 'authenticity_token', 'xsrf'];

export class FormsModule implements VulnerabilityModule {
  name = 'Forms';
  severity: Severity = 'MEDIUM';

  async scan(target: Target): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];

    try {
      const response = await httpGet(target.getFullUrl());
      const $ = cheerio.load(response.body);
      const isHttps = target.url.protocol === 'https:';

      $('form').each((_, form) => {
        const $form = $(form);
        const method = ($form.attr('method') || 'GET').toUpperCase();

        if (method === 'POST') {
          const hasCsrfToken = CSRF_TOKEN_NAMES.some((name) =>
            $form.find(`input[name="${name}"]`).length > 0
          );

          if (!hasCsrfToken) {
            vulnerabilities.push({
              type: 'MissingCSRF',
              severity: 'MEDIUM',
              url: target.getFullUrl(),
              evidence: 'Form without CSRF token',
              description: 'POST form lacks CSRF protection token',
              recommendation: 'Add a CSRF token to all state-changing forms',
              cweId: 'CWE-352',
            });
          }

          if (!isHttps && $form.find('input[type="password"]').length > 0) {
            vulnerabilities.push({
              type: 'PasswordOverHTTP',
              severity: 'CRITICAL',
              url: target.getFullUrl(),
              evidence: 'Password field submitted over unencrypted HTTP',
              description: 'Password form transmitted without encryption',
              recommendation: 'Use HTTPS for all pages with authentication forms',
              cweId: 'CWE-319',
            });
          }
        }
      });
    } catch (error) {
      throw new Error(`Forms module failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return vulnerabilities;
  }
}