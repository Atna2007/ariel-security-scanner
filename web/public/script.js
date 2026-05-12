// script.js
function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

document.getElementById('scanForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get('url');
    const modules = formData.getAll('modules');
    const format = formData.get('format');
    const verbose = formData.get('verbose') === 'on';

    if (!validateURL(url)) {
        alert('Please enter a valid URL including http:// or https://');
        return;
    }

    // Show loading state
    const scanButton = document.getElementById('scanButton');
    const resultsDiv = document.getElementById('results');
    const outputDiv = document.getElementById('output');
    const loadingSpinner = document.getElementById('loadingSpinner');

    scanButton.disabled = true;
    scanButton.textContent = 'Scanning...';
    loadingSpinner.classList.remove('hidden');
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

                // Add syntax highlighting for JSON
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
            }
        } else {
            outputDiv.innerHTML = `<p class="text-red-500">Error: ${result.error}</p>`;
        }
    } catch (error) {
        outputDiv.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
    } finally {
        scanButton.disabled = false;
        scanButton.textContent = 'Start Scan';
        loadingSpinner.classList.add('hidden');
    }
});

// Add accessibility improvements
document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('url');
    urlInput.setAttribute('aria-required', 'true');
});