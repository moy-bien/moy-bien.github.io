/**
 * Draft Manager - Handles saving, loading, and managing proposal drafts
 * Supports two-phase workflow: Intake Meeting → Consultant Planning
 */

const DraftManager = {
  currentDraftId: null,
  autoSaveTimer: null,

  /**
   * Initialize draft manager
   */
  init() {
    console.log('Draft Manager initialized');
    this.attachEventListeners();
    this.checkForDraftParameter();
  },

  /**
   * Attach event listeners to draft buttons
   */
  attachEventListeners() {
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const loadDraftBtn = document.getElementById('loadDraftBtn');
    const emailDraftBtn = document.getElementById('emailDraftBtn');

    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => this.saveDraft());
    }

    if (loadDraftBtn) {
      loadDraftBtn.addEventListener('click', () => this.showDraftsList());
    }

    if (emailDraftBtn) {
      emailDraftBtn.addEventListener('click', () => this.emailDraftLink());
    }

    // Auto-save on form changes (if enabled)
    if (PROPOSAL_CONFIG.features.enableAutoSave) {
      this.setupAutoSave();
    }
  },

  /**
   * Save current form data as draft
   */
  saveDraft() {
    const formData = FormHandler.collectFormData();

    // Determine phase based on what's completed
    const phase = this.determinePhase(formData);

    const draftId = this.currentDraftId || this.generateDraftId();
    this.currentDraftId = draftId;

    const draft = {
      id: draftId,
      data: formData,
      timestamp: new Date().toISOString(),
      phase: phase,
      version: 1
    };

    // Save to localStorage
    try {
      localStorage.setItem(`draft_${draftId}`, JSON.stringify(draft));

      // Update drafts list
      this.updateDraftsList(draft);

      // Show success message with draft link
      const draftUrl = `${window.location.origin}${window.location.pathname}?draft=${draftId}`;
      this.showStatus(
        `Draft saved successfully!<br>
        <strong>Draft ID:</strong> ${draftId}<br>
        <strong>Phase:</strong> ${phase}<br>
        <a href="${draftUrl}" target="_blank">Open draft link</a>`,
        'success'
      );

      console.log('Draft saved:', draftId);
      return draftId;
    } catch (error) {
      console.error('Failed to save draft:', error);
      this.showStatus('Failed to save draft. Storage may be full.', 'error');
      return null;
    }
  },

  /**
   * Determine current phase based on completed sections
   */
  determinePhase(formData) {
    const hasPhase1 = formData.project && formData.client && formData.audience && formData.business && formData.constraints;
    const hasPhase2 = formData.strategy && formData.curriculum;

    if (hasPhase2) return 'consultant-planning-complete';
    if (hasPhase1) return 'intake-complete';
    return 'in-progress';
  },

  /**
   * Load draft by ID
   */
  loadDraft(draftId) {
    const draftKey = `draft_${draftId}`;
    const draftData = localStorage.getItem(draftKey);

    if (!draftData) {
      this.showStatus('Draft not found', 'error');
      return false;
    }

    try {
      const draft = JSON.parse(draftData);
      this.currentDraftId = draftId;

      // Populate form with draft data
      this.populateForm(draft.data);

      // Update phase indicator
      this.updatePhaseIndicator(draft.phase);

      this.showStatus(
        `Draft loaded from ${new Date(draft.timestamp).toLocaleString()}<br>
        <strong>Phase:</strong> ${draft.phase}`,
        'success'
      );

      console.log('Draft loaded:', draftId);
      return true;
    } catch (error) {
      console.error('Failed to load draft:', error);
      this.showStatus('Failed to load draft. Data may be corrupted.', 'error');
      return false;
    }
  },

  /**
   * Populate form fields with draft data
   */
  populateForm(data) {
    // This is a simplified version - you'll need to expand this
    // to handle all field types (text, number, checkbox, arrays, etc.)

    Object.keys(data).forEach(section => {
      const sectionData = data[section];
      if (typeof sectionData === 'object' && sectionData !== null) {
        this.populateSection(section, sectionData);
      }
    });
  },

  /**
   * Populate a specific section (recursive for nested objects)
   */
  populateSection(prefix, data) {
    Object.keys(data).forEach(key => {
      const value = data[key];
      const fieldName = `${prefix}.${key}`;

      if (Array.isArray(value)) {
        // Handle arrays (checkboxes, dynamic lists, etc.)
        this.populateArray(fieldName, value);
      } else if (typeof value === 'object' && value !== null) {
        // Recurse for nested objects
        this.populateSection(fieldName, value);
      } else {
        // Handle simple values
        this.populateField(fieldName, value);
      }
    });
  },

  /**
   * Populate a single form field
   */
  populateField(name, value) {
    const elements = document.querySelectorAll(`[name="${name}"]`);

    elements.forEach(element => {
      if (element.type === 'checkbox') {
        element.checked = value === true || value === element.value;
      } else if (element.type === 'radio') {
        element.checked = value === element.value;
      } else {
        element.value = value;
      }
    });
  },

  /**
   * Populate array fields (simplified - needs expansion)
   */
  populateArray(fieldName, values) {
    // For checkboxes with same name
    const checkboxes = document.querySelectorAll(`[name="${fieldName}[]"]`);
    checkboxes.forEach(cb => {
      cb.checked = values.includes(cb.value);
    });

    // Note: For dynamic arrays (like stakeholders, KPIs), you'll need
    // to call the appropriate addXXX() functions to create the elements
    // first, then populate them. This is left as TODO for full implementation.
  },

  /**
   * Generate unique draft ID
   */
  generateDraftId() {
    return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Update drafts list in localStorage
   */
  updateDraftsList(draft) {
    const draftsList = JSON.parse(localStorage.getItem('allDrafts') || '[]');

    // Check if draft already exists
    const existingIndex = draftsList.findIndex(d => d.id === draft.id);

    const draftSummary = {
      id: draft.id,
      projectTitle: draft.data.project?.title || 'Untitled',
      clientOrg: draft.data.client?.organization || 'Unknown',
      timestamp: draft.timestamp,
      phase: draft.phase
    };

    if (existingIndex >= 0) {
      draftsList[existingIndex] = draftSummary;
    } else {
      draftsList.push(draftSummary);
    }

    localStorage.setItem('allDrafts', JSON.stringify(draftsList));
  },

  /**
   * Show list of all saved drafts
   */
  showDraftsList() {
    const draftsList = JSON.parse(localStorage.getItem('allDrafts') || '[]');

    if (draftsList.length === 0) {
      alert('No saved drafts found');
      return;
    }

    // Create modal
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'drafts-modal';

    let html = `
      <button class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</button>
      <h3>Select a Draft</h3>
      <ul>
    `;

    draftsList.forEach(draft => {
      html += `
        <li>
          <strong>${draft.projectTitle} - ${draft.clientOrg}</strong><br>
          <small>Saved: ${new Date(draft.timestamp).toLocaleString()}</small><br>
          <small>Phase: ${draft.phase}</small><br>
          <button class="btn-secondary" onclick="DraftManager.loadDraft('${draft.id}'); this.closest('.modal-overlay').remove();">Load</button>
          <button class="btn-remove" onclick="DraftManager.deleteDraft('${draft.id}'); this.closest('.modal-overlay').remove(); DraftManager.showDraftsList();">Delete</button>
        </li>
      `;
    });

    html += '</ul>';
    modal.innerHTML = html;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  },

  /**
   * Delete a draft
   */
  deleteDraft(draftId) {
    if (!confirm('Are you sure you want to delete this draft?')) {
      return false;
    }

    // Remove from storage
    localStorage.removeItem(`draft_${draftId}`);

    // Remove from drafts list
    const draftsList = JSON.parse(localStorage.getItem('allDrafts') || '[]');
    const updatedList = draftsList.filter(d => d.id !== draftId);
    localStorage.setItem('allDrafts', JSON.stringify(updatedList));

    this.showStatus('Draft deleted', 'info');
    console.log('Draft deleted:', draftId);
    return true;
  },

  /**
   * Email draft link
   */
  emailDraftLink() {
    if (!this.currentDraftId) {
      // Save first if no current draft
      const draftId = this.saveDraft();
      if (!draftId) return;
    }

    const draftUrl = `${window.location.origin}${window.location.pathname}?draft=${this.currentDraftId}`;
    const subject = encodeURIComponent('Learning Proposal Draft');
    const body = encodeURIComponent(
      `Continue working on your learning proposal draft:\n\n${draftUrl}\n\nDraft ID: ${this.currentDraftId}`
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  },

  /**
   * Check URL for draft parameter on page load
   */
  checkForDraftParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const draftId = urlParams.get('draft');

    if (draftId) {
      this.loadDraft(draftId);
    }
  },

  /**
   * Update phase indicator visual
   */
  updatePhaseIndicator(phase) {
    const phases = document.querySelectorAll('.phase');

    phases.forEach(p => p.classList.remove('active'));

    if (phase.includes('complete')) {
      // Both phases complete
      phases.forEach(p => p.classList.add('active'));
    } else if (phase === 'intake-complete') {
      // Phase 1 complete
      phases[0]?.classList.add('active');
    } else {
      // In progress
      phases[0]?.classList.add('active');
    }
  },

  /**
   * Setup auto-save functionality
   */
  setupAutoSave() {
    const formInputs = document.querySelectorAll('input, textarea, select');

    formInputs.forEach(input => {
      input.addEventListener('change', () => {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
          this.saveDraft();
          this.showStatus('Auto-saved', 'info');
        }, 30000); // 30 seconds
      });
    });
  },

  /**
   * Show status message
   */
  showStatus(message, type) {
    const statusDiv = document.getElementById('draftStatus');
    if (!statusDiv) return;

    statusDiv.innerHTML = message;
    statusDiv.className = `draft-status ${type}`;

    // Auto-hide info messages after 5 seconds
    if (type === 'info') {
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 5000);
    }
  },

  /**
   * Export Phase 1 data as JSON
   */
  exportPhase1Data() {
    const formData = FormHandler.collectFormData();

    const phase1Data = {
      project: formData.project,
      client: formData.client,
      audience: formData.audience,
      business: formData.business,
      constraints: formData.constraints
    };

    const json = JSON.stringify(phase1Data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'intake-summary.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Save version of current draft
   */
  saveVersion(note = '') {
    if (!this.currentDraftId) {
      this.showStatus('Please save a draft first', 'error');
      return;
    }

    const versions = JSON.parse(localStorage.getItem(`versions_${this.currentDraftId}`) || '[]');

    const version = {
      data: FormHandler.collectFormData(),
      timestamp: new Date().toISOString(),
      note: note,
      versionNumber: versions.length + 1
    };

    versions.push(version);
    localStorage.setItem(`versions_${this.currentDraftId}`, JSON.stringify(versions));

    this.showStatus(`Version ${version.versionNumber} saved`, 'success');
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DraftManager;
}
