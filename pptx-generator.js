/**
 * PPTX Generator - Generates PowerPoint output from learning proposal data
 * Creates formatted presentation decks ready for client delivery
 *
 * IMPLEMENTATION NOTE: This is a stub/placeholder for PPTX generation
 * For production use, integrate with libraries like:
 * - PptxGenJS (https://gitbrent.github.io/PptxGenJS/)
 * - officegen (https://github.com/Ziv-Barber/officegen)
 */

const PPTXGenerator = {
  /**
   * Generate a learning proposal PowerPoint from intake form data
   * @param {Object} intakeData - Form data from needs assessment
   * @param {string} outputFormat - 'pptx' or 'pdf'
   * @returns {Blob} Generated file ready for download
   */
  async generateProposal(intakeData, outputFormat = 'pptx') {
    console.log('Generating PowerPoint proposal...', intakeData);

    const config = {
      layout: 'LAYOUT_16x9', // or 'LAYOUT_4x3'
      theme: 'corporate', // corporate, modern, minimal
      includeNotes: true,
      slideNumbers: true,
      watermark: null
    };

    // Check if AI summary is approved (if required)
    if (intakeData.ai_summaries?.business_context) {
      const status = intakeData.ai_summaries.business_context.status;
      if (PROPOSAL_CONFIG.aiSummary.requireApproval && status !== 'approved') {
        config.watermark = 'DRAFT - PENDING APPROVAL';
      }
    }

    try {
      const slides = this.createSlideStructure(intakeData, config);
      const blob = await this.createPresentationBlob(slides, config);

      console.log('PowerPoint generated successfully');
      return blob;

    } catch (error) {
      console.error('PPTX generation failed:', error);
      throw new Error(`PPTX generation failed: ${error.message}`);
    }
  },

  /**
   * Create slide structure for presentation
   */
  createSlideStructure(data, config) {
    const slides = [];

    // Title Slide
    slides.push(this.createTitleSlide(data));

    // Agenda Slide
    slides.push(this.createAgendaSlide(data));

    // Executive Summary (using AI summary if approved)
    slides.push(this.createExecutiveSummarySlide(data));

    // Project Overview
    slides.push(this.createProjectOverviewSlide(data.project));

    // Client & Stakeholders
    slides.push(this.createClientSlide(data.client));

    // Audience Analysis
    if (data.audience?.segments) {
      slides.push(...this.createAudienceSlides(data.audience));
    }

    // Business Case
    slides.push(this.createBusinessCaseSlide(data.business));

    // Learning Objectives (if curriculum exists)
    if (data.curriculum?.learning_objectives) {
      slides.push(this.createLearningObjectivesSlide(data.curriculum));
    }

    // Learning Strategy
    slides.push(this.createLearningStrategySlide(data.strategy));

    // Curriculum Modules (if exists)
    if (data.curriculum?.modules) {
      slides.push(...this.createModuleSlides(data.curriculum.modules));
    }

    // Project Plan Timeline
    if (data.plan?.work_breakdown) {
      slides.push(this.createTimelineSlide(data.plan));
    }

    // Budget & Resources
    slides.push(this.createBudgetSlide(data.constraints));

    // Risks & Mitigation
    if (data.plan?.risks) {
      slides.push(this.createRisksSlide(data.plan.risks));
    }

    // Next Steps
    slides.push(this.createNextStepsSlide(data));

    // Thank You / Contact
    slides.push(this.createClosingSlide(data));

    return slides;
  },

  /**
   * Create title slide
   */
  createTitleSlide(data) {
    return {
      type: 'title',
      title: data.project?.title || 'Learning Proposal',
      subtitle: `Prepared for ${data.client?.organization || 'Client'}`,
      date: new Date().toLocaleDateString(),
      presenter: data.project?.primary_contact || 'Learning & Development Team',
      notes: 'Opening slide - introduce yourself and set the agenda'
    };
  },

  /**
   * Create agenda slide
   */
  createAgendaSlide(data) {
    const agendaItems = [
      'Business Context & Objectives',
      'Audience Analysis',
      'Learning Strategy',
      data.curriculum ? 'Curriculum Overview' : null,
      'Project Plan & Timeline',
      'Budget & Resources',
      'Next Steps'
    ].filter(Boolean);

    return {
      type: 'content',
      title: 'Agenda',
      content: agendaItems,
      notes: 'Overview of presentation structure - 30-45 minutes'
    };
  },

  /**
   * Create executive summary slide using AI summary
   */
  createExecutiveSummarySlide(data) {
    let summary = [];

    if (data.ai_summaries?.business_context?.status === 'approved') {
      // Use approved AI summary
      const aiText = data.ai_summaries.business_context.draft;
      // Extract key points from AI summary
      summary = this.extractKeyPoints(aiText, 5);
    } else {
      // Fallback to manual summary
      summary = [
        data.project?.problem_statement || 'Problem statement to be defined',
        `Target audience: ${data.audience?.size || 'TBD'} participants`,
        `Budget: ${data.constraints?.budget?.currency} ${data.constraints?.budget?.amount || '0'}`,
        `Timeline: ${data.constraints?.timebox || 'TBD'}`
      ];
    }

    return {
      type: 'content',
      title: 'Executive Summary',
      content: summary,
      notes: this.generateSpeakerNotes('executive-summary', data)
    };
  },

  /**
   * Extract key points from text
   */
  extractKeyPoints(text, maxPoints = 5) {
    const sentences = text.split(/[.!?\n]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, maxPoints).map(s => s.trim());
  },

  /**
   * Create project overview slide
   */
  createProjectOverviewSlide(project) {
    return {
      type: 'content',
      title: 'Project Overview',
      content: {
        'Project Title': project?.title || 'TBD',
        'Sponsor': project?.sponsor || 'TBD',
        'Primary Contact': project?.primary_contact || 'TBD',
        'Target Launch': project?.timeline?.target_launch_date || 'TBD'
      },
      notes: this.generateSpeakerNotes('project-overview', project)
    };
  },

  /**
   * Create client slide
   */
  createClientSlide(client) {
    const stakeholders = client?.stakeholders?.map(s =>
      `${s.name} - ${s.role}`
    ) || [];

    return {
      type: 'content',
      title: 'Client & Stakeholders',
      content: {
        'Organization': client?.organization || 'TBD',
        'Industry': client?.industry || 'TBD',
        'Key Stakeholders': stakeholders
      },
      notes: this.generateSpeakerNotes('client', client)
    };
  },

  /**
   * Create audience analysis slides
   */
  createAudienceSlides(audience) {
    const slides = [];

    // Overview slide
    slides.push({
      type: 'content',
      title: 'Audience Overview',
      content: {
        'Total Audience Size': audience.size || 'TBD',
        'Number of Segments': audience.segments?.length || 0,
        'Segments': audience.segments?.map(s => s.label) || []
      },
      notes: this.generateSpeakerNotes('audience-overview', audience)
    });

    // Individual segment slides
    audience.segments?.forEach((segment, index) => {
      slides.push({
        type: 'content',
        title: `Audience Segment: ${segment.label}`,
        content: {
          'Persona': segment.persona || 'Mixed',
          'Experience Level': segment.experience_level || 'Mixed',
          'Locations': segment.geos?.join(', ') || 'TBD',
          'Languages': segment.languages?.join(', ') || 'TBD',
          'Tech Environment': segment.tech_env?.join(', ') || 'TBD'
        },
        notes: this.generateSpeakerNotes('audience-segment', segment)
      });
    });

    return slides;
  },

  /**
   * Create business case slide
   */
  createBusinessCaseSlide(business) {
    return {
      type: 'content',
      title: 'Business Case',
      content: {
        'Goals': business?.goals || [],
        'Key Metrics': business?.kpis?.map(k =>
          `${k.name}: ${k.baseline} → ${k.target || '?'} ${k.unit || ''}`
        ) || []
      },
      notes: this.generateSpeakerNotes('business-case', business)
    };
  },

  /**
   * Create learning objectives slide
   */
  createLearningObjectivesSlide(curriculum) {
    return {
      type: 'content',
      title: 'Learning Objectives',
      content: this.formatObjectives(curriculum.learning_objectives),
      notes: this.generateSpeakerNotes('learning-objectives', curriculum)
    };
  },

  /**
   * Format objectives as bullet points
   */
  formatObjectives(objectives) {
    return objectives?.map(obj => `• ${obj}`) || [];
  },

  /**
   * Create learning strategy slide
   */
  createLearningStrategySlide(strategy) {
    return {
      type: 'content',
      title: 'Learning Strategy',
      content: {
        'Delivery Methods': strategy?.delivery || [],
        'Engagement Strategies': strategy?.engagement || [],
        'Analytics Standards': strategy?.analytics?.standards || []
      },
      notes: this.generateSpeakerNotes('learning-strategy', strategy)
    };
  },

  /**
   * Create module slides
   */
  createModuleSlides(modules) {
    return modules?.map((module, index) => ({
      type: 'content',
      title: `Module ${index + 1}: ${module.title}`,
      content: {
        'Duration': `${module.duration_minutes || '?'} minutes`,
        'Outcomes': module.outcomes || [],
        'Content Types': module.content_types || [],
        'Assessments': module.assessments || []
      },
      notes: this.generateSpeakerNotes('module', module)
    })) || [];
  },

  /**
   * Create timeline slide
   */
  createTimelineSlide(plan) {
    const timeline = plan?.work_breakdown?.map(item =>
      `${item.task}: ${item.start} to ${item.end} (${item.owner})`
    ) || [];

    return {
      type: 'content',
      title: 'Project Timeline',
      content: timeline,
      notes: this.generateSpeakerNotes('timeline', plan)
    };
  },

  /**
   * Create budget slide
   */
  createBudgetSlide(constraints) {
    return {
      type: 'content',
      title: 'Budget & Resources',
      content: {
        'Total Budget': `${constraints?.budget?.currency || '?'} ${constraints?.budget?.amount || '0'}`,
        'Timeline': constraints?.timebox || 'TBD',
        'Available Resources': constraints?.resources || [],
        'Key Policies': constraints?.policies || []
      },
      notes: this.generateSpeakerNotes('budget', constraints)
    };
  },

  /**
   * Create risks slide
   */
  createRisksSlide(risks) {
    const riskItems = risks?.map(r =>
      `${r.risk} (${r.likelihood}/${r.impact}) - ${r.mitigation}`
    ) || [];

    return {
      type: 'content',
      title: 'Risks & Mitigation',
      content: riskItems,
      notes: 'Discuss risk management approach and contingency plans'
    };
  },

  /**
   * Create next steps slide
   */
  createNextStepsSlide(data) {
    return {
      type: 'content',
      title: 'Next Steps',
      content: [
        'Review and approve this proposal',
        'Finalize project timeline',
        'Confirm resource allocation',
        'Schedule kickoff meeting',
        'Begin content development'
      ],
      notes: 'Action items and timeline for moving forward'
    };
  },

  /**
   * Create closing slide
   */
  createClosingSlide(data) {
    return {
      type: 'closing',
      title: 'Thank You',
      subtitle: 'Questions & Discussion',
      contact: data.project?.primary_contact || '',
      notes: 'Open for questions and discussion'
    };
  },

  /**
   * Generate speaker notes for slides
   */
  generateSpeakerNotes(section, data) {
    const notes = {
      'executive-summary': 'Provide overview of the business context and objectives. Keep it high-level.',
      'project-overview': 'Introduce the project sponsor and primary stakeholders. Set expectations for timeline.',
      'client': 'Highlight key stakeholders and their roles in the project.',
      'audience-overview': 'Emphasize the diversity or similarity of the audience. Note any special considerations.',
      'audience-segment': 'Discuss specific needs and constraints for this segment.',
      'business-case': 'Connect learning objectives to business outcomes. Emphasize ROI.',
      'learning-objectives': 'Ensure objectives are specific, measurable, and Bloom-aligned.',
      'learning-strategy': 'Justify modality choices based on audience and operational constraints.',
      'module': 'Provide detail on content and assessment approach.',
      'timeline': 'Highlight critical path and dependencies.',
      'budget': 'Justify budget allocation. Address resource constraints.'
    };

    return notes[section] || 'Additional context and talking points for this slide.';
  },

  /**
   * Create mock PPTX blob (placeholder)
   */
  async createPresentationBlob(slides, config) {
    const mockPPTX = `Mock PowerPoint Presentation
Generated: ${new Date().toISOString()}
Slides: ${slides.length}
Layout: ${config.layout}

This is a placeholder for PPTX generation.
To enable actual PowerPoint generation, integrate PptxGenJS library.

Slide titles:
${slides.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}
`;

    return new Blob([mockPPTX], {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    });
  },

  /**
   * Download PPTX file
   */
  downloadPPTX(blob, filename = 'learning-proposal.pptx') {
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
  module.exports = PPTXGenerator;
}
