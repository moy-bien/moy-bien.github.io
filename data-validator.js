/**
 * Data Validator - Validates form inputs against schema requirements
 * Provides comprehensive validation with detailed error messages
 */

const DataValidator = {
  /**
   * Validate entire form data object
   * @param {Object} formData - Form data to validate
   * @returns {Array} Array of error messages
   */
  validate(formData) {
    const errors = [];

    // Validate required sections
    this.validateProject(formData.project, errors);
    this.validateClient(formData.client, errors);
    this.validateAudience(formData.audience, errors);
    this.validateBusiness(formData.business, errors);
    this.validateConstraints(formData.constraints, errors);
    this.validateStrategy(formData.strategy, errors);

    // Validate optional sections if present
    if (formData.curriculum) {
      this.validateCurriculum(formData.curriculum, errors);
    }

    if (formData.plan) {
      this.validatePlan(formData.plan, errors);
    }

    if (formData.ai_summaries) {
      this.validateAISummaries(formData.ai_summaries, errors);
    }

    return errors;
  },

  /**
   * Validate project section
   */
  validateProject(project, errors) {
    if (!project) {
      errors.push('Project information is required');
      return;
    }

    if (!project.title || project.title.length < 3) {
      errors.push('Project title is required (minimum 3 characters)');
    }

    if (!project.sponsor) {
      errors.push('Project sponsor is required');
    }

    if (!project.primary_contact) {
      errors.push('Primary contact is required');
    }
  },

  /**
   * Validate client section
   */
  validateClient(client, errors) {
    if (!client) {
      errors.push('Client information is required');
      return;
    }

    if (!client.organization) {
      errors.push('Client organization is required');
    }

    if (!client.industry) {
      errors.push('Client industry is required');
    }

    if (!client.stakeholders || client.stakeholders.length === 0) {
      errors.push('At least one stakeholder is required');
    } else {
      client.stakeholders.forEach((stakeholder, index) => {
        if (!stakeholder.name) {
          errors.push(`Stakeholder ${index + 1}: Name is required`);
        }
        if (!stakeholder.role) {
          errors.push(`Stakeholder ${index + 1}: Role is required`);
        }
        if (!stakeholder.responsibilities) {
          errors.push(`Stakeholder ${index + 1}: Responsibilities are required`);
        }
      });
    }
  },

  /**
   * Validate audience section
   */
  validateAudience(audience, errors) {
    if (!audience) {
      errors.push('Audience information is required');
      return;
    }

    if (!audience.size || audience.size < 1) {
      errors.push('Audience size is required (minimum 1)');
    }

    if (!audience.segments || audience.segments.length === 0) {
      errors.push('At least one audience segment is required');
    } else {
      audience.segments.forEach((segment, index) => {
        if (!segment.label) {
          errors.push(`Segment ${index + 1}: Label is required`);
        }
        if (!segment.persona) {
          errors.push(`Segment ${index + 1}: Persona is required`);
        }
        if (!segment.geos || segment.geos.length === 0) {
          errors.push(`Segment ${index + 1}: At least one geographic location is required`);
        }
      });
    }
  },

  /**
   * Validate business section
   */
  validateBusiness(business, errors) {
    if (!business) {
      errors.push('Business information is required');
      return;
    }

    if (!business.goals || business.goals.length === 0) {
      errors.push('At least one business goal is required');
    }

    if (!business.kpis || business.kpis.length === 0) {
      errors.push('At least one KPI is required');
    } else {
      business.kpis.forEach((kpi, index) => {
        if (!kpi.name) {
          errors.push(`KPI ${index + 1}: Name is required`);
        }
        if (kpi.baseline === undefined || kpi.baseline === null) {
          errors.push(`KPI ${index + 1}: Baseline value is required`);
        }
      });
    }
  },

  /**
   * Validate constraints section
   */
  validateConstraints(constraints, errors) {
    if (!constraints) {
      errors.push('Constraints information is required');
      return;
    }

    // Validate budget
    if (!constraints.budget) {
      errors.push('Budget information is required');
    } else {
      if (!constraints.budget.currency || constraints.budget.currency.length !== 3) {
        errors.push('Budget currency must be a 3-letter code (e.g., USD, EUR, GBP)');
      }
      if (constraints.budget.amount === undefined || constraints.budget.amount < 0) {
        errors.push('Budget amount must be 0 or greater');
      }
    }

    if (!constraints.timebox) {
      errors.push('Timebox is required');
    }

    if (!constraints.resources || constraints.resources.length === 0) {
      errors.push('At least one resource constraint is required');
    }

    if (!constraints.policies || constraints.policies.length === 0) {
      errors.push('At least one policy constraint is required');
    }
  },

  /**
   * Validate strategy section
   */
  validateStrategy(strategy, errors) {
    if (!strategy) {
      errors.push('Learning strategy is required');
      return;
    }

    if (!strategy.delivery || strategy.delivery.length === 0) {
      errors.push('At least one delivery method is required');
    }

    if (!strategy.engagement || strategy.engagement.length === 0) {
      errors.push('At least one engagement strategy is required');
    }
  },

  /**
   * Validate curriculum section
   */
  validateCurriculum(curriculum, errors) {
    if (!curriculum.learning_objectives || curriculum.learning_objectives.length === 0) {
      errors.push('At least one learning objective is required for curriculum');
    }

    if (!curriculum.modules || curriculum.modules.length === 0) {
      errors.push('At least one module is required for curriculum');
    } else {
      curriculum.modules.forEach((module, index) => {
        if (!module.title) {
          errors.push(`Module ${index + 1}: Title is required`);
        }
        if (!module.outcomes || module.outcomes.length === 0) {
          errors.push(`Module ${index + 1}: At least one learning outcome is required`);
        }
      });
    }
  },

  /**
   * Validate plan section
   */
  validatePlan(plan, errors) {
    if (!plan.work_breakdown || plan.work_breakdown.length === 0) {
      errors.push('At least one work breakdown item is required for project plan');
    } else {
      plan.work_breakdown.forEach((item, index) => {
        if (!item.task) {
          errors.push(`Work item ${index + 1}: Task description is required`);
        }
        if (!item.owner) {
          errors.push(`Work item ${index + 1}: Owner is required`);
        }
        if (!item.start) {
          errors.push(`Work item ${index + 1}: Start date is required`);
        }
        if (!item.end) {
          errors.push(`Work item ${index + 1}: End date is required`);
        }
      });
    }

    if (!plan.risks || plan.risks.length === 0) {
      errors.push('At least one risk item is required for project plan');
    } else {
      plan.risks.forEach((risk, index) => {
        if (!risk.risk) {
          errors.push(`Risk ${index + 1}: Risk description is required`);
        }
        if (!risk.likelihood) {
          errors.push(`Risk ${index + 1}: Likelihood is required`);
        }
        if (!risk.impact) {
          errors.push(`Risk ${index + 1}: Impact is required`);
        }
        if (!risk.mitigation) {
          errors.push(`Risk ${index + 1}: Mitigation strategy is required`);
        }
      });
    }
  },

  /**
   * Validate AI summaries section
   */
  validateAISummaries(aiSummaries, errors) {
    if (!aiSummaries.business_context) {
      return; // Optional section
    }

    const context = aiSummaries.business_context;

    if (!context.status) {
      errors.push('AI Summary: Status is required');
    }

    if (PROPOSAL_CONFIG.aiSummary.requireApproval && context.status !== 'approved') {
      errors.push('AI Summary: Content must be approved before submission (current status: ' + (context.status || 'not set') + ')');
    }

    if (!context.inputs || (!context.inputs.background && !context.inputs.problem_statement)) {
      errors.push('AI Summary: At least background or problem statement input is required');
    }
  },

  /**
   * Validate specific field types
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  validateDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  },

  validateCurrency(code) {
    return typeof code === 'string' && code.length === 3 && /^[A-Z]{3}$/.test(code);
  },

  /**
   * Custom validation for intake form
   * Based on user's example
   */
  validateIntakeForm(formData) {
    const errors = [];

    if (!formData.audience) {
      errors.push('Target audience is required');
    }

    if (!formData.constraints?.budget || formData.constraints.budget.amount < 0) {
      errors.push('Valid budget is required');
    }

    return errors;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataValidator;
}
