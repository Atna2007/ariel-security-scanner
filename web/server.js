const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Add scan endpoint
app.post('/scan', (req, res) => {
    const { url, modules, format, verbose } = req.body;

    // Validate URL
    if (!url || !url.startsWith('http')) {
        return res.status(400).json({ success: false, error: 'Invalid URL provided' });
    }

    // Build command
    let command = `node dist/cli/index.js "${url}"`;

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
    const distPath = path.join(scannerPath, 'dist', 'cli', 'index.js');
    const fs = require('fs');

    // Debug logging
    console.log('__dirname:', __dirname);
    console.log('scannerPath:', scannerPath);
    console.log('distPath:', distPath);
    console.log('dist exists:', fs.existsSync(distPath));

    // Verify dist directory exists
    if (!fs.existsSync(distPath)) {
        return res.json({
            success: false,
            error: `Scanner not built. Looking for: ${distPath}`
        });
    }

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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});