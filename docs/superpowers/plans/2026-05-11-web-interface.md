# Web Interface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based user interface for the Ariel Security Scanner that allows users to scan websites for vulnerabilities without using the terminal.

**Architecture:** Create a standalone web application that interacts with the existing Ariel Security Scanner CLI tool. The web interface will use HTML/Tailwind CSS for the frontend and Node.js for the backend to execute scanner commands and display results.

**Tech Stack:**
- Frontend: HTML, Tailwind CSS, vanilla JavaScript
- Backend: Node.js Express API to execute scanner commands
- Build: Existing TypeScript compiler for the scanner

---

### Task 1: Project Setup and Structure

**Files:**
- Create: `web/package.json`
- Create: `web/server.js`
- Create: `web/public/index.html`
- Create: `web/public/style.css`
- Create: `web/public/script.js`

- [ ] **Step 1: Initialize web project**

```bash
mkdir -p web/public
npm init -y
```

- [ ] **Step 2: Install dependencies**

```bash
npm install express cors
```

- [ ] **Step 3: Create basic server**

```javascript
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

- [ ] **Step 4: Test server startup**

Run: `node web/server.js`
Expected: Server starts and logs "Server running on http://localhost:3000"

- [ ] **Step 5: Commit**

```bash
git add web/
git commit -m "feat: initialize web project structure"
```

### Task 2: Basic Web Interface Design

**Files:**
- Create: `web/public/index.html`
- Create: `web/public/style.css` (Tailwind CSS via CDN)
- Create: `web/public/script.js`

- [ ] **Step 1: Create HTML structure**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ariel Security Scanner Web</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="style.css">
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
        <header class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Ariel Security Scanner</h1>
            <p class="text-gray-600">Web Interface for Vulnerability Scanning</p>
        </header>

        <main class="bg-white rounded-lg shadow-md p-6">
            <form id="scanForm" class="space-y-4">
                <div>
                    <label for="url" class="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
                    <input type="url" id="url" name="url" required
                           class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="https://example.com">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Scan Modules</label>
                    <div class="grid grid-cols-2 gap-2">
                        <label class="flex items-center">
                            <input type="checkbox" name="modules" value="headers" checked>
                            <span class="ml-2">Headers</span>
                        </label>
                        <label class="flex items-center">
                            <input type="checkbox" name="modules" value="cookies" checked>
                            <span class="ml-2">Cookies</span>
                        </label>
                        <label class="flex items-center">
                            <input type="checkbox" name="modules" value="xss" checked>
                            <span class="ml-2">XSS</span>
                        </label>
                        <label class="flex items-center">
                            <input type="checkbox" name="modules" value="cors" checked>
                            <span class="ml-2">CORS</span>
                        </label>
                        <label class="flex items-center">
                            <input type="checkbox" name="modules" value="forms" checked>
                            <span class="ml-2">Forms</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
                    <select id="format" name="format"
                            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="json">JSON</option>
                        <option value="html">HTML</option>
                        <option value="md">Markdown</option>
                    </select>
                </div>

                <div>
                    <label class="flex items-center">
                        <input type="checkbox" id="verbose" name="verbose">
                        <span class="ml-2 text-sm text-gray-600">Verbose Output</span>
                    </label>
                </div>

                <button type="submit"
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        id="scanButton">
                    Start Scan
                </button>
            </form>

            <div id="results" class="mt-6 hidden">
                <h2 class="text-xl font-bold text-gray-800 mb-4">Scan Results</h2>
                <div id="output" class="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto"></div>
            </div>
        </main>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Add basic styling**

```css
/* style.css */
.container {
    @apply px-4 sm:px-6 lg:px-8;
}
```

- [ ] **Step 3: Add frontend logic**

```javascript
// script.js
document.getElementById('scanForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get('url');
    const modules = formData.getAll('modules');
    const format = formData.get('format');
    const verbose = formData.get('verbose') === 'on';

    if (!url) {
        alert('Please enter a valid URL');
        return;
    }

    // Show loading state
    const scanButton = document.getElementById('scanButton');
    const resultsDiv = document.getElementById('results');
    const outputDiv = document.getElementById('output');

    scanButton.disabled = true;
    scanButton.textContent = 'Scanning...';
    resultsDiv.classList.remove('hidden');
    outputDiv.innerHTML = '<p class="text-gray-500">Starting scan...</p>';

    try {
        const response = await fetch('/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url, modules, format, verbose })
        });

        const result = await response.json();

        if (result.success) {
            // Display results based on format
            if (result.format === 'html') {
                outputDiv.innerHTML = result.data;
            } else {
                outputDiv.textContent = result.data;
                // Apply some basic styling for text output
                outputDiv.style.whiteSpace = 'pre-wrap';
                outputDiv.style.fontFamily = 'monospace';
                outputDiv.style.fontSize = '0.875rem';
            }
        } else {
            outputDiv.innerHTML = `<p class="text-red-500">Error: ${result.error}</p>`;
        }
    } catch (error) {
        outputDiv.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
    } finally {
        scanButton.disabled = false;
        scanButton.textContent = 'Start Scan';
    }
});
```

- [ ] **Step 4: Test basic interface**

Run: `node web/server.js`
Expected: Web interface loads at http://localhost:3000 with form visible

- [ ] **Step 5: Commit**

```bash
git add web/
git commit -m "feat: create basic web interface"
```

### Task 3: Backend API for Scanner Execution

**Files:**
- Modify: `web/server.js`

- [ ] **Step 1: Add scan endpoint**

```javascript
// Add this after the middleware setup
app.post('/scan', (req, res) => {
    const { url, modules, format, verbose } = req.body;

    // Validate URL
    if (!url || !url.startsWith('http')) {
        return res.status(400).json({ success: false, error: 'Invalid URL provided' });
    }

    // Build command
    let command = `node dist/index.js "${url}"`;

    if (modules && modules.length > 0 && modules.join(',') !== 'all') {
        command += ` --modules ${modules.join(',')}`;
    }

    if (format && format !== 'json') {
        command += ` --format ${format}`;
    }

    if (verbose) {
        command += ` --verbose`;
    }

    // Add output file parameter
    const outputFile = `scan-result-${Date.now()}.${format}`;
    command += ` --output ${outputFile}`;

    // Execute command from the ariel-security-scanner directory
    const scannerPath = path.join(__dirname, '..');

    exec(command, { cwd: scannerPath, timeout: 60000 }, (error, stdout, stderr) => {
        if (error) {
            return res.json({
                success: false,
                error: `Scan failed: ${error.message}`,
                stderr: stderr
            });
        }

        // Read the output file if it exists
        const outputPath = path.join(scannerPath, outputFile);
        const fs = require('fs');

        let resultData = '';
        if (fs.existsSync(outputPath)) {
            resultData = fs.readFileSync(outputPath, 'utf8');
            // Clean up the file
            fs.unlinkSync(outputPath);
        } else {
            resultData = stdout || 'Scan completed but no output generated';
        }

        res.json({
            success: true,
            data: resultData,
            format: format
        });
    });
});
```

- [ ] **Step 2: Test scan functionality**

Run: `node web/server.js`
Expected: Submit form triggers scan and displays results

- [ ] **Step 3: Handle edge cases**

```javascript
// Add error handling for missing dist folder
if (!fs.existsSync(path.join(scannerPath, 'dist', 'index.js'))) {
    return res.json({
        success: false,
        error: 'Scanner not built. Please run npm run build in the scanner directory first.'
    });
}
```

- [ ] **Step 4: Commit**

```bash
git add web/
git commit -m "feat: add scanner execution API"
```

### Task 4: Build Integration and Deployment Preparation

**Files:**
- Create: `web/build-and-run.sh`
- Modify: `package.json` (add scripts)

- [ ] **Step 1: Add build script to package.json**

```json
{
  "name": "ariel-security-scanner-web",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build-scanner": "cd .. && npm run build",
    "full-build": "npm run build-scanner && echo 'Scanner built successfully'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

- [ ] **Step 2: Create build and run script**

```bash
#!/bin/bash
echo "Building Ariel Security Scanner..."
cd ..
npm run build
echo "Starting web interface..."
cd web
npm start
```

- [ ] **Step 3: Make script executable**

```bash
chmod +x web/build-and-run.sh
```

- [ ] **Step 4: Test full workflow**

Run: `./web/build-and-run.sh`
Expected: Scanner builds, then web interface starts

- [ ] **Step 5: Commit**

```bash
git add web/
git commit -m "feat: add build integration and deployment scripts"
```

### Task 5: Enhance User Experience and Accessibility

**Files:**
- Modify: `web/public/index.html`
- Modify: `web/public/style.css`
- Modify: `web/public/script.js`

- [ ] **Step 1: Improve form validation**

```javascript
// Add to script.js
function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Update form submission validation
if (!validateURL(url)) {
    alert('Please enter a valid URL including http:// or https://');
    return;
}
```

- [ ] **Step 2: Add loading states and progress indicators**

```html
<!-- Add to index.html inside the form -->
<div id="loadingSpinner" class="hidden flex items-center justify-center mt-4">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span class="ml-2 text-sm text-gray-600">Scanning in progress...</span>
</div>
```

```javascript
// Add to script.js
const loadingSpinner = document.getElementById('loadingSpinner');
// Show/hide loading spinner
loadingSpinner.classList.toggle('hidden');
```

- [ ] **Step 3: Improve result display with syntax highlighting for JSON**

```javascript
// In the scan response handling
if (result.format === 'json') {
    try {
        const parsed = JSON.parse(result.data);
        outputDiv.innerHTML = `<pre class="bg-gray-50 p-4 rounded"><code class="language-json">${JSON.stringify(parsed, null, 2)}</code></pre>`;
        // Add basic syntax highlighting
        outputDiv.innerHTML = outputDiv.innerHTML
            .replace(/("(\\u[a-zA-Z0-9]{4}|[^"])*"):/g, '<span class="text-blue-500">$1</span>:')
            .replace(/"([^"]|\\")*"/g, '<span class="text-green-500">$&</span>')
            .replace(/\b(null|false|true)\b/g, '<span class="text-red-500">$&</span>')
            .replace(/\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, '<span class="text-purple-500">$&</span>');
    } catch (e) {
        outputDiv.textContent = result.data;
    }
}
```

- [ ] **Step 4: Add accessibility improvements**

```html
<!-- Add to index.html -->
<label for="url" class="block text-sm font-medium text-gray-700 mb-2">
    Target URL
</label>
```

```javascript
// Add form validation feedback
const urlInput = document.getElementById('url');
urlInput.setAttribute('aria-required', 'true');
```

- [ ] **Step 5: Test accessibility and UX improvements**

Run: `node web/server.js`
Expected: Form validates input, shows loading states, displays results clearly

- [ ] **Step 6: Commit**

```bash
git add web/
git commit -m "feat: enhance user experience and accessibility"
```

### Task 6: Final Testing and Documentation

**Files:**
- Create: `web/README.md`
- Create: `web/test-scenarios.md`

- [ ] **Step 1: Create web interface README**

```markdown
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
```

- [ ] **Step 2: Create test scenarios**

```markdown
# Test Scenarios for Web Interface

## Functional Tests
1. Basic scan with default settings
2. Scan with specific modules selected/deselected
3. Scan with different output formats
4. Scan with verbose mode enabled
5. Invalid URL handling
6. Empty URL handling

## Performance Tests
1. Scan timeout handling (long-running scans)
2. Concurrent scan requests
3. Large result handling

## Security Tests
1. URL validation (prevent command injection)
2. Input sanitization
3. Error message information disclosure

## Accessibility Tests
1. Screen reader compatibility
2. Keyboard navigation
3. Color contrast compliance
4. Focus visibility
```

- [ ] **Step 3: Run manual tests**

Run: `node web/server.js`
Expected: All core functionality works as expected

- [ ] **Step 4: Commit**

```bash
git add web/
git commit -m "feat: add documentation and test scenarios"
```

### Task 7: Production Readiness Review

**Files:**
- Review all files for completeness
- Create: `.gitignore` for web directory
- Create: `web/config.js` (optional configuration)

- [ ] **Step 1: Review code for issues**

Check for:
- Hardcoded secrets or credentials
- Console.log or debug statements
- Proper error handling
- Input validation
- Security vulnerabilities (command injection)

- [ ] **Step 2: Add web-specific .gitignore**

```gitignore
# Web interface specific
node_modules/
dist/
.env
*.log
scan-result-*
```

- [ ] **Step 3: Optional: Add configuration file**

```javascript
// web/config.js
module.exports = {
    port: process.env.PORT || 3000,
    scannerPath: path.join(__dirname, '..'),
    timeout: parseInt(process.env.SCANNER_TIMEOUT) || 60000,
    maxConcurrentScans: parseInt(process.env.MAX_CONCURRENT_SCANS) || 2
};
```

- [ ] **Step 4: Final testing**

Run: `npm test` (in scanner directory) to ensure scanner still works
Run: `node web/server.js` and test end-to-end flow

- [ ] **Step 5: Commit**

```bash
git add web/
git commit -m "chore: production readiness review and final adjustments"
```

## Plan Validation

### Spec Coverage Check
✓ Web interface for Ariel Security Scanner
✓ URL input for target selection
✓ Module selection checkboxes
✓ Output format selection
✓ Verbose mode toggle
✓ Results display area
✓ Integration with existing CLI tool
✓ Error handling and user feedback
✓ Responsive design
✓ Accessibility considerations

### Placeholder Scan
No placeholders found - all steps contain actual implementation details.

### Type Consistency
All variable names and function signatures are consistent across tasks.