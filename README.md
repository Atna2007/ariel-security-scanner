# Ariel Security Scanner

A modular web vulnerability scanner built with Node.js and TypeScript. Detects common security vulnerabilities in web applications.

## Features

- **Modular Architecture**: Easy to add new vulnerability detectors
- **Multiple Output Formats**: JSON, HTML, and Markdown reports
- **Fast Scanning**: Sequential module execution with error handling
- **Developer Friendly**: TypeScript with full type safety

## Detected Vulnerabilities

| Module | Vulnerabilities | Severity |
|--------|----------------|----------|
| Headers | Missing security headers (X-Frame-Options, CSP, HSTS, etc.) | MEDIUM |
| Cookies | Missing Secure, HttpOnly, SameSite flags | MEDIUM |
| XSS | Reflected Cross-Site Scripting | HIGH |
| CORS | Overly permissive CORS configuration | HIGH |
| Forms | Missing CSRF tokens, password over HTTP | MEDIUM-CRITICAL |

## Installation

```bash
cd ariel-security-scanner
npm install
npm run build
```

## Usage

### Basic Scan

```bash
npm start -- https://example.com
```

### Specific Modules

```bash
npm start -- https://example.com --modules xss,headers,cors
```

### Output Formats

```bash
# JSON output
npm start -- https://example.com --format json --output report.json

# HTML report
npm start -- https://example.com --format html --output report.html

# Markdown report
npm start -- https://example.com --format md --output report.md
```

### Verbose Mode

```bash
npm start -- https://example.com --verbose
```

## Development

### Run Tests

```bash
npm test
```

### Watch Mode

```bash
npm run test:watch
```

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── cli/           # Command-line interface
├── core/          # Scanner, Report generator
├── modules/       # Vulnerability detection modules
│   ├── headers/
│   ├── cookies/
│   ├── xss/
│   ├── cors/
│   └── forms/
├── utils/         # HTTP client, logger
└── types/         # TypeScript type definitions
```

## CLI Options

```
Usage: security-scanner [options] <url>

Arguments:
  url                      Target URL to scan

Options:
  -V, --version            Output the version number
  -m, --modules <modules>  Comma-separated list of modules to run (default: "all")
  -f, --format <format>    Output format: json, html, md (default: "json")
  -o, --output <file>      Output file path
  -v, --verbose            Enable verbose logging
  --insecure               Skip SSL verification
  -h, --help               Display help
```

## Adding New Modules

1. Create `src/modules/<name>/<Name>Module.ts`
2. Implement `VulnerabilityModule` interface
3. Add tests in `tests/modules/<name>/<Name>Module.test.ts`
4. Register in CLI

## License

MIT

## Disclaimer

This tool is for authorized security testing only. Always obtain proper permission before scanning any website or web application.