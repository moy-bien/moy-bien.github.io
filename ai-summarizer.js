/**
 * AI Summarizer - Handles AI-generated content with approval workflow
 * Manages synthesis, review, and approval of AI-generated summaries
 */

const AISummarizer = {
  apiEndpoint: null, // Configure this to point to your AI service
  currentDraft: null,
  approvalStatus: 'pending_synthesis',

  /**
   * Initialize AI Summarizer
   */
  init() {
    console.log('AI Summarizer initialized');
    if (!PROPOSAL_CONFIG.aiSummary.enabled) {
      console.log('AI Summaries are disabled in config');
    }
  },

  /**
   * Generate business context summary from project inputs
   * @param {Object} inputs - Background and problem statement
   * @returns {Promise<Object>} Generated summary with metadata
   */
  async generateBusinessContextSummary(inputs) {
    const { background, problem_statement } = inputs;

    if (!background && !problem_statement) {
      throw new Error('At least background or problem statement is required for AI summary generation');
    }

    // Mock AI generation (replace with actual AI API call)
    const summary = await this.mockAIGeneration(background, problem_statement);

    this.currentDraft = {
      inputs,
      draft: summary.text,
      status: 'awaiting_review',
      confidence: summary.confidence,
      generated_at: new Date().toISOString()
    };

    return this.currentDraft;
  },

  /**
   * Mock AI generation (placeholder for actual AI service)
   */
  async mockAIGeneration(background, problemStatement) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const summary = this.createStructuredSummary(background, problemStatement);
    const confidence = this.calculateConfidence(background, problemStatement);

    return {
      text: summary,
      confidence: confidence,
      model: 'mock-ai-v1',
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Create structured summary from inputs
   */
  createStructuredSummary(background, problemStatement) {
    const parts = [];

    parts.push('BUSINESS CONTEXT SUMMARY\n');
    parts.push('='.repeat(50) + '\n\n');

    if (background) {
      parts.push('Background:\n');
      parts.push(this.extractKeyPoints(background, 'Background'));
      parts.push('\n');
    }

    if (problemStatement) {
      parts.push('Problem Statement:\n');
      parts.push(this.extractKeyPoints(problemStatement, 'Problem'));
      parts.push('\n');
    }

    parts.push('Key Insights:\n');
    parts.push(this.generateInsights(background, problemStatement));
    parts.push('\n');

    parts.push('Recommended Focus Areas:\n');
    parts.push(this.generateRecommendations(background, problemStatement));
    parts.push('\n');

    parts.push('Risks & Considerations:\n');
    parts.push(this.identifyRisks(background, problemStatement));
    parts.push('\n');

    parts.push('Next Steps:\n');
    parts.push('- Validate assumptions with stakeholders\n');
    parts.push('- Confirm success metrics and KPIs\n');
    parts.push('- Review resource availability\n');
    parts.push('- Align on timeline expectations\n');

    parts.push('\n---\n');
    parts.push('Note: This is an AI-generated summary. Please review and approve before use in proposal deck.\n');

    return parts.join('');
  },

  /**
   * Extract key points from text
   */
  extractKeyPoints(text, label) {
    if (!text) return '';

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const keyPoints = sentences.slice(0, 3).map((s, i) => `  ${i + 1}. ${s.trim()}`);

    return keyPoints.join('\n') + '\n';
  },

  /**
   * Generate insights from inputs
   */
  generateInsights(background, problemStatement) {
    const insights = [];

    if (background && background.length > 100) {
      insights.push('  • Complex organizational context requires phased approach');
    }

    if (problemStatement) {
      if (problemStatement.toLowerCase().includes('skill')) {
        insights.push('  • Skills gap identified as primary challenge');
      }
      if (problemStatement.toLowerCase().includes('process')) {
        insights.push('  • Process improvement opportunity detected');
      }
      if (problemStatement.toLowerCase().includes('performance')) {
        insights.push('  • Performance enhancement is key objective');
      }
    }

    if (insights.length === 0) {
      insights.push('  • Further analysis needed to identify specific insights');
    }

    return insights.join('\n') + '\n';
  },

  /**
   * Generate recommendations based on inputs
   */
  generateRecommendations(background, problemStatement) {
    return [
      '  • Conduct stakeholder alignment session',
      '  • Define clear success metrics',
      '  • Assess current state capabilities',
      '  • Develop phased implementation plan'
    ].join('\n') + '\n';
  },

  /**
   * Identify potential risks
   */
  identifyRisks(background, problemStatement) {
    const risks = [
      '  • Stakeholder alignment may require additional time',
      '  • Resource availability needs verification',
      '  • Timeline constraints should be validated'
    ];

    if (problemStatement && problemStatement.length < 50) {
      risks.push('  • Problem statement lacks detail - may need refinement');
    }

    return risks.join('\n') + '\n';
  },

  /**
   * Calculate confidence score based on input quality
   */
  calculateConfidence(background, problemStatement) {
    let score = 0.5; // Base score

    if (background && background.length > 100) score += 0.2;
    if (problemStatement && problemStatement.length > 50) score += 0.2;
    if (background && problemStatement) score += 0.1;

    return Math.min(score, 1.0);
  },

  /**
   * Update approval status
   * @param {string} status - New status (pending_synthesis, awaiting_review, changes_requested, approved)
   * @param {string} approver - Name of approver
   * @param {string} notes - Approval notes or feedback
   */
  updateApprovalStatus(status, approver = null, notes = null) {
    if (!PROPOSAL_CONFIG.aiSummary.approvalStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    this.approvalStatus = status;

    if (this.currentDraft) {
      this.currentDraft.status = status;
      if (approver) this.currentDraft.approver = approver;
      if (notes) this.currentDraft.notes = notes;
      this.currentDraft.updated_at = new Date().toISOString();
    }

    return this.currentDraft;
  },

  /**
   * Check if content is approved for use
   */
  isApproved() {
    return this.approvalStatus === 'approved';
  },

  /**
   * Request changes to AI summary
   */
  requestChanges(feedback) {
    this.updateApprovalStatus('changes_requested', null, feedback);
    return {
      status: 'changes_requested',
      feedback: feedback,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Approve AI summary for use in proposal
   */
  approve(approverName, notes = null) {
    if (!approverName) {
      throw new Error('Approver name is required');
    }

    this.updateApprovalStatus('approved', approverName, notes);

    return {
      status: 'approved',
      approver: approverName,
      approved_at: new Date().toISOString()
    };
  },

  /**
   * Get current draft with metadata
   */
  getCurrentDraft() {
    return this.currentDraft;
  },

  /**
   * Clear current draft
   */
  clearDraft() {
    this.currentDraft = null;
    this.approvalStatus = 'pending_synthesis';
  },

  /**
   * Export AI summary for inclusion in proposal
   */
  exportForProposal() {
    if (!this.isApproved() && PROPOSAL_CONFIG.aiSummary.requireApproval) {
      throw new Error('AI summary must be approved before export');
    }

    return {
      content: this.currentDraft?.draft || '',
      metadata: {
        generated_at: this.currentDraft?.generated_at,
        approved_by: this.currentDraft?.approver,
        approved_at: this.currentDraft?.updated_at,
        confidence: this.currentDraft?.confidence,
        status: this.currentDraft?.status
      }
    };
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AISummarizer;
}
