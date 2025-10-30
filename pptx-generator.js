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
   * Create slide structure for presentation (9 professional slides)
   */
  createSlideStructure(data, config) {
    const slides = [];

    // 1. Title Slide
    slides.push(this.createTitleSlide(data));

    // 2. Executive Summary / Business Context
    slides.push(this.createExecutiveSummarySlide(data));

    // 3. Success Criteria (North Star)
    slides.push(this.createSuccessCriteriaSlide(data.project));

    // 4. Target Audience
    slides.push(this.createAudienceOverviewSlide(data.audience));

    // 5. Constraints & Operational Availability
    slides.push(this.createConstraintsSlide(data.constraints));

    // 6. Learning Strategy
    slides.push(this.createLearningStrategySlide(data.strategy));

    // 7. Curriculum Overview
    slides.push(this.createCurriculumOverviewSlide(data.curriculum));

    // 8. Project Plan & Timeline
    slides.push(this.createProjectPlanSlide(data));

    // 9. Thank You / Next Steps
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
   * Create success criteria slide (North Star)
   */
  createSuccessCriteriaSlide(project) {
    const content = [];

    if (project?.success_criteria?.north_star) {
      content.push(`🎯 North Star: ${project.success_criteria.north_star}`);
    }

    if (project?.success_criteria?.additional) {
      content.push('');
      content.push('Additional Success Criteria:');
      content.push(project.success_criteria.additional);
    }

    return {
      type: 'content',
      title: 'Success Criteria',
      content: content.length > 0 ? content : ['Success criteria to be defined'],
      notes: 'Focus on the North Star metric - the primary measure of success for this initiative.'
    };
  },

  /**
   * Create audience overview slide
   */
  createAudienceOverviewSlide(audience) {
    const content = {
      'Total Learners': audience?.size || 'TBD',
      'Number of Segments': audience?.segments?.length || 0
    };

    if (audience?.segments?.length > 0) {
      const segment = audience.segments[0];
      content['Example Segment'] = segment.label || 'N/A';
      content['Work Location'] = segment.work_location || 'N/A';
      content['Tech Comfort'] = segment.tech_comfort || 'N/A';
      content['Number of Learners'] = segment.count || 'N/A';
    }

    return {
      type: 'content',
      title: 'Target Audience',
      content,
      notes: 'Highlight key audience characteristics that will inform learning strategy and modality selection.'
    };
  },

  /**
   * Create constraints slide
   */
  createConstraintsSlide(constraints) {
    const content = {
      'Budget': `${constraints?.budget?.currency || '?'} ${constraints?.budget?.amount || '0'}`,
      'Timeline': constraints?.timebox || 'TBD'
    };

    // Operational availability
    if (constraints?.operational_availability) {
      const oa = constraints.operational_availability;
      content['Max Time/Session'] = oa.max_time_away_per_session_hours ? `${oa.max_time_away_per_session_hours} hours` : 'Not specified';
      content['Max Time/Week'] = oa.max_total_time_away_per_week_hours ? `${oa.max_total_time_away_per_week_hours} hours` : 'Not specified';
    }

    // Technology
    if (constraints?.technology?.stack) {
      content['Technology'] = constraints.technology.stack.substring(0, 100);
    }

    // Compliance
    if (constraints?.compliance?.requirements) {
      content['Compliance'] = constraints.compliance.requirements.substring(0, 100);
    }

    return {
      type: 'content',
      title: 'Constraints & Operational Availability',
      content,
      notes: 'Key constraints that will shape the learning solution design.'
    };
  },

  /**
   * Create curriculum overview slide
   */
  createCurriculumOverviewSlide(curriculum) {
    const content = [];

    if (curriculum?.learning_objectives) {
      content.push('Learning Objectives:');
      curriculum.learning_objectives.slice(0, 4).forEach(obj => {
        content.push(`• ${obj}`);
      });
    }

    if (curriculum?.modules) {
      content.push('');
      content.push(`Number of Modules: ${curriculum.modules.length}`);
      const totalDuration = curriculum.modules.reduce((sum, m) => sum + (m.duration_minutes || 0), 0);
      content.push(`Total Duration: ${totalDuration} minutes`);
    }

    return {
      type: 'content',
      title: 'Curriculum Overview',
      content: content.length > 0 ? content : ['Curriculum to be developed'],
      notes: 'High-level overview of learning objectives and curriculum structure.'
    };
  },

  /**
   * Create project plan slide
   */
  createProjectPlanSlide(data) {
    const content = [];

    if (data.project?.timeline?.target_launch_date) {
      content.push(`Target Launch: ${data.project.timeline.target_launch_date}`);
    }

    if (data.project?.timeline?.milestones) {
      content.push('');
      content.push('Key Milestones:');
      data.project.timeline.milestones.slice(0, 4).forEach(m => {
        content.push(`• ${m}`);
      });
    }

    if (data.plan?.work_breakdown) {
      content.push('');
      content.push(`Total Tasks: ${data.plan.work_breakdown.length}`);
    }

    if (data.plan?.risks) {
      content.push('');
      content.push(`Identified Risks: ${data.plan.risks.length}`);
    }

    return {
      type: 'content',
      title: 'Project Plan & Timeline',
      content: content.length > 0 ? content : ['Project plan to be finalized'],
      notes: 'Overview of project timeline, milestones, and risk management approach.'
    };
  },

  /**
   * Create executive summary slide using business context
   */
  createExecutiveSummarySlide(data) {
    const content = [];

    // Current process/state
    if (data.business?.current_process) {
      content.push('Current State:');
      content.push(data.business.current_process.substring(0, 150) + '...');
      content.push('');
    }

    // Key challenges
    if (data.business?.challenges) {
      content.push('Key Challenges:');
      content.push(data.business.challenges.substring(0, 150) + '...');
      content.push('');
    }

    // Strategic goals
    if (data.business?.strategic_goals) {
      content.push('Strategic Goals:');
      content.push(data.business.strategic_goals.substring(0, 150) + '...');
    }

    // Fallback if no business context
    if (content.length === 0) {
      content.push(data.project?.problem_statement || 'Business context to be defined');
      content.push('');
      content.push(`Target audience: ${data.audience?.size || 'TBD'} participants`);
      content.push(`Budget: ${data.constraints?.budget?.currency || ''} ${data.constraints?.budget?.amount || '0'}`);
    }

    return {
      type: 'content',
      title: 'Business Context & Executive Summary',
      content,
      notes: 'Provide overview of current state, challenges, and how this learning initiative aligns with strategic goals.'
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
   * Create closing slide with next steps
   */
  createClosingSlide(data) {
    return {
      type: 'closing',
      title: 'Thank You',
      subtitle: 'Next Steps & Questions',
      contact: data.project?.primary_contact || 'Contact information',
      notes: 'Review proposal, finalize timeline, confirm resources, schedule kickoff, and open for Q&A'
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
   * Create actual PPTX using PptxGenJS
   */
  async createPresentationBlob(slides, config) {
    // Get branding settings
    const branding = BrandingManager.getSettings();

    // Create new presentation
    const pptx = new PptxGenJS();

    // Set presentation properties
    pptx.layout = config.layout === 'LAYOUT_4x3' ? 'LAYOUT_4x3' : 'LAYOUT_16x9';
    pptx.author = 'Learning Proposal Generator';
    pptx.company = 'L&D Team';
    pptx.revision = '1';
    pptx.subject = 'Learning Proposal';
    pptx.title = slides[0]?.title || 'Learning Proposal';

    // Define color scheme from branding
    const colors = {
      primary: branding.colors.primary,
      accent: branding.colors.accent,
      dark: '#1e293b',
      light: '#f8fafc',
      text: '#334155'
    };

    // Process each slide
    for (const slideData of slides) {
      const slide = pptx.addSlide();

      // Add logo if available
      if (branding.logo) {
        try {
          slide.addImage({
            data: branding.logo,
            x: 0.5,
            y: 0.3,
            w: 1.5,
            h: 0.5
          });
        } catch (e) {
          console.warn('Could not add logo to slide:', e);
        }
      }

      // Add watermark if enabled
      if (branding.watermark.enabled && branding.watermark.text) {
        slide.addText(branding.watermark.text, {
          x: 1,
          y: 3,
          w: 8,
          h: 1,
          fontSize: 72,
          color: '999999',
          rotate: 315,
          transparency: Math.round((1 - branding.watermark.opacity) * 100),
          align: 'center',
          valign: 'middle'
        });
      }

      // Add footer
      if (branding.footer) {
        slide.addText(branding.footer, {
          x: 0.5,
          y: 7,
          w: 9,
          h: 0.3,
          fontSize: 10,
          color: '666666',
          align: 'center'
        });
      }

      // Render slide based on type
      if (slideData.type === 'title') {
        this.renderTitleSlide(slide, slideData, colors);
      } else if (slideData.type === 'closing') {
        this.renderClosingSlide(slide, slideData, colors);
      } else {
        this.renderContentSlide(slide, slideData, colors);
      }

      // Add speaker notes if enabled
      if (config.includeNotes && slideData.notes) {
        slide.addNotes(slideData.notes);
      }

      // Add slide numbers if enabled
      if (config.slideNumbers) {
        slide.slideNumber = {
          x: 9,
          y: 7,
          fontFace: 'Arial',
          fontSize: 10,
          color: '666666'
        };
      }
    }

    // Generate and return blob
    return await pptx.write({ outputType: 'blob' });
  },

  /**
   * Render title slide
   */
  renderTitleSlide(slide, data, colors) {
    // Title background
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 2.5,
      w: 10,
      h: 3,
      fill: { color: colors.primary }
    });

    // Main title
    slide.addText(data.title, {
      x: 0.5,
      y: 2.8,
      w: 9,
      h: 1,
      fontSize: 44,
      bold: true,
      color: 'FFFFFF',
      align: 'center'
    });

    // Subtitle
    slide.addText(data.subtitle, {
      x: 0.5,
      y: 3.8,
      w: 9,
      h: 0.5,
      fontSize: 24,
      color: 'FFFFFF',
      align: 'center'
    });

    // Date and presenter
    slide.addText(`${data.date}\n${data.presenter}`, {
      x: 0.5,
      y: 4.5,
      w: 9,
      h: 0.8,
      fontSize: 14,
      color: 'FFFFFF',
      align: 'center'
    });
  },

  /**
   * Render content slide
   */
  renderContentSlide(slide, data, colors) {
    // Header bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 1,
      fill: { color: colors.primary }
    });

    // Slide title
    slide.addText(data.title, {
      x: 0.5,
      y: 0.2,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: 'FFFFFF'
    });

    // Content area
    let yPos = 1.5;

    if (Array.isArray(data.content)) {
      // Bullet list
      const bullets = data.content.map(item => ({
        text: item,
        options: { bullet: true, fontSize: 18, color: colors.text }
      }));

      slide.addText(bullets, {
        x: 0.8,
        y: yPos,
        w: 8.4,
        h: 5,
        fontSize: 18,
        color: colors.text
      });

    } else if (typeof data.content === 'object') {
      // Key-value pairs
      for (const [key, value] of Object.entries(data.content)) {
        slide.addText(key, {
          x: 0.8,
          y: yPos,
          w: 8.4,
          h: 0.4,
          fontSize: 20,
          bold: true,
          color: colors.primary
        });

        yPos += 0.4;

        const valueText = Array.isArray(value) ? value.join(', ') : String(value);
        slide.addText(valueText, {
          x: 0.8,
          y: yPos,
          w: 8.4,
          h: 0.5,
          fontSize: 16,
          color: colors.text
        });

        yPos += 0.7;

        if (yPos > 6.5) break; // Prevent overflow
      }
    }
  },

  /**
   * Render closing slide
   */
  renderClosingSlide(slide, data, colors) {
    // Background
    slide.background = { color: colors.primary };

    // Thank you text
    slide.addText(data.title, {
      x: 0.5,
      y: 2.5,
      w: 9,
      h: 1.5,
      fontSize: 56,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    });

    // Subtitle
    slide.addText(data.subtitle, {
      x: 0.5,
      y: 4,
      w: 9,
      h: 0.8,
      fontSize: 28,
      color: 'FFFFFF',
      align: 'center'
    });

    // Contact info
    if (data.contact) {
      slide.addText(data.contact, {
        x: 0.5,
        y: 5.5,
        w: 9,
        h: 0.5,
        fontSize: 18,
        color: 'FFFFFF',
        align: 'center'
      });
    }
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
