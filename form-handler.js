/**
 * Form Handler - Manages intake form logic and data collection
 * Handles form state, user interactions, and data extraction
 */

const FormHandler = {
  currentFormData: {},
  isDirty: false,

  /**
   * Initialize form handler
   */
  init() {
    console.log('Form Handler initialized');
    this.attachEventListeners();
    this.loadDraft();
  },

  /**
   * Attach event listeners to form elements
   */
  attachEventListeners() {
    const form = document.getElementById('proposalForm');
    if (!form) return;

    // Track form changes
    form.addEventListener('input', () => {
      this.isDirty = true;
      if (PROPOSAL_CONFIG.features.enableAutoSave) {
        this.saveDraft();
      }
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  },

  /**
   * Collect all form data into structured object
   */
  collectFormData() {
    const formData = {};
    const form = document.getElementById('proposalForm');
    const formElements = form.elements;

    for (let element of formElements) {
      if (!element.name || element.type === 'button') continue;

      const path = element.name.replace(/\[\]/g, '');
      const isArray = element.name.includes('[]');
      const isCheckbox = element.type === 'checkbox';
      const shouldSplitArray = element.hasAttribute('data-array');

      let value = element.value;

      // Handle different input types
      if (isCheckbox) {
        if (element.name.includes('[]')) {
          // Checkbox array (like delivery methods)
          if (element.checked) {
            this.setNestedValue(formData, path, value, true);
          }
        } else {
          // Single checkbox
          value = element.checked;
          this.setNestedValue(formData, path, value, false);
        }
        continue;
      }

      if (element.type === 'number') {
        value = value ? parseFloat(value) : undefined;
      }

      if (!value && value !== 0 && value !== false) continue;

      if (shouldSplitArray && typeof value === 'string') {
        // Split comma-separated values into array
        value = value.split(',').map(v => v.trim()).filter(v => v);
        this.setNestedValue(formData, path, value, false, true);
      } else if (isArray) {
        this.setNestedValue(formData, path, value, true);
      } else {
        this.setNestedValue(formData, path, value, false);
      }
    }

    // Clean up empty objects and arrays
    this.cleanEmptyValues(formData);
    this.currentFormData = formData;
    return formData;
  },

  /**
   * Set nested value in object using dot notation path
   */
  setNestedValue(obj, path, value, isArrayItem = false, replaceArray = false) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        const nextKey = keys[i + 1];
        current[key] = (nextKey === '' || isArrayItem) ? [] : {};
      }
      current = current[key];
    }

    const lastKey = keys[keys.length - 1];

    if (isArrayItem) {
      if (!Array.isArray(current[lastKey])) {
        current[lastKey] = [];
      }
      current[lastKey].push(value);
    } else if (replaceArray) {
      current[lastKey] = value;
    } else {
      current[lastKey] = value;
    }
  },

  /**
   * Remove empty values from object
   */
  cleanEmptyValues(obj) {
    for (let key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        this.cleanEmptyValues(obj[key]);
        if (Array.isArray(obj[key]) && obj[key].length === 0) {
          delete obj[key];
        } else if (!Array.isArray(obj[key]) && Object.keys(obj[key]).length === 0) {
          delete obj[key];
        }
      } else if (obj[key] === undefined || obj[key] === null || obj[key] === '') {
        delete obj[key];
      }
    }
  },

  /**
   * Handle form submission
   */
  handleSubmit() {
    const formData = this.collectFormData();

    // Validate form data
    const errors = DataValidator.validate(formData);

    if (errors.length > 0) {
      this.displayValidationErrors(errors);
      return false;
    }

    console.log('Form submitted successfully:', formData);
    alert('Form submitted successfully! Check console for data.');

    // Clear draft after successful submission
    this.clearDraft();
    this.isDirty = false;

    return true;
  },

  /**
   * Display validation errors
   */
  displayValidationErrors(errors) {
    const results = document.getElementById('validationResults');
    results.innerHTML = '<div class="error"><h3>Validation Errors:</h3><ul>' +
      errors.map(e => `<li>${e}</li>`).join('') +
      '</ul></div>';
    results.style.display = 'block';
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  /**
   * Save draft to localStorage
   */
  saveDraft() {
    const formData = this.collectFormData();
    const draft = {
      data: formData,
      timestamp: new Date().toISOString(),
      template: document.getElementById('templateSelect')?.value || 'default'
    };

    try {
      localStorage.setItem('proposal_draft', JSON.stringify(draft));
      console.log('Draft saved');
    } catch (e) {
      console.error('Failed to save draft:', e);
    }
  },

  /**
   * Load draft from localStorage
   */
  loadDraft() {
    try {
      const draft = localStorage.getItem('proposal_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        console.log('Draft found from:', parsed.timestamp);
        // Could populate form here if needed
      }
    } catch (e) {
      console.error('Failed to load draft:', e);
    }
  },

  /**
   * Clear saved draft
   */
  clearDraft() {
    localStorage.removeItem('proposal_draft');
  },

  /**
   * Export form data to JSON file
   */
  exportToJSON() {
    const formData = this.collectFormData();
    const config = PROPOSAL_CONFIG.export;

    const exportData = {
      ...(config.includeMetadata ? {
        metadata: {
          version: '1.0',
          generated: new Date().toISOString(),
          template: document.getElementById('templateSelect')?.value || 'default'
        }
      } : {}),
      ...formData
    };

    const json = JSON.stringify(exportData, null, config.prettyPrint ? 2 : 0);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    const filename = config.filename +
      (config.includeTimestamp ? `-${new Date().toISOString().split('T')[0]}` : '') +
      '.json';

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Get current form completion percentage
   */
  getCompletionPercentage() {
    const formData = this.collectFormData();
    const requiredSections = PROPOSAL_CONFIG.sections.filter(s => s.required);

    let completed = 0;
    requiredSections.forEach(section => {
      if (formData[section.id] && Object.keys(formData[section.id]).length > 0) {
        completed++;
      }
    });

    return Math.round((completed / requiredSections.length) * 100);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormHandler;
}
