# Ariel Security Scanner Web Interface

A web-based interface for the Ariel Security Scanner that makes vulnerability scanning accessible without using the terminal.

## Features

- Scan websites for common security vulnerabilities
- Select specific modules to run (Headers, Cookies, XSS, CORS, Forms)
- Choose output format (JSON, HTML, Markdown)
- Verbose mode for detailed logging
- Responsive design for mobile and desktop

## Usage

1. Build the scanner first: `npm run build-scanner` (from project root)
2. Start the web interface: `npm start`
3. Open http://localhost:3000 in your browser
4. Enter a target URL and configure scan options
5. Click "Start Scan" to begin
6. View results in the output panel

## API Endpoints

- `POST /scan` - Execute a security scan
  - Body: `{ url, modules[], format, verbose }`
  - Returns: `{ success, data, format }`

## Development

- Frontend: HTML, Tailwind CSS, vanilla JavaScript
- Backend: Node.js Express
- The interface executes the existing CLI tool as a subprocess