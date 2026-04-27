import { ScanResult } from '../types/index.js';
import { writeFileSync } from 'fs';

export class ReportGenerator {
  private result: ScanResult;

  constructor(result: ScanResult) {
    this.result = result;
  }

  toJSON(): string {
    return JSON.stringify(this.result, null, 2);
  }

  toHTML(): string {
    const severityColors: Record<string, string> = {
      CRITICAL: '#dc3545',
      HIGH: '#fd7e14',
      MEDIUM: '#ffc107',
      LOW: '#28a745',
    };

    const vulnerabilitiesHtml = this.result.vulnerabilities
      .map(
        (v) => `
        <div class="vulnerability" style="border: 1px solid #ddd; padding: 16px; margin: 16px 0; border-radius: 8px;">
          <h3 style="margin: 0 0 8px 0;">
            <span style="background: ${severityColors[v.severity]}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${v.severity}</span>
            ${v.type}
          </h3>
          <p><strong>URL:</strong> ${v.url}${v.parameter ? ` (param: ${v.parameter})` : ''}</p>
          <p><strong>Evidence:</strong> <code>${v.evidence}</code></p>
          <p><strong>Description:</strong> ${v.description}</p>
          <p><strong>Recommendation:</strong> ${v.recommendation}</p>
          ${v.cweId ? `<p><strong>CWE:</strong> ${v.cweId}</p>` : ''}
        </div>
      `
      )
      .join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Scan Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin: 24px 0; }
    .stat { background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; }
    .stat-label { color: #666; font-size: 14px; }
    .critical { color: #dc3545; }
    .high { color: #fd7e14; }
    .medium { color: #ffc107; }
    .low { color: #28a745; }
  </style>
</head>
<body>
  <h1>Security Scan Report</h1>
  <p><strong>Target:</strong> ${this.result.target}</p>
  <p><strong>Scanned at:</strong> ${this.result.scannedAt}</p>

  <h2>Summary</h2>
  <div class="summary">
    <div class="stat"><div class="stat-value">${this.result.summary.total}</div><div class="stat-label">Total</div></div>
    <div class="stat"><div class="stat-value critical">${this.result.summary.critical}</div><div class="stat-label">Critical</div></div>
    <div class="stat"><div class="stat-value high">${this.result.summary.high}</div><div class="stat-label">High</div></div>
    <div class="stat"><div class="stat-value medium">${this.result.summary.medium}</div><div class="stat-label">Medium</div></div>
    <div class="stat"><div class="stat-value low">${this.result.summary.low}</div><div class="stat-label">Low</div></div>
  </div>

  <h2>Vulnerabilities</h2>
  ${vulnerabilitiesHtml}

  ${this.result.failedModules.length > 0 ? `
    <h2>Failed Modules</h2>
    <ul>${this.result.failedModules.map((m) => `<li>${m}</li>`).join('')}</ul>
  ` : ''}
</body>
</html>
    `.trim();
  }

  toMarkdown(): string {
    const lines: string[] = [
      '# Security Scan Report',
      '',
      `**Target:** ${this.result.target}`,
      `**Scanned at:** ${this.result.scannedAt}`,
      '',
      '## Summary',
      '',
      '| Severity | Count |',
      '|----------|-------|',
      `| Critical | ${this.result.summary.critical} |`,
      `| High | ${this.result.summary.high} |`,
      `| Medium | ${this.result.summary.medium} |`,
      `| Low | ${this.result.summary.low} |`,
      `| **Total** | **${this.result.summary.total}** |`,
      '',
      '## Vulnerabilities',
      '',
    ];

    for (const vuln of this.result.vulnerabilities) {
      lines.push(
        `### [${vuln.severity}] ${vuln.type}`,
        '',
        `- **URL:** ${vuln.url}${vuln.parameter ? ` (parameter: \`${vuln.parameter}\`)` : ''}`,
        `- **Evidence:** \`${vuln.evidence}\``,
        `- **Description:** ${vuln.description}`,
        `- **Recommendation:** ${vuln.recommendation}`,
        vuln.cweId ? `- **CWE:** ${vuln.cweId}` : '',
        ''
      );
    }

    if (this.result.failedModules.length > 0) {
      lines.push('## Failed Modules', '', ...this.result.failedModules.map((m) => `- ${m}`), '');
    }

    return lines.join('\n');
  }

  save(path: string, format: 'json' | 'html' | 'md' = 'json'): void {
    let content: string;
    switch (format) {
      case 'json':
        content = this.toJSON();
        break;
      case 'html':
        content = this.toHTML();
        break;
      case 'md':
        content = this.toMarkdown();
        break;
    }
    writeFileSync(path, content, 'utf-8');
  }
}