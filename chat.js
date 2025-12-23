/**
 * Egis AI Agent - Chat Logic and Groq API Integration
 * Handles all chat functionality and document analysis
 */

class EgisChatAgent {
    constructor() {
        this.conversationHistory = [];
        this.documents = [];
        this.systemPrompt = ''; // Will be set after documents load
        this.initialize();
    }

    /**
     * Initialize the chat agent
     */
    async initialize() {
        console.log('Initialisation de l\'agent de chat Egis...');
        
        // Check API configuration
        if (!config.isConfigured()) {
            this.addMessage('bot', 'Veuillez configurer votre clé API Groq en cliquant sur le bouton ⚙️ en bas à droite.');
            return;
        }

        // Load documents first, then set system prompt
        await this.loadDocuments();
        
        // Show document info to user
        if (this.documents.length > 0) {
            const docInfo = `J'ai accès à ${this.documents.length} rapports d'innovation : ` + 
                this.documents.map(doc => this.extractSiteName(doc.name)).join(', ');
            console.log('Documents chargés:', docInfo);
        }
        
        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Get system prompt with instructions
     */
    getSystemPrompt() {
        // Build document list for the prompt
        let documentList = '';
        if (this.documents && this.documents.length > 0) {
            documentList = '\n\nDOCUMENTS DISPONIBLES DANS LE RÉFÉRENTIEL :\n';
            documentList += this.documents.map((doc, index) => {
                const siteName = this.extractSiteName(doc.name);
                const sizeKB = doc.size ? (doc.size / 1024).toFixed(1) : 'Inconnu';
                return `${index + 1}. ${doc.name} (${siteName}) - ${sizeKB} KB`;
            }).join('\n');
            documentList += `\n\nTotal : ${this.documents.length} rapports d'innovation disponibles pour l'analyse.`;
        } else {
            documentList = '\n\nNote : La liste des documents est en cours de chargement. Vous avez accès à plusieurs rapports d\'innovation de différents sites de concession.';
        }

        return `Vous êtes un agent IA chargé d'analyser tous les documents disponibles sur le site Egis Operations. Votre objectif principal est d'identifier et de résumer les rapports liés à l'innovation provenant des sites de concession.
${documentList}

Tâche
Lors de la consultation des rapports PDF (rédigés en grec), vous devez :

- Traduire le contenu pertinent en français.
- Extraire les informations clés.
- Présenter vos résultats dans un format standardisé.

Axes d'analyse
Concentrez-vous sur :

- Les initiatives d'innovation
- Les solutions technologiques déployées
- Les améliorations opérationnelles
- Les mesures de durabilité
- Les enseignements et recommandations

Format de sortie attendu
Titre : Rapport d'innovation – [Nom du site de concession]

1. Résumé exécutif
   Brève présentation du site et du contexte
   Principaux points 

2. Initiatives d'innovation
   Description des nouvelles technologies ou processus
   Objectifs et résultats attendus

3. Détails de mise en œuvre
   Calendrier et phases
   Parties prenantes impliquées
   Ressources mobilisées

4. Résultats & Impact
   Résultats quantitatifs (KPIs, métriques)
   Résultats qualitatifs (expérience utilisateur, efficacité opérationnelle)

5. Durabilité & Scalabilité
   Bénéfices environnementaux ou sociaux
   Potentiel de réplication sur d'autres sites

6. Défis & Enseignements
   Obstacles rencontrés
   Solutions appliquées
   Recommandations pour les projets futurs

7. Conclusion
   Évaluation globale du succès de l'innovation
   Prochaines étapes ou perspectives

Notes d'utilisation
- Si une synthèse générale de tous les rapports est demandée, l'agent doit agréger les résultats par site et mettre en évidence les thèmes récurrents (ex. durabilité, digitalisation, gains d'efficacité).
- Si un site spécifique est demandé, l'agent doit filtrer et présenter uniquement le rapport correspondant, en respectant la même structure.
- Le ton doit rester professionnel, concis et analytique.
- L'agent ne peut pas consulter de sites externes : seules les sources spécifiées (rapports PDF) doivent être utilisées.
- Lors de la liste d'éléments, utilisez des puces commençant par "-" pour qu'elles s'affichent avec le logo Egis.`;
    }

    /**
     * Load documents from repository
     */
    async loadDocuments() {
        console.log('Chargement des documents depuis le référentiel...');
        
        try {
            // Try to fetch document list from GitHub API
            const response = await fetch('https://api.github.com/repos/ulirdz/egis-test.ia/contents/documents');
            
            if (response.ok) {
                const files = await response.json();
                
                // Filter for PDF files and create document list
                this.documents = files
                    .filter(file => file.name.endsWith('.pdf') || file.name.endsWith('.PDF'))
                    .map(file => ({
                        name: file.name,
                        path: file.path,
                        url: file.download_url,
                        size: file.size
                    }));
                
                console.log(`✅ ${this.documents.length} documents chargés depuis GitHub:`, this.documents);
            } else {
                console.warn('⚠️ Impossible de récupérer depuis l\'API GitHub, utilisation de la liste de secours');
                this.useFallbackDocuments();
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des documents:', error);
            this.useFallbackDocuments();
        }
        
        // Update system prompt with document information
        this.systemPrompt = this.getSystemPrompt();
        console.log('System prompt mis à jour avec', this.documents.length, 'documents');
    }
    
    /**
     * Use fallback document list if GitHub API fails
     */
    useFallbackDocuments() {
        this.documents = [
            { name: 'RPT_SafetyMeasures_Anthochoriou_v1.2.pdf', path: 'documents/RPT_SafetyMeasures_Anthochoriou_v1.2.pdf' },
            { name: 'RPT_SafetyMeasures_Dyo Korifes_v1.2.pdf', path: 'documents/RPT_SafetyMeasures_Dyo Korifes_v1.2.pdf' },
            { name: 'RPT_SafetyMeasures_Kalamion_v1.2.pdf', path: 'documents/RPT_SafetyMeasures_Kalamion_v1.2.pdf' },
            { name: 'RPT_SafetyMeasures_Neochoriou_v1.2.pdf', path: 'documents/RPT_SafetyMeasures_Neochoriou_v1.2.pdf' },
            { name: 'RPT_SafetyMeasures_S10_Vermiou_v1.2.pdf', path: 'documents/RPT_SafetyMeasures_S10_Vermiou_v1.2.pdf' },
            { name: 'RPT_SafetyMeasures_S12_v1.2.pdf', path: 'documents/RPT_SafetyMeasures_S12_v1.2.pdf' },
            { name: 'RPT_SafetyMeasures_S13_Polymylou_v1.2.pdf', path: 'documents/RPT_SafetyMeasures_S13_Polymylou_v1.2.pdf' },
            { name: 'RPT_SafetyMeasures_S1N_Ag.Nikolaos_v1.2.pdf', path: 'documents/RPT_SafetyMeasures_S1N_Ag.Nikolaos_v1.2.pdf' },
            { name: 'RPT_SafetyMeasures_S1-Panagias_v1.2.pdf', path: 'documents/RPT_SafetyMeasures_S1-Panagias_v1.2.pdf' },
            { name: 'RPT_SafetyMeasures_S1-Seliani_v1.2.pdf', path: 'documents/RPT_SafetyMeasures_S1-Seliani_v1.2.pdf' },
            { name: 'RPT_SafetyMeasures_S2-Agnaderou_v1.2.pdf', path: 'documents/RPT_SafetyMeasures_S2-Agnaderou_v1.2.pdf' },
            { name: 'RPT_SafetyMeasures_S2-Paramythias_v1.2.pdf', path: 'documents/RPT_SafetyMeasures_S2-Paramythias_v1.2.pdf' },
            { name: 'RPT_SafetyMeasures_S3-Grika_v1.2.pdf', path: 'documents/RPT_SafetyMeasures_S3-Grika_v1.2.pdf' },
            { name: 'RPT_SafetyMeasures_Symvolou_v1.2.pdf', path: 'documents/RPT_SafetyMeasures_Symvolou_v1.2.pdf' },
            { name: 'RPT_SafetyMeasures_T8-Dematiou_v1.2.pdf', path: 'documents/RPT_SafetyMeasures_T8-Dematiou_v1.2.pdf' }
        ];
        console.log(`📋 Utilisation de la liste de secours : ${this.documents.length} documents`);
    }

    /**
     * Extract site name from document filename
     */
    extractSiteName(filename) {
        // Remove file extension
        let name = filename.replace(/\.pdf$/i, '').replace(/RPT_SafetyMeasures_/i, '');
        
        // Clean up version numbers
        name = name.replace(/_v\d+\.\d+$/i, '');
        
        // Replace underscores and hyphens with spaces
        name = name.replace(/[_-]/g, ' ');
        
        return name.trim();
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
            contentDiv.innerHTML = `<strong>Vous</strong><p>${this.escapeHtml(content)}</p>`;
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
        // Escape HTML first
        content = this.escapeHtml(content);
        
        // Convert markdown tables before other formatting
        content = this.convertMarkdownTables(content);
        
        // Convert line breaks to <br>
        content = content.replace(/\n/g, '<br>');

        // Add Egis logo to bullet points (lines starting with -)
        content = content.replace(/^-\s/gm, '<img src="documents/egis.png" alt="Egis Logo" style="height:20px; vertical-align:middle; margin-right:5px;">');
        
        // Add Egis logo to bullet points (lines starting with *)
        content = content.replace(/^\*\s/gm, '<img src="documents/egis.png" alt="Egis Logo" style="height:20px; vertical-align:middle; margin-right:5px;">');
        
        // Format bold text (**text**)
        content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        // Format italic text (*text*)
        content = content.replace(/\*(.+?)\*/g, '<em>$1</em>');
        
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
     * Convert Markdown tables to HTML tables
     */
    convertMarkdownTables(text) {
        const lines = text.split('\n');
        let inTable = false;
        let result = '';
        
        lines.forEach((line, idx) => {
            if (line.trim().startsWith('|')) {
                if (!inTable) {
                    inTable = true;
                    result += '<table class="markdown-table">';
                }
                const cells = line.trim().replace(/^\||\|$/g, '').split('|');
                result += '<tr>';
                cells.forEach(cell => result += `<td>${cell.trim()}</td>`);
                result += '</tr>';
                
                const next = lines[idx + 1] || '';
                if (!next.trim().startsWith('|')) {
                    result += '</table>';
                    inTable = false;
                }
            } else {
                if (inTable) {
                    result += '</table>';
                    inTable = false;
                }
                result += line + '\n';
            }
        });
        
        if (inTable) result += '</table>';
        return result;
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
                    <p>Conversation effacée. Comment puis-je vous aider ?</p>
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
    console.log('DOM chargé, initialisation de l\'agent de chat...');
    window.chatAgent = new EgisChatAgent();
});