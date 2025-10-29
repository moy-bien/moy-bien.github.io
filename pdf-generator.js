/**
 * PDF Generator - Generates PDF output from learning proposal data
 * Creates formatted PDF documents ready for client delivery
 *
 * IMPLEMENTATION NOTE: This is a stub/placeholder for PDF generation
 * For production use, integrate with libraries like:
 * - jsPDF (https://github.com/parallax/jsPDF)
 * - pdfmake (http://pdfmake.org)
 * - PDFKit (server-side option)
 */

const PDFGenerator = {
  /**
   * Generate a learning proposal PDF from intake form data
   * @param {Object} intakeData - Form data from needs assessment
   * @param {Object} options - PDF generation options
   * @returns {Blob} Generated PDF file ready for download
   */
  async generateProposal(intakeData, options = {}) {
    console.log('Generating PDF proposal...', intakeData);

    const defaults = {
      format: 'A4',
      orientation: 'portrait',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      includeTableOfContents: true,
      includeCoverPage: true,
      includeExecutiveSummary: true,
      watermark: null
    };

    const config = { ...defaults, ...options };

    // Check if AI summary is approved (if required)
    if (intakeData.ai_summaries?.business_context) {
      const status = intakeData.ai_summaries.business_context.status;
      if (PROPOSAL_CONFIG.aiSummary.requireApproval && status !== 'approved') {
        config.watermark = 'DRAFT - PENDING APPROVAL';
      }
    }

    try {
      // Placeholder for actual PDF generation
      // In production, replace with jsPDF or pdfmake implementation
      const pdfContent = await this.createPDFStructure(intakeData, config);

      // Mock PDF blob creation
      const blob = this.createMockPDFBlob(pdfContent);

      console.log('PDF generated successfully');
      return blob;

    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  },

  /**
   * Create PDF structure with sections
   */
  async createPDFStructure(data, config) {
    const sections = [];

    if (config.includeCoverPage) {
      sections.push(this.createCoverPage(data));
    }

    if (config.includeTableOfContents) {
      sections.push(this.createTableOfContents(data));
    }

    if (config.includeExecutiveSummary) {
      sections.push(this.createExecutiveSummary(data));
    }

    sections.push(this.createProjectOverview(data.project));
    sections.push(this.createClientSection(data.client));
    sections.push(this.createAudienceAnalysis(data.audience));
    sections.push(this.createBusinessCase(data.business));
    sections.push(this.createConstraintsSection(data.constraints));
    sections.push(this.createLearningStrategy(data.strategy));

    if (data.curriculum) {
      sections.push(this.createCurriculumDesign(data.curriculum));
    }

    if (data.plan) {
      sections.push(this.createProjectPlan(data.plan));
    }

    return sections;
  },

  /**
   * Create cover page
   */
  createCoverPage(data) {
    return {
      type: 'cover',
      title: data.project?.title || 'Learning Proposal',
      subtitle: `Prepared for ${data.client?.organization || 'Client'}`,
      date: new Date().toLocaleDateString(),
      author: 'Learning & Development Team'
    };
  },

  /**
   * Create table of contents
   */
  createTableOfContents(data) {
    return {
      type: 'toc',
      sections: [
        'Executive Summary',
        'Project Overview',
        'Client Information',
        'Audience Analysis',
        'Business Case',
        'Constraints & Requirements',
        'Learning Strategy',
        data.curriculum ? 'Curriculum Design' : null,
        data.plan ? 'Project Plan' : null
      ].filter(Boolean)
    };
  },

  /**
   * Create executive summary
   */
  createExecutiveSummary(data) {
    // Use AI summary if approved, otherwise create basic summary
    let summary = '';

    if (data.ai_summaries?.business_context?.status === 'approved') {
      summary = data.ai_summaries.business_context.draft;
    } else {
      summary = this.generateBasicSummary(data);
    }

    return {
      type: 'section',
      title: 'Executive Summary',
      content: summary
    };
  },

  /**
   * Generate basic summary if AI summary not available
   */
  generateBasicSummary(data) {
    const parts = [];

    if (data.project?.background) {
      parts.push(`Background: ${data.project.background}`);
    }

    if (data.project?.problem_statement) {
      parts.push(`Problem: ${data.project.problem_statement}`);
    }

    if (data.business?.goals && data.business.goals.length > 0) {
      parts.push(`Goals: ${data.business.goals.join(', ')}`);
    }

    return parts.join('\n\n');
  },

  /**
   * Create project overview section
   */
  createProjectOverview(project) {
    return {
      type: 'section',
      title: 'Project Overview',
      content: {
        title: project?.title,
        sponsor: project?.sponsor,
        contact: project?.primary_contact,
        timeline: project?.timeline
      }
    };
  },

  /**
   * Create client section
   */
  createClientSection(client) {
    return {
      type: 'section',
      title: 'Client Information',
      content: client
    };
  },

  /**
   * Create audience analysis section
   */
  createAudienceAnalysis(audience) {
    return {
      type: 'section',
      title: 'Audience Analysis',
      content: audience
    };
  },

  /**
   * Create business case section
   */
  createBusinessCase(business) {
    return {
      type: 'section',
      title: 'Business Case',
      content: business
    };
  },

  /**
   * Create constraints section
   */
  createConstraintsSection(constraints) {
    return {
      type: 'section',
      title: 'Constraints & Requirements',
      content: constraints
    };
  },

  /**
   * Create learning strategy section
   */
  createLearningStrategy(strategy) {
    return {
      type: 'section',
      title: 'Learning Strategy',
      content: strategy
    };
  },

  /**
   * Create curriculum design section
   */
  createCurriculumDesign(curriculum) {
    return {
      type: 'section',
      title: 'Curriculum Design',
      content: curriculum
    };
  },

  /**
   * Create project plan section
   */
  createProjectPlan(plan) {
    return {
      type: 'section',
      title: 'Project Plan',
      content: plan
    };
  },

  /**
   * Create mock PDF blob (placeholder)
   */
  createMockPDFBlob(content) {
    const mockPDF = `%PDF-1.4
Learning Proposal - Mock PDF
Generated: ${new Date().toISOString()}

This is a placeholder PDF.
To enable actual PDF generation, integrate jsPDF or pdfmake library.

Content sections: ${content.length}
`;

    return new Blob([mockPDF], { type: 'application/pdf' });
  },

  /**
   * Download PDF file
   */
  downloadPDF(blob, filename = 'learning-proposal.pdf') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PDFGenerator;
}
