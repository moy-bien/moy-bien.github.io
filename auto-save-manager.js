/**
 * Auto-save Manager
 * Handles auto-save functionality with visual feedback
 */

const AutoSaveManager = {
    lastSaveTime: null,
    autoSaveTimer: null,
    isEnabled: false,
    isSaving: false,

    /**
     * Initialize auto-save manager
     */
    init() {
        this.isEnabled = PROPOSAL_CONFIG.features.enableAutoSave;

        if (!this.isEnabled) {
            console.log('Auto-save is disabled');
            return;
        }

        console.log('Auto-save enabled');
        this.setupAutoSave();
        this.showIndicator();
        this.loadLastSaveTime();
    },

    /**
     * Setup auto-save with debouncing
     */
    setupAutoSave() {
        const form = document.getElementById('proposalForm');
        if (!form) return;

        const interval = PROPOSAL_CONFIG.features.autoSaveInterval || 30000;

        // Debounced auto-save on form input
        let debounceTimer;
        form.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            clearTimeout(this.autoSaveTimer);

            debounceTimer = setTimeout(() => {
                this.performAutoSave();
            }, interval);
        });

        // Periodic auto-save
        this.autoSaveTimer = setInterval(() => {
            this.performAutoSave();
        }, interval * 2); // Less frequent periodic saves
    },

    /**
     * Perform auto-save
     */
    async performAutoSave() {
        if (this.isSaving) return;

        try {
            this.isSaving = true;
            this.updateIndicator('saving', 'Saving...');

            // Collect form data
            const formData = FormHandler.collectFormData();

            // Skip if form is empty
            if (this.isFormEmpty(formData)) {
                this.isSaving = false;
                this.updateIndicator('idle', 'Auto-save enabled');
                return;
            }

            // Save to localStorage
            const draftId = this.generateDraftId(formData);
            const draft = {
                id: draftId,
                data: formData,
                timestamp: new Date().toISOString(),
                autoSaved: true
            };

            localStorage.setItem('autoSaveDraft', JSON.stringify(draft));
            this.lastSaveTime = new Date();
            this.saveLastSaveTime();

            // Show success
            this.updateIndicator('saved', 'Saved');
            this.showToast('success', 'Draft auto-saved', this.getTimeAgo());

            // Update last saved time display
            this.updateLastSavedDisplay();

            // Return to idle after 3 seconds
            setTimeout(() => {
                if (!this.isSaving) {
                    this.updateIndicator('idle', 'Auto-save enabled');
                }
            }, 3000);

        } catch (error) {
            console.error('Auto-save failed:', error);
            this.updateIndicator('error', 'Save failed');
            this.showToast('error', 'Auto-save failed', error.message);

            setTimeout(() => {
                this.updateIndicator('idle', 'Auto-save enabled');
            }, 3000);

        } finally {
            this.isSaving = false;
        }
    },

    /**
     * Check if form is empty
     */
    isFormEmpty(formData) {
        if (!formData || typeof formData !== 'object') return true;

        const hasContent = Object.values(formData).some(value => {
            if (value === null || value === undefined) return false;
            if (typeof value === 'string') return value.trim() !== '';
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object') return Object.keys(value).length > 0;
            return true;
        });

        return !hasContent;
    },

    /**
     * Generate unique draft ID
     */
    generateDraftId(formData) {
        const projectTitle = formData.project?.title || 'untitled';
        const timestamp = Date.now();
        return `draft-${projectTitle.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
    },

    /**
     * Show auto-save indicator
     */
    showIndicator() {
        const indicator = document.getElementById('autoSaveIndicator');
        if (indicator) {
            indicator.classList.add('visible');
        }
    },

    /**
     * Update indicator status
     */
    updateIndicator(status, text) {
        const indicator = document.getElementById('autoSaveIndicator');
        if (!indicator) return;

        const textElement = indicator.querySelector('.auto-save-text');
        if (textElement) {
            textElement.textContent = text;
        }

        // Remove all status classes
        indicator.classList.remove('saving', 'saved', 'error', 'idle');
        indicator.classList.add(status);
    },

    /**
     * Show toast notification
     */
    showToast(type, title, message) {
        // Create toast element
        let toast = document.getElementById('autoSaveToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'autoSaveToast';
            toast.className = 'auto-save-toast';
            toast.innerHTML = `
                <div class="auto-save-toast-icon"></div>
                <div class="auto-save-toast-content">
                    <div class="auto-save-toast-title"></div>
                    <div class="auto-save-toast-message"></div>
                </div>
            `;
            document.body.appendChild(toast);
        }

        // Update content
        const icon = toast.querySelector('.auto-save-toast-icon');
        const titleEl = toast.querySelector('.auto-save-toast-title');
        const messageEl = toast.querySelector('.auto-save-toast-message');

        icon.textContent = type === 'success' ? '✓' : '⚠';
        titleEl.textContent = title;
        messageEl.textContent = message;

        // Update styling
        toast.classList.remove('success', 'error');
        toast.classList.add(type);

        // Show toast
        toast.classList.add('show');

        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    /**
     * Get time ago string
     */
    getTimeAgo() {
        if (!this.lastSaveTime) return 'just now';

        const seconds = Math.floor((new Date() - this.lastSaveTime) / 1000);

        if (seconds < 5) return 'just now';
        if (seconds < 60) return `${seconds} seconds ago`;

        const minutes = Math.floor(seconds / 60);
        if (minutes === 1) return '1 minute ago';
        if (minutes < 60) return `${minutes} minutes ago`;

        const hours = Math.floor(minutes / 60);
        if (hours === 1) return '1 hour ago';
        return `${hours} hours ago`;
    },

    /**
     * Update last saved display
     */
    updateLastSavedDisplay() {
        const display = document.getElementById('lastSavedTime');
        if (!display) {
            // Create display element if it doesn't exist
            const draftSection = document.querySelector('.draft-save-section');
            if (draftSection) {
                const statusDiv = document.getElementById('draftStatus');
                if (statusDiv) {
                    const timeDisplay = document.createElement('div');
                    timeDisplay.id = 'lastSavedTime';
                    timeDisplay.className = 'last-saved-time recent';
                    timeDisplay.textContent = `Last saved: ${this.getTimeAgo()}`;
                    statusDiv.appendChild(timeDisplay);
                }
            }
        } else {
            display.textContent = `Last saved: ${this.getTimeAgo()}`;
            display.classList.add('recent');

            // Remove 'recent' class after 10 seconds
            setTimeout(() => {
                display.classList.remove('recent');
            }, 10000);
        }
    },

    /**
     * Save last save time to localStorage
     */
    saveLastSaveTime() {
        if (this.lastSaveTime) {
            localStorage.setItem('lastAutoSaveTime', this.lastSaveTime.toISOString());
        }
    },

    /**
     * Load last save time from localStorage
     */
    loadLastSaveTime() {
        const saved = localStorage.getItem('lastAutoSaveTime');
        if (saved) {
            this.lastSaveTime = new Date(saved);
            this.updateLastSavedDisplay();
        }
    },

    /**
     * Restore auto-saved draft
     */
    restoreAutoSave() {
        const saved = localStorage.getItem('autoSaveDraft');
        if (!saved) return null;

        try {
            const draft = JSON.parse(saved);
            return draft;
        } catch (error) {
            console.error('Failed to restore auto-saved draft:', error);
            return null;
        }
    },

    /**
     * Check if auto-saved draft exists
     */
    hasAutoSave() {
        return localStorage.getItem('autoSaveDraft') !== null;
    },

    /**
     * Prompt to restore auto-save
     */
    promptRestoreAutoSave() {
        if (!this.hasAutoSave()) return;

        const draft = this.restoreAutoSave();
        if (!draft) return;

        const timeAgo = this.getTimeAgoFromTimestamp(draft.timestamp);
        const message = `An auto-saved draft from ${timeAgo} was found. Would you like to restore it?`;

        if (confirm(message)) {
            // Populate form with saved data
            if (typeof FormHandler !== 'undefined' && FormHandler.populateForm) {
                FormHandler.populateForm(draft.data);
                this.showToast('success', 'Draft restored', 'Your previous work has been restored');
            }
        }
    },

    /**
     * Get time ago from timestamp
     */
    getTimeAgoFromTimestamp(timestamp) {
        const date = new Date(timestamp);
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return 'less than a minute ago';

        const minutes = Math.floor(seconds / 60);
        if (minutes === 1) return '1 minute ago';
        if (minutes < 60) return `${minutes} minutes ago`;

        const hours = Math.floor(minutes / 60);
        if (hours === 1) return '1 hour ago';
        if (hours < 24) return `${hours} hours ago`;

        const days = Math.floor(hours / 24);
        if (days === 1) return 'yesterday';
        return `${days} days ago`;
    },

    /**
     * Clear auto-save
     */
    clearAutoSave() {
        localStorage.removeItem('autoSaveDraft');
        localStorage.removeItem('lastAutoSaveTime');
        this.lastSaveTime = null;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AutoSaveManager.init();

    // Prompt to restore after a short delay
    setTimeout(() => {
        AutoSaveManager.promptRestoreAutoSave();
    }, 1000);

    // Update "time ago" display every minute
    setInterval(() => {
        AutoSaveManager.updateLastSavedDisplay();
    }, 60000);
});

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AutoSaveManager = AutoSaveManager;
}
