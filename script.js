// Tab navigation
let currentTab = 'project';
const tabs = ['project', 'client', 'audience', 'business', 'constraints', 'strategy', 'curriculum', 'plan', 'legal', 'ai_summaries'];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Form submission
    document.getElementById('proposalForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const data = getFormData();
        console.log('Form submitted:', data);
        alert('Form data logged to console. Check the browser console to see the JSON output.');
    });

    // Auto-populate AI Summaries inputs when project fields change
    document.getElementById('background').addEventListener('input', function() {
        document.getElementById('aiInputBackground').value = this.value;
    });

    document.getElementById('problemStatement').addEventListener('input', function() {
        document.getElementById('aiInputProblem').value = this.value;
    });

    updateProgress();
});

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active from all buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    currentTab = tabName;
    updateProgress();
}

function nextTab() {
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < tabs.length - 1) {
        switchTab(tabs[currentIndex + 1]);
    }
}

function previousTab() {
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex > 0) {
        switchTab(tabs[currentIndex - 1]);
    }
}

function updateProgress() {
    const currentIndex = tabs.indexOf(currentTab);
    const progress = ((currentIndex + 1) / tabs.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

// Dynamic array item functions
function removeArrayItem(element) {
    const parent = element.parentElement || element;
    parent.remove();
}

function addMilestone() {
    const container = document.getElementById('milestones');
    const div = document.createElement('div');
    div.className = 'array-item';
    div.innerHTML = `
        <input type="text" name="project.timeline.milestones[]" placeholder="Milestone description">
        <button type="button" class="btn-remove" onclick="removeArrayItem(this)">Remove</button>
    `;
    container.appendChild(div);
}

function addStakeholder() {
    const container = document.getElementById('stakeholders');
    const div = document.createElement('div');
    div.className = 'stakeholder-item card';
    div.innerHTML = `
        <div class="form-group required">
            <label>Name</label>
            <input type="text" name="client.stakeholders[].name" required>
        </div>
        <div class="form-group required">
            <label>Role</label>
            <input type="text" name="client.stakeholders[].role" required>
        </div>
        <div class="form-group required">
            <label>Responsibilities</label>
            <textarea name="client.stakeholders[].responsibilities" rows="3" required></textarea>
        </div>
        <div class="form-group">
            <label>Influence Level</label>
            <select name="client.stakeholders[].influence">
                <option value="">Select...</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select>
        </div>
        <button type="button" class="btn-remove" onclick="removeArrayItem(this.parentElement)">Remove Stakeholder</button>
    `;
    container.appendChild(div);
}

function addSegment() {
    const container = document.getElementById('segments');
    const div = document.createElement('div');
    div.className = 'segment-item card';
    div.innerHTML = `
        <div class="form-group required">
            <label>Label</label>
            <input type="text" name="audience.segments[].label" required>
        </div>
        <div class="form-group required">
            <label>Persona</label>
            <select name="audience.segments[].persona" required>
                <option value="">Select...</option>
                <option value="IC">IC (Individual Contributor)</option>
                <option value="Manager">Manager</option>
                <option value="Leader">Leader</option>
                <option value="Mixed">Mixed</option>
            </select>
        </div>
        <div class="form-group">
            <label>Experience Level</label>
            <select name="audience.segments[].experience_level">
                <option value="">Select...</option>
                <option value="novice">Novice</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="mixed">Mixed</option>
            </select>
        </div>
        <div class="form-group required">
            <label>Geographic Locations</label>
            <input type="text" name="audience.segments[].geos" placeholder="e.g., North America, EMEA, APAC" data-array="true" required>
            <span class="hint">Comma-separated values</span>
        </div>
        <div class="form-group">
            <label>Languages</label>
            <input type="text" name="audience.segments[].languages" placeholder="e.g., English, Spanish, French" data-array="true">
            <span class="hint">Comma-separated values</span>
        </div>
        <div class="form-group">
            <label>Access Needs</label>
            <input type="text" name="audience.segments[].access_needs" placeholder="e.g., Screen reader support, Closed captions" data-array="true">
            <span class="hint">Comma-separated values</span>
        </div>
        <div class="form-group">
            <label>Technology Environment</label>
            <input type="text" name="audience.segments[].tech_env" placeholder="e.g., Windows 10, Chrome, Mobile devices" data-array="true">
            <span class="hint">Devices/browsers/apps - Comma-separated values</span>
        </div>

        <h4>Operational Availability Override (Optional)</h4>
        <p class="hint" style="margin-bottom: 1rem;">Override global constraints for this specific segment if their availability differs.</p>
        <div class="form-row">
            <div class="form-group">
                <label>Max Time Away per Session (min)</label>
                <input type="number" name="audience.segments[].operational_availability_override.max_time_away_per_session_minutes" min="0" placeholder="Override">
            </div>
            <div class="form-group">
                <label>Max Total Time per Week (min)</label>
                <input type="number" name="audience.segments[].operational_availability_override.max_total_time_away_per_week_minutes" min="0" placeholder="Override">
            </div>
        </div>
        <div class="form-group">
            <label>Blackout Windows (Segment-specific)</label>
            <input type="text" name="audience.segments[].operational_availability_override.scheduling_blackout_windows" placeholder="e.g., Daily 11:30-14:00 local" data-array="true">
            <span class="hint">Comma-separated values</span>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Min Break per 4hrs (min)</label>
                <input type="number" name="audience.segments[].operational_availability_override.break_requirements.min_break_minutes_per_4hrs" min="0" placeholder="Override">
            </div>
            <div class="form-group">
                <label>Meal Break (min)</label>
                <input type="number" name="audience.segments[].operational_availability_override.break_requirements.meal_minutes" min="0" placeholder="Override">
            </div>
        </div>

        <button type="button" class="btn-remove" onclick="removeArrayItem(this.parentElement)">Remove Segment</button>
    `;
    container.appendChild(div);
}

function addGoal() {
    const container = document.getElementById('goals');
    const div = document.createElement('div');
    div.className = 'array-item';
    div.innerHTML = `
        <input type="text" name="business.goals[]" placeholder="Business goal">
        <button type="button" class="btn-remove" onclick="removeArrayItem(this)">Remove</button>
    `;
    container.appendChild(div);
}

function addKPI() {
    const container = document.getElementById('kpis');
    const div = document.createElement('div');
    div.className = 'kpi-item card';
    div.innerHTML = `
        <div class="form-group required">
            <label>KPI Name</label>
            <input type="text" name="business.kpis[].name" required>
        </div>
        <div class="form-group required">
            <label>Baseline</label>
            <input type="number" name="business.kpis[].baseline" step="0.01" required>
        </div>
        <div class="form-group">
            <label>Target</label>
            <input type="number" name="business.kpis[].target" step="0.01">
        </div>
        <div class="form-group">
            <label>Unit</label>
            <input type="text" name="business.kpis[].unit" placeholder="e.g., %, hours, $">
        </div>
        <button type="button" class="btn-remove" onclick="removeArrayItem(this.parentElement)">Remove KPI</button>
    `;
    container.appendChild(div);
}

function addRootCause() {
    const container = document.getElementById('rootCauses');
    const div = document.createElement('div');
    div.className = 'array-item';
    div.innerHTML = `
        <input type="text" name="business.root_causes[]" placeholder="Root cause">
        <button type="button" class="btn-remove" onclick="removeArrayItem(this)">Remove</button>
    `;
    container.appendChild(div);
}

function addNonTrainingFactor() {
    const container = document.getElementById('nonTrainingFactors');
    const div = document.createElement('div');
    div.className = 'array-item';
    div.innerHTML = `
        <input type="text" name="business.non_training_factors[]" placeholder="Non-training factor">
        <button type="button" class="btn-remove" onclick="removeArrayItem(this)">Remove</button>
    `;
    container.appendChild(div);
}

function addResource() {
    const container = document.getElementById('resources');
    const div = document.createElement('div');
    div.className = 'array-item';
    div.innerHTML = `
        <input type="text" name="constraints.resources[]" placeholder="Available SMEs, tools, content">
        <button type="button" class="btn-remove" onclick="removeArrayItem(this)">Remove</button>
    `;
    container.appendChild(div);
}

function addPolicy() {
    const container = document.getElementById('policies');
    const div = document.createElement('div');
    div.className = 'array-item';
    div.innerHTML = `
        <input type="text" name="constraints.policies[]" placeholder="Compliance, accessibility, data">
        <button type="button" class="btn-remove" onclick="removeArrayItem(this)">Remove</button>
    `;
    container.appendChild(div);
}

function addEngagement() {
    const container = document.getElementById('engagement');
    const div = document.createElement('div');
    div.className = 'array-item';
    div.innerHTML = `
        <input type="text" name="strategy.engagement[]" placeholder="e.g., Simulations, scenarios, gamification">
        <button type="button" class="btn-remove" onclick="removeArrayItem(this)">Remove</button>
    `;
    container.appendChild(div);
}

function addDashboard() {
    const container = document.getElementById('dashboards');
    const div = document.createElement('div');
    div.className = 'array-item';
    div.innerHTML = `
        <input type="text" name="strategy.analytics.dashboards[]" placeholder="Dashboard description">
        <button type="button" class="btn-remove" onclick="removeArrayItem(this)">Remove</button>
    `;
    container.appendChild(div);
}

function addObjective() {
    const container = document.getElementById('learningObjectives');
    const div = document.createElement('div');
    div.className = 'array-item';
    div.innerHTML = `
        <input type="text" name="curriculum.learning_objectives[]" placeholder="Learning objective">
        <button type="button" class="btn-remove" onclick="removeArrayItem(this)">Remove</button>
    `;
    container.appendChild(div);
}

function addModule() {
    const container = document.getElementById('modules');
    const div = document.createElement('div');
    div.className = 'module-item card';
    div.innerHTML = `
        <div class="form-group required">
            <label>Module Title</label>
            <input type="text" name="curriculum.modules[].title" required>
        </div>
        <div class="form-group">
            <label>Duration (minutes)</label>
            <input type="number" name="curriculum.modules[].duration_minutes" min="5">
        </div>
        <div class="form-group required">
            <label>Learning Outcomes</label>
            <input type="text" name="curriculum.modules[].outcomes" placeholder="Comma-separated outcomes" data-array="true" required>
        </div>
        <div class="form-group">
            <label>Content Types</label>
            <input type="text" name="curriculum.modules[].content_types" placeholder="e.g., Video, Reading, Interactive" data-array="true">
        </div>
        <div class="form-group">
            <label>Assessments</label>
            <input type="text" name="curriculum.modules[].assessments" placeholder="e.g., Quiz, Project, Reflection" data-array="true">
        </div>
        <button type="button" class="btn-remove" onclick="removeArrayItem(this.parentElement)">Remove Module</button>
    `;
    container.appendChild(div);
}

function addWorkItem() {
    const container = document.getElementById('workBreakdown');
    const div = document.createElement('div');
    div.className = 'work-item card';
    div.innerHTML = `
        <div class="form-group required">
            <label>Task</label>
            <input type="text" name="plan.work_breakdown[].task" required>
        </div>
        <div class="form-group required">
            <label>Owner</label>
            <input type="text" name="plan.work_breakdown[].owner" required>
        </div>
        <div class="form-row">
            <div class="form-group required">
                <label>Start Date</label>
                <input type="date" name="plan.work_breakdown[].start" required>
            </div>
            <div class="form-group required">
                <label>End Date</label>
                <input type="date" name="plan.work_breakdown[].end" required>
            </div>
        </div>
        <div class="form-group">
            <label>Dependencies</label>
            <input type="text" name="plan.work_breakdown[].dependencies" placeholder="Comma-separated task names" data-array="true">
        </div>
        <button type="button" class="btn-remove" onclick="removeArrayItem(this.parentElement)">Remove Task</button>
    `;
    container.appendChild(div);
}

function addRACI() {
    const container = document.getElementById('racis');
    const div = document.createElement('div');
    div.className = 'raci-item card';
    div.innerHTML = `
        <div class="form-group required">
            <label>Deliverable</label>
            <input type="text" name="plan.racis[].deliverable" required>
        </div>
        <div class="form-group required">
            <label>Responsible</label>
            <input type="text" name="plan.racis[].R" required>
        </div>
        <div class="form-group required">
            <label>Accountable</label>
            <input type="text" name="plan.racis[].A" required>
        </div>
        <div class="form-group required">
            <label>Consulted</label>
            <input type="text" name="plan.racis[].C" placeholder="Comma-separated names" data-array="true" required>
        </div>
        <div class="form-group required">
            <label>Informed</label>
            <input type="text" name="plan.racis[].I" placeholder="Comma-separated names" data-array="true" required>
        </div>
        <button type="button" class="btn-remove" onclick="removeArrayItem(this.parentElement)">Remove RACI</button>
    `;
    container.appendChild(div);
}

function addRisk() {
    const container = document.getElementById('risks');
    const div = document.createElement('div');
    div.className = 'risk-item card';
    div.innerHTML = `
        <div class="form-group required">
            <label>Risk Description</label>
            <textarea name="plan.risks[].risk" rows="2" required></textarea>
        </div>
        <div class="form-row">
            <div class="form-group required">
                <label>Likelihood</label>
                <select name="plan.risks[].likelihood" required>
                    <option value="">Select...</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
            <div class="form-group required">
                <label>Impact</label>
                <select name="plan.risks[].impact" required>
                    <option value="">Select...</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
        </div>
        <div class="form-group required">
            <label>Mitigation Strategy</label>
            <textarea name="plan.risks[].mitigation" rows="2" required></textarea>
        </div>
        <button type="button" class="btn-remove" onclick="removeArrayItem(this.parentElement)">Remove Risk</button>
    `;
    container.appendChild(div);
}

function addBlackoutWindow() {
    const container = document.getElementById('blackoutWindows');
    const div = document.createElement('div');
    div.className = 'array-item';
    div.innerHTML = `
        <input type="text" name="constraints.operational_availability.scheduling_blackout_windows[]" placeholder="e.g., Daily 11:30-14:00 local">
        <button type="button" class="btn-remove" onclick="removeArrayItem(this)">Remove</button>
    `;
    container.appendChild(div);
}

// Form data collection
function getFormData() {
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
                    setNestedValue(formData, path, value, true);
                }
            } else {
                // Single checkbox
                value = element.checked;
                setNestedValue(formData, path, value, false);
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
            setNestedValue(formData, path, value, false, true);
        } else if (isArray) {
            setNestedValue(formData, path, value, true);
        } else {
            setNestedValue(formData, path, value, false);
        }
    }

    // Clean up empty objects and arrays
    cleanEmptyValues(formData);

    return formData;
}

function setNestedValue(obj, path, value, isArrayItem = false, replaceArray = false) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) {
            // Determine if next level should be array or object
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
}

function cleanEmptyValues(obj) {
    for (let key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
            cleanEmptyValues(obj[key]);
            if (Array.isArray(obj[key]) && obj[key].length === 0) {
                delete obj[key];
            } else if (!Array.isArray(obj[key]) && Object.keys(obj[key]).length === 0) {
                delete obj[key];
            }
        } else if (obj[key] === undefined || obj[key] === null || obj[key] === '') {
            delete obj[key];
        }
    }
}

function validateForm() {
    const data = FormHandler.collectFormData();
    const errors = DataValidator.validate(data);
    const results = document.getElementById('validationResults');

    // Display results
    if (errors.length === 0) {
        results.innerHTML = '<div class="success">Validation passed! All required fields are complete.</div>';
        results.style.display = 'block';
    } else {
        results.innerHTML = '<div class="error"><h3>Validation Errors:</h3><ul>' +
            errors.map(e => `<li>${e}</li>`).join('') +
            '</ul></div>';
        results.style.display = 'block';
    }

    // Scroll to results
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function downloadJSON() {
    FormHandler.exportToJSON();
}

// Generate PDF
async function generatePDF() {
    try {
        const data = FormHandler.collectFormData();
        const errors = DataValidator.validate(data);

        if (errors.length > 0) {
            alert('Please fix validation errors before generating PDF');
            validateForm();
            return;
        }

        const blob = await PDFGenerator.generateProposal(data);
        PDFGenerator.downloadPDF(blob);
        alert('PDF generation complete! (Note: This is a mock PDF. Integrate jsPDF for production use.)');
    } catch (error) {
        alert('PDF generation failed: ' + error.message);
    }
}

// Generate PowerPoint
async function generatePPTX() {
    try {
        const data = FormHandler.collectFormData();
        const errors = DataValidator.validate(data);

        if (errors.length > 0) {
            alert('Please fix validation errors before generating PowerPoint');
            validateForm();
            return;
        }

        const blob = await PPTXGenerator.generateProposal(data);
        PPTXGenerator.downloadPPTX(blob);
        alert('PowerPoint generation complete! (Note: This is a mock PPTX. Integrate PptxGenJS for production use.)');
    } catch (error) {
        alert('PowerPoint generation failed: ' + error.message);
    }
}

// Template management
function applyTemplate(templateName) {
    if (!templateName) {
        // Show all sections
        document.querySelectorAll('.tab-button').forEach(button => {
            button.style.display = '';
        });
        console.log('Showing all sections');
        return;
    }

    const success = TemplateManager.applyTemplate(templateName);
    if (success) {
        const template = PROPOSAL_CONFIG.templates[templateName];
        alert(`Applied template: ${template.name}\n\n${template.description}\n\nVisible sections: ${template.sections.join(', ')}`);
    }
}

// AI Summaries functions
async function generateBusinessContextSummary() {
    const background = document.getElementById('aiInputBackground').value;
    const problemStatement = document.getElementById('aiInputProblem').value;

    if (!background && !problemStatement) {
        alert('Please fill in Background and Problem Statement in the Project section first.');
        return;
    }

    try {
        // Use AI Summarizer module
        const result = await AISummarizer.generateBusinessContextSummary({
            background: background,
            problem_statement: problemStatement
        });

        // Update form fields with generated summary
        document.getElementById('aiDraft').value = result.draft;
        document.getElementById('aiStatus').value = result.status;
        document.getElementById('aiConfidence').value = result.confidence;
        updateStatusWarning();

        alert(`AI summary generated!\n\nConfidence: ${(result.confidence * 100).toFixed(0)}%\nStatus: ${result.status}\n\nPlease review and approve.`);
    } catch (error) {
        alert('AI summary generation failed: ' + error.message);
    }
}

function updateStatusWarning() {
    const status = document.getElementById('aiStatus').value;
    const warning = document.getElementById('statusWarning');

    if (status === 'approved') {
        warning.style.display = 'none';
    } else if (status) {
        warning.style.display = 'block';
    } else {
        warning.style.display = 'none';
    }
}
