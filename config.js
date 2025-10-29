// Learning Proposal Intake Configuration
const PROPOSAL_CONFIG = {
  // Form sections configuration
  sections: [
    { id: 'project', title: 'Project', required: true, order: 1 },
    { id: 'client', title: 'Client', required: true, order: 2 },
    { id: 'audience', title: 'Audience', required: true, order: 3 },
    { id: 'business', title: 'Business', required: true, order: 4 },
    { id: 'constraints', title: 'Constraints', required: true, order: 5 },
    { id: 'strategy', title: 'Strategy', required: true, order: 6 },
    { id: 'curriculum', title: 'Curriculum', required: false, order: 7 },
    { id: 'plan', title: 'Plan', required: false, order: 8 },
    { id: 'legal', title: 'Legal', required: false, order: 9 },
    { id: 'ai_summaries', title: 'AI Summaries', required: false, order: 10 }
  ],

  // Output format options
  outputFormat: {
    default: 'json',
    available: ['json', 'pptx', 'pdf', 'docx']
  },

  // Template configurations
  templates: {
    standard: {
      name: 'Standard Learning Proposal',
      description: 'General purpose L&D proposal template',
      file: 'template-standard.json',
      sections: ['project', 'client', 'audience', 'business', 'constraints', 'strategy', 'curriculum', 'plan']
    },
    enterprise: {
      name: 'Enterprise Learning Proposal',
      description: 'Comprehensive template for enterprise clients',
      file: 'template-enterprise.json',
      sections: ['project', 'client', 'audience', 'business', 'constraints', 'strategy', 'curriculum', 'plan', 'legal', 'ai_summaries']
    },
    quick: {
      name: 'Quick Assessment',
      description: 'Simplified template for rapid intake',
      file: 'template-quick.json',
      sections: ['project', 'audience', 'business', 'constraints']
    }
  },

  // Validation rules
  validation: {
    enforceRequired: true,
    showWarnings: true,
    allowPartialSave: true
  },

  // AI Summary settings
  aiSummary: {
    enabled: true,
    requireApproval: true,
    approvalStatuses: ['pending_synthesis', 'awaiting_review', 'changes_requested', 'approved'],
    sections: ['business_context']
  },

  // Export settings
  export: {
    filename: 'learning-proposal',
    includeMetadata: true,
    prettyPrint: true,
    includeTimestamp: true
  },

  // Operational availability defaults
  operationalAvailability: {
    defaultSessionMinutes: 60,
    defaultWeeklyMinutes: 240,
    defaultBreakPer4Hours: 15,
    defaultMealBreak: 30
  },

  // Feature flags
  features: {
    enableAISummaries: true,
    enableTemplates: true,
    enableAutoSave: false,
    enableCollaboration: false,
    enableVersioning: false
  },

  // UI preferences
  ui: {
    showProgressBar: true,
    enableTabNavigation: true,
    showRequiredIndicators: true,
    compactMode: false,
    theme: 'default' // 'default', 'light', 'dark'
  }
};

// Template loader helper
const TemplateManager = {
  currentTemplate: null,

  loadTemplate(templateName) {
    if (!PROPOSAL_CONFIG.templates[templateName]) {
      console.error(`Template "${templateName}" not found`);
      return null;
    }
    this.currentTemplate = PROPOSAL_CONFIG.templates[templateName];
    return this.currentTemplate;
  },

  getActiveSections() {
    if (!this.currentTemplate) return PROPOSAL_CONFIG.sections;
    return PROPOSAL_CONFIG.sections.filter(section =>
      this.currentTemplate.sections.includes(section.id)
    );
  },

  applyTemplate(templateName) {
    const template = this.loadTemplate(templateName);
    if (!template) return false;

    // Update visible sections
    const activeSectionIds = template.sections;
    document.querySelectorAll('.tab-button').forEach(button => {
      const sectionId = button.dataset.tab;
      if (activeSectionIds.includes(sectionId)) {
        button.style.display = '';
      } else {
        button.style.display = 'none';
      }
    });

    console.log(`Applied template: ${template.name}`);
    return true;
  }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PROPOSAL_CONFIG, TemplateManager };
}
