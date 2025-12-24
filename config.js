/**
 * Configuration Management for Egis AI Agent
 * Handles API key storage and retrieval
 */

class Config {
    constructor() {
        this.STORAGE_KEY = 'Egis-Test';
        this.apiKey = null;
        this.loadApiKey();
    }

    /**
     * Load API key from memory (localStorage not available)
     */
    loadApiKey() {
        // API key will be stored in memory only
        if (this.apiKey) {
            this.updateStatus(true);
        } else {
            this.updateStatus(false);
        }
    }
    /**
     * Save API key to localStorage
     */
/**
 * Save API key to memory
 */
    saveApiKey(key) {
        try {
            if (!key || key.trim().length === 0) {
                throw new Error('API key cannot be empty');
            }
            
            this.apiKey = key.trim();
            this.updateStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving API key:', error);
            return false;
        }
    }

    /**
     * Get current API key
     */
    getApiKey() {
        return this.apiKey;
    }

    /**
     * Check if API key is configured
     */
    isConfigured() {
        return this.apiKey !== null && this.apiKey.length > 0;
    }

    /**
     * Clear API key
     */
    clearApiKey() {
        this.apiKey = null;
        this.updateStatus(false);
    }
    /**
     * Update status indicator in UI
     */
    updateStatus(isConfigured) {
        const indicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        if (indicator && statusText) {
            if (isConfigured) {
                indicator.textContent = '🟢';
                statusText.textContent = 'API configured and ready';
            } else {
                indicator.textContent = '⚪';
                statusText.textContent = 'API Key not configured - Click ⚙️ to set up';
            }
        }
    }
}

// Create global config instance
const config = new Config();

// Modal Functions
function openSettings() {
    const modal = document.getElementById('settingsModal');
    const input = document.getElementById('apiKeyInput');
    
    if (config.isConfigured()) {
        input.value = config.getApiKey();
    }
    
    modal.classList.add('active');
    input.focus();
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('active');
}

function saveApiKey() {
    const input = document.getElementById('apiKeyInput');
    const key = input.value.trim();
    
    if (!key) {
        alert('Please enter a valid API key');
        return;
    }
    
    if (config.saveApiKey(key)) {
        alert('API key saved successfully!');
        closeSettings();
        
        // Reload chat if needed
        if (window.chatAgent) {
            window.chatAgent.initialize();
        }
    } else {
        alert('Error saving API key. Please try again.');
    }
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('settingsModal');
    if (e.target === modal) {
        closeSettings();
    }
});

// Handle Enter key in API key input
document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKeyInput');
    if (apiKeyInput) {
        apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveApiKey();
            }
        });
    }

});
