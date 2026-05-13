// script.js
function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Format JSON with syntax highlighting
function formatJSONWithHighlighting(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        let formatted = JSON.stringify(parsed, null, 2);

        // Apply syntax highlighting
        formatted = formatted
            .replace(/("(\\u[a-zA-Z0-9]{4}|[^"])*"):/g, '<span class="text-blue-400">$1</span>:')
            .replace(/"([^"]|\\")*"/g, '<span class="text-green-400">$&</span>')
            .replace(/\b(null|false|true)\b/g, '<span class="text-red-400">$&</span>')
            .replace(/\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, '<span class="text-purple-400">$&</span>');

        return `<div class="bg-gray-800 rounded-lg p-4"><pre class="text-sm"><code class="language-json">${formatted}</code></pre></div>`;
    } catch (e) {
        // If JSON parsing fails, return as plain text with basic formatting
        return `<div class="bg-gray-800 rounded-lg p-4"><pre class="text-sm whitespace-pre-wrap">${jsonString}</pre></div>`;
    }
}

// Format plain text with basic styling
function formatPlainText(text) {
    // Escape HTML to prevent XSS
    const escaped = text.replace(/[&<>"']/g, function(match) {
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return escapeMap[match];
    });

    return `<div class="bg-gray-800 rounded-lg p-4"><pre class="text-sm whitespace-pre-wrap">${escaped}</pre></div>`;
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('scanForm');
    const scanButton = document.getElementById('scanButton');
    const loadingContainer = document.getElementById('loadingContainer');
    const resultsSection = document.getElementById('resultsSection');
    const resultsContent = document.getElementById('resultsContent');
    const clearResultsBtn = document.getElementById('clearResults');
    const scanInfo = document.getElementById('scanInfo');
    const urlInput = document.getElementById('url');

    // Accessibility improvement
    urlInput.setAttribute('aria-required', 'true');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const url = formData.get('url');
        const modules = formData.getAll('modules');
        const format = formData.get('format');
        const verbose = formData.get('verbose') === 'on';

        // URL validation
        if (!validateURL(url)) {
            showError('Please enter a valid URL including http:// or https://');
            return;
        }

        // UI state updates
        scanButton.disabled = true;
        scanButton.innerHTML = '<span class="inline-flex items-center space-x-2"><svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9h.582M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>Scanning...</span>';
        loadingContainer.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        resultsContent.innerHTML = '';

        try {
            // Show scan info with timestamp
            const scanTime = new Date().toLocaleTimeString();
            scanInfo.textContent = `Scan started at ${scanTime}...`;

            const response = await fetch('/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url, modules, format, verbose })
            });

            const result = await response.json();

            if (result.success) {
                // Update scan info
                scanInfo.textContent = `Scan completed at ${new Date().toLocaleTimeString()} - Found ${result.data.includes('vulnerability') ? 'issues' : 'no critical issues'}`;

                // Display results based on format
                if (result.format === 'html') {
                    resultsContent.innerHTML = `<div class="bg-gray-800 rounded-lg p-4">${result.data}</div>`;
                } else if (result.format === 'json') {
                    resultsContent.innerHTML = formatJSONWithHighlighting(result.data);
                } else {
                    // Markdown or plain text
                    resultsContent.innerHTML = formatPlainText(result.data);
                }

                // Show results section
                resultsSection.classList.remove('hidden');
            } else {
                showError(result.error || 'An unknown error occurred during the scan.');
            }
        } catch (error) {
            console.error('Scan error:', error);
            showError(`Scan failed: ${error.message || 'Network error or timeout occurred'}`);
        } finally {
            // Reset UI state
            scanButton.disabled = false;
            scanButton.textContent = 'Start Security Scan';
            loadingContainer.classList.add('hidden');
        }
    });

    // Clear results button
    clearResultsBtn.addEventListener('click', function() {
        resultsSection.classList.add('hidden');
        resultsContent.innerHTML = '';
        scanInfo.textContent = 'Scan completed';
        urlInput.focus();
    });

    // Enable Enter key to submit form
    form.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    });

    // Focus URL input on page load
    urlInput.focus();
});

function showError(message) {
    // Create error alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'bg-red-900 bg-opacity-50 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4';
    alertDiv.innerHTML = `
        <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
                <p class="font-medium">${message}</p>
            </div>
        </div>
    `;

    // Insert error alert at the top of the form
    const form = document.getElementById('scanForm');
    const existingAlert = form.querySelector('.bg-red-900');
    if (existingAlert) {
        existingAlert.remove();
    }
    form.insertBefore(alertDiv, form.firstChild);

    // Auto-remove error after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}