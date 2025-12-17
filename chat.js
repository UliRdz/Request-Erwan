/**
 * Egis AI Agent - Chat Logic and Groq API Integration
 * Handles all chat functionality and document analysis
 */

class EgisChatAgent {
    constructor() {
        this.conversationHistory = [];
        this.documents = [];
        this.systemPrompt = this.getSystemPrompt();
        this.initialize();
    }

    /**
     * Initialize the chat agent
     */
    initialize() {
        console.log('Initialisation de l\'agent de chat Egis...');
        
        // Check API configuration
        if (!config.isConfigured()) {
            this.addMessage('bot', 'Veuillez configurer votre clé API Groq en cliquant sur le bouton ⚙️ en bas à droite.');
            return;
        }

        // Load documents
        this.loadDocuments();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Get system prompt with instructions
     */
    getSystemPrompt() {
        return `Vous êtes un agent IA chargé d'analyser tous les documents disponibles sur le site Egis Operations. Votre objectif principal est d'identifier et de résumer les rapports liés à l'innovation provenant des sites de concession.

        Tâche
        Lors de la consultation des 35 rapports PDF (rédigés en grec), vous devez :

        Traduire le contenu pertinent en français.

        Extraire les informations clés.

        Présenter vos résultats dans un format standardisé.

        Axes d'analyse
        Concentrez-vous sur :

        -Les initiatives d'innovation
        -Les solutions technologiques déployées
        -Les améliorations opérationnelles
        -Les mesures de durabilité
        -Les enseignements et recommandations

        **Format de sortie attendu
        Titre : Rapport d'innovation + [Nom du site de concession]

        Résumé exécutif
        Brève présentation du site et du contexte
        Principaux points 

        Initiatives d'innovation
        Description des nouvelles technologies ou processus
        Objectifs et résultats attendus
        Détails de mise en œuvre
        Calendrier et phases

        Parties prenantes impliquées
        Ressources mobilisées
        Résultats & Impact
        Résultats quantitatifs (KPIs, métriques)
        Résultats qualitatifs (expérience utilisateur, efficacité opérationnelle)

        Durabilité & Scalabilité
        Bénéfices environnementaux ou sociaux
        Potentiel de réplication sur d'autres sites
        Défis & Enseignements
        Obstacles rencontrés
        Solutions appliquées
        Recommandations pour les projets futurs

        Conclusion
        Évaluation globale du succès de l'innovation
        Prochaines étapes ou perspectives

        Notes d'utilisation
        Si une synthèse générale des 35 rapports est demandée, l'agent doit agréger les résultats par site et mettre en évidence les thèmes récurrents (ex. durabilité, digitalisation, gains d'efficacité).
        Si un site spécifique est demandé, l'agent doit filtrer et présenter uniquement le rapport correspondant, en respectant la même structure.
        Le ton doit rester professionnel, concis et analytique
        L'agent ne peut pas consulter de sites externes : seules les sources spécifiées (rapports PDF) doivent être utilisées.`;
    }

    /**
     * Load documents from repository
     */
    async loadDocuments() {
        // In a real implementation, you would fetch the list of documents from your repository
        // For now, we'll simulate this with a placeholder
        
        console.log('Loading documents from repository...');
        
        // Placeholder for document list
        // You should replace this with actual document fetching logic
        this.documents = [
            { name: 'Mesures de sécurité, Tunnel Anthochoriou', path: '/documents/RPT_SafetyMeasures_Anthochoriou_v1.2.pdf' },
            { name: 'Mesures de sécurité, Tunnel Dyo Korifes', path: '/documents/RPT_SafetyMeasures_Dyo Korifes_v1.2.pdf' },
            { name: 'Mesures de sécurité, Tunnel Kalamion', path: '/documents/RPT_SafetyMeasures_Kalamion_v1.2.pdf' },
            { name: 'Mesures de sécurité, Tunnel Neochoriou', path: '/documents/RPT_SafetyMeasures_Neochoriou_v1.2.pdf' },
            { name: 'Mesures de sécurité, Tunnel S10 Vermiou', path: '/documents/RPT_SafetyMeasures_S10_Vermiou_v1.2.pdf' },
            { name: 'Mesures de sécurité, Tunnel S12', path: '/documents/RPT_SafetyMeasures_S12_v1.2.pdf' },
            { name: 'Mesures de sécurité, Tunnel S13 Polymylou', path: '/documents/RPT_SafetyMeasures_S13_Polymylou_v1.2.pdf' },
            { name: 'Mesures de sécurité, Tunnel S1N Agios Nikolaos', path: '/documents/RPT_SafetyMeasures_S1N_Ag.Nikolaos_v1.2.pdf' },
            { name: 'Mesures de sécurité, Tunnel S1 Panagias', path: '/documents/RPT_SafetyMeasures_S1-Panagias_v1.2.pdf' },
            { name: 'Mesures de sécurité, Tunnel S1 Seliani', path: '/documents/RPT_SafetyMeasures_S1-Seliani_v1.2.pdf' },
            { name: 'Mesures de sécurité, Tunnel S2 Agnadero', path: '/documents/RPT_SafetyMeasures_S2-Agnaderou_v1.2.pdf' },
            { name: 'Mesures de sécurité, Tunnel S2 Paramythias', path: '/documents/RPT_SafetyMeasures_S2-Paramythias_v1.2.pdf' },
            { name: 'Mesures de sécurité, Tunnel S3 Grika', path: '/documents/RPT_SafetyMeasures_S3-Grika_v1.2.pdf' },
            { name: 'Mesures de sécurité, Tunnel Symvolou', path: '/documents/RPT_SafetyMeasures_Symvolou_v1.2.pdf' },   
            { name: 'Mesures de sécurité, Tunnel Symvolou', path: '/documents/RPT_SafetyMeasures_Symvolou_v1.2.pdf' },
            { name: 'Mesures de sécurité, Tunnel T8 Dematiou', path: '/documents/RPT_SafetyMeasures_T8-Dematiou_v1.2.pdf' }
        ];
        
        console.log(`Loaded ${this.documents.length} documents`);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const input = document.getElementById('userInput');
        const sendBtn = document.getElementById('sendBtn');
        
        // Send on button click
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.handleSendMessage());
        }
        
        // Send on Enter (but allow Shift+Enter for new line)
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });
            
            // Auto-resize textarea
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = input.scrollHeight + 'px';
            });
        }
    }

    /**
     * Handle sending a message
     */
    handleSendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        if (!config.isConfigured()) {
            alert('Veuillez d\'abord configurer votre clé API Groq (cliquez sur le bouton ⚙️).');
            return;
        }
        
        // Clear input
        input.value = '';
        input.style.height = 'auto';
        
        // Add user message
        this.addMessage('user', message);
        
        // Process with AI
        this.processMessage(message);
    }

    /**
     * Add a message to the chat
     */
    addMessage(sender, content) {
        const messagesDiv = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (sender === 'bot') {
            contentDiv.innerHTML = `<strong>Egis AI Analyst</strong><p>${this.formatMessage(content)}</p>`;
        } else {
            contentDiv.innerHTML = `<strong>You</strong><p>${this.escapeHtml(content)}</p>`;
        }
        
        messageDiv.appendChild(contentDiv);
        messagesDiv.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const messagesDiv = document.getElementById('messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <div class="message-content">
                <strong>Egis AI Analyst</strong>
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        messagesDiv.appendChild(typingDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    /**
     * Remove typing indicator
     */
    removeTypingIndicator() {
        const typingDiv = document.getElementById('typingIndicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    /**
     * Process message with Groq API
     */
    async processMessage(userMessage) {
        this.showTypingIndicator();
        
        try {
            // Add user message to history
            this.conversationHistory.push({
                role: 'user',
                content: userMessage
            });
            
            // Prepare messages for API
            const messages = [
                {
                    role: 'system',
                    content: this.systemPrompt
                },
                ...this.conversationHistory
            ];
            
            // Call Groq API
            const response = await this.callGroqAPI(messages);
            
            // Add assistant response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: response
            });
            
            // Remove typing indicator and show response
            this.removeTypingIndicator();
            this.addMessage('bot', response);
            
        } catch (error) {
            console.error('Error processing message:', error);
            this.removeTypingIndicator();
            this.addMessage('bot', `Erreur : ${error.message}. Veuillez vérifier la configuration de votre clé API et réessayer.`);
        }
    }

    /**
     * Call Groq API
     */
    async callGroqAPI(messages) {
        const apiKey = config.getApiKey();
        
        if (!apiKey) {
            throw new Error('API key not configured');
        }
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-120b',
                messages: messages,
                temperature: 1.0,
                max_tokens: 8192,
                top_p: 1,
                stream: false
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response from API');
        }
        
        return data.choices[0].message.content;
    }

    /**
     * Format message content (preserve line breaks, etc.)
     */
     formatMessage(content) {
        // Escape HTML
        content = this.escapeHtml(content);
        
        // Convert line breaks to <br>
        content = content.replace(/\n/g, '<br>');

        // Add Egis logo to bullet points (lines starting with *)
        content = content.replace(/^\*\s/gm, '<img src="documents/egis.png" alt="Egis Logo" style="height:20px; vertical-align:middle; margin-right:5px;">');
        
        // Format bold text (**text**)
        content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        // Format italic text (*text*)
        content = content.replace(/\*(.+?)\*/g, '<em>$1</em>');
        
        // Add Egis logo to bullet points (lines starting with -)
        content = content.replace(/^-\s/gm, '<img src="documents/egis.png" alt="Egis Logo" style="height:20px; vertical-align:middle; margin-right:5px;">');
        
        // Add Egis logo to numbered lists (lines starting with number.)
        content = content.replace(/^(\d+)\.\s/gm, '<img src="documents/egis.png" alt="Egis Logo" style="height:20px; vertical-align:middle; margin-right:5px;">$1. ');
        
        return content;
    }
    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = `
            <div class="message bot">
                <div class="message-content">
                    <strong>Egis AI Analyst</strong>
                    <p>Conversation cleared. How can I help you?</p>
                </div>
            </div>
        `;
    }
}

// Global functions for example buttons
function askExample(question) {
    const input = document.getElementById('userInput');
    input.value = question;
    input.focus();
}

function sendMessage() {
    if (window.chatAgent) {
        window.chatAgent.handleSendMessage();
    }
}

// Initialize chat agent when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing chat agent...');
    window.chatAgent = new EgisChatAgent();

});






