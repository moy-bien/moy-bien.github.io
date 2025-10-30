/**
 * BrandingManager - Manages branding settings for PowerPoint generation
 * Handles logo uploads, color schemes, watermarks, and template persistence
 */

const BrandingManager = {
    // Default branding settings
    settings: {
        logo: null, // Base64 encoded logo image
        logoFile: null, // File object for logo
        colors: {
            primary: '#7c3aed',
            accent: '#8b5cf6'
        },
        watermark: {
            enabled: false,
            text: '',
            opacity: 0.15
        },
        footer: '',
        currentPreset: 'purple'
    },

    // Color presets
    colorPresets: {
        blue: { primary: '#2563eb', accent: '#3b82f6' },
        green: { primary: '#059669', accent: '#10b981' },
        purple: { primary: '#7c3aed', accent: '#8b5cf6' },
        orange: { primary: '#ea580c', accent: '#f97316' },
        teal: { primary: '#0d9488', accent: '#14b8a6' },
        red: { primary: '#dc2626', accent: '#ef4444' }
    },

    /**
     * Initialize branding manager
     */
    init: function() {
        this.loadFromLocalStorage();
        this.updateUIFromSettings();
    },

    /**
     * Get current branding settings
     */
    getSettings: function() {
        return this.settings;
    },

    /**
     * Apply a color preset
     */
    applyColorPreset: function(presetName) {
        if (this.colorPresets[presetName]) {
            this.settings.colors = { ...this.colorPresets[presetName] };
            this.settings.currentPreset = presetName;

            // Update custom color pickers
            document.getElementById('customPrimary').value = this.settings.colors.primary;
            document.getElementById('customAccent').value = this.settings.colors.accent;

            // Highlight selected preset
            document.querySelectorAll('.preset-option').forEach(opt => {
                opt.classList.remove('active');
            });
            document.querySelector(`.preset-option[data-preset="${presetName}"]`)?.classList.add('active');
        }
    },

    /**
     * Update colors from custom color pickers
     */
    updateCustomColors: function() {
        this.settings.colors.primary = document.getElementById('customPrimary').value;
        this.settings.colors.accent = document.getElementById('customAccent').value;
        this.settings.currentPreset = 'custom';

        // Unhighlight all presets
        document.querySelectorAll('.preset-option').forEach(opt => {
            opt.classList.remove('active');
        });
    },

    /**
     * Handle logo file upload
     */
    handleLogoUpload: function(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Logo file size must be less than 2MB');
            return;
        }

        this.settings.logoFile = file;

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.settings.logo = e.target.result;
            const preview = document.getElementById('logoPreview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Logo preview" style="max-width: 200px; max-height: 100px;">`;
        };
        reader.readAsDataURL(file);
    },

    /**
     * Toggle watermark options
     */
    toggleWatermark: function() {
        const enabled = document.getElementById('enableWatermark').checked;
        this.settings.watermark.enabled = enabled;
        document.getElementById('watermarkOptions').style.display = enabled ? 'block' : 'none';
    },

    /**
     * Update watermark opacity display
     */
    updateWatermarkOpacity: function() {
        const opacity = document.getElementById('watermarkOpacity').value;
        this.settings.watermark.opacity = opacity / 100;
        document.getElementById('opacityValue').textContent = `${opacity}%`;
    },

    /**
     * Apply branding settings and close modal
     */
    applyBranding: function() {
        // Collect all settings from form
        this.settings.watermark.text = document.getElementById('watermarkText').value;
        this.settings.footer = document.getElementById('footerText').value;

        // Save to localStorage
        this.saveToLocalStorage();

        // Close modal
        this.closeModal();

        // Show confirmation
        this.showStatus('Branding settings applied successfully', 'success');
    },

    /**
     * Reset branding to defaults
     */
    resetBranding: function() {
        if (!confirm('Reset all branding settings to default?')) return;

        this.settings = {
            logo: null,
            logoFile: null,
            colors: {
                primary: '#7c3aed',
                accent: '#8b5cf6'
            },
            watermark: {
                enabled: false,
                text: '',
                opacity: 0.15
            },
            footer: '',
            currentPreset: 'purple'
        };

        this.updateUIFromSettings();
        this.saveToLocalStorage();
        this.showStatus('Branding reset to defaults', 'info');
    },

    /**
     * Save branding template
     */
    saveBrandingTemplate: function() {
        const templateName = document.getElementById('brandingTemplateName').value.trim();
        if (!templateName) {
            alert('Please enter a template name');
            return;
        }

        const templates = JSON.parse(localStorage.getItem('brandingTemplates') || '{}');
        templates[templateName] = { ...this.settings };
        localStorage.setItem('brandingTemplates', JSON.stringify(templates));

        this.showStatus(`Template "${templateName}" saved`, 'success');
    },

    /**
     * Load branding template
     */
    loadBrandingTemplate: function() {
        const templates = JSON.parse(localStorage.getItem('brandingTemplates') || '{}');
        const templateNames = Object.keys(templates);

        if (templateNames.length === 0) {
            alert('No saved templates found');
            return;
        }

        const templateName = prompt(`Available templates:\n${templateNames.join('\n')}\n\nEnter template name to load:`);
        if (!templateName || !templates[templateName]) {
            return;
        }

        this.settings = { ...templates[templateName] };
        this.updateUIFromSettings();
        this.showStatus(`Template "${templateName}" loaded`, 'success');
    },

    /**
     * Update UI elements from current settings
     */
    updateUIFromSettings: function() {
        // Update color pickers
        document.getElementById('customPrimary').value = this.settings.colors.primary;
        document.getElementById('customAccent').value = this.settings.colors.accent;

        // Update watermark
        document.getElementById('enableWatermark').checked = this.settings.watermark.enabled;
        document.getElementById('watermarkText').value = this.settings.watermark.text;
        document.getElementById('watermarkOpacity').value = this.settings.watermark.opacity * 100;
        document.getElementById('opacityValue').textContent = `${this.settings.watermark.opacity * 100}%`;
        document.getElementById('watermarkOptions').style.display = this.settings.watermark.enabled ? 'block' : 'none';

        // Update footer
        document.getElementById('footerText').value = this.settings.footer;

        // Update logo preview
        if (this.settings.logo) {
            const preview = document.getElementById('logoPreview');
            preview.innerHTML = `<img src="${this.settings.logo}" alt="Logo preview" style="max-width: 200px; max-height: 100px;">`;
        }

        // Highlight current preset
        if (this.settings.currentPreset !== 'custom') {
            document.querySelectorAll('.preset-option').forEach(opt => {
                opt.classList.remove('active');
            });
            document.querySelector(`.preset-option[data-preset="${this.settings.currentPreset}"]`)?.classList.add('active');
        }
    },

    /**
     * Save settings to localStorage
     */
    saveToLocalStorage: function() {
        localStorage.setItem('brandingSettings', JSON.stringify(this.settings));
    },

    /**
     * Load settings from localStorage
     */
    loadFromLocalStorage: function() {
        const saved = localStorage.getItem('brandingSettings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };
            } catch (e) {
                console.error('Error loading branding settings:', e);
            }
        }
    },

    /**
     * Open branding modal
     */
    openModal: function() {
        document.getElementById('brandingModal').style.display = 'flex';
        this.updateUIFromSettings();
    },

    /**
     * Close branding modal
     */
    closeModal: function() {
        document.getElementById('brandingModal').style.display = 'none';
    },

    /**
     * Show status message
     */
    showStatus: function(message, type) {
        // Create status message element
        const status = document.createElement('div');
        status.className = `branding-status ${type}`;
        status.textContent = message;
        status.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(status);

        setTimeout(() => {
            status.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => status.remove(), 300);
        }, 3000);
    }
};

// Global functions for HTML onclick handlers
function openBrandingModal() {
    BrandingManager.openModal();
}

function closeBrandingModal() {
    BrandingManager.closeModal();
}

function applyColorPreset(presetName) {
    BrandingManager.applyColorPreset(presetName);
}

function updateCustomColors() {
    BrandingManager.updateCustomColors();
}

function handleLogoUpload(event) {
    BrandingManager.handleLogoUpload(event);
}

function toggleWatermark() {
    BrandingManager.toggleWatermark();
}

function applyBranding() {
    BrandingManager.applyBranding();
}

function resetBranding() {
    BrandingManager.resetBranding();
}

function saveBrandingTemplate() {
    BrandingManager.saveBrandingTemplate();
}

function loadBrandingTemplate() {
    BrandingManager.loadBrandingTemplate();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    BrandingManager.init();

    // Update opacity value display when slider changes
    const opacitySlider = document.getElementById('watermarkOpacity');
    if (opacitySlider) {
        opacitySlider.addEventListener('input', () => {
            BrandingManager.updateWatermarkOpacity();
        });
    }
});
