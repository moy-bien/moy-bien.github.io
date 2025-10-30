/**
 * Progressive Disclosure Manager
 * Handles tab completion tracking, field validation feedback, and section collapsing
 */

const ProgressiveDisclosure = {
    tabCompletionStatus: {},

    /**
     * Initialize progressive disclosure features
     */
    init() {
        this.setupFieldValidation();
        this.setupTabCompletion();
        this.setupSectionCollapse();
        this.updateAllTabStatus();
    },

    /**
     * Setup real-time field validation feedback
     */
    setupFieldValidation() {
        const form = document.getElementById('proposalForm');
        if (!form) return;

        // Track all required fields
        const requiredFields = form.querySelectorAll('[required], .form-group.required input, .form-group.required select, .form-group.required textarea');

        requiredFields.forEach(field => {
            // Add input event listener
            field.addEventListener('input', () => this.validateField(field));
            field.addEventListener('blur', () => this.validateField(field));

            // Initial validation
            this.validateField(field);
        });

        // Track form changes for tab completion
        form.addEventListener('input', () => {
            this.updateTabCompletionStatus();
        });
    },

    /**
     * Validate individual field and update UI
     */
    validateField(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        const isValid = field.checkValidity() && field.value.trim() !== '';

        if (isValid) {
            formGroup.classList.add('valid');
            formGroup.classList.remove('invalid');
        } else {
            formGroup.classList.remove('valid');
            if (field.value.trim() !== '') {
                formGroup.classList.add('invalid');
            } else {
                formGroup.classList.remove('invalid');
            }
        }
    },

    /**
     * Setup tab completion tracking
     */
    setupTabCompletion() {
        const tabs = ['project', 'client', 'audience', 'business', 'constraints', 'strategy', 'curriculum', 'plan', 'legal', 'ai_summaries'];

        tabs.forEach(tab => {
            this.tabCompletionStatus[tab] = {
                completed: false,
                inProgress: false,
                requiredFields: 0,
                completedFields: 0
            };
        });
    },

    /**
     * Update tab completion status based on filled fields
     */
    updateTabCompletionStatus() {
        const tabs = ['project', 'client', 'audience', 'business', 'constraints', 'strategy', 'curriculum', 'plan', 'legal', 'ai_summaries'];

        tabs.forEach(tabId => {
            const tabContent = document.getElementById(tabId);
            if (!tabContent) return;

            // Count required fields
            const requiredFields = tabContent.querySelectorAll('[required], .form-group.required input, .form-group.required select, .form-group.required textarea');
            const completedFields = Array.from(requiredFields).filter(field => {
                return field.checkValidity() && field.value.trim() !== '';
            });

            const total = requiredFields.length;
            const completed = completedFields.length;

            this.tabCompletionStatus[tabId] = {
                requiredFields: total,
                completedFields: completed,
                completed: total > 0 && completed === total,
                inProgress: completed > 0 && completed < total
            };

            // Update tab button
            this.updateTabButton(tabId);
        });
    },

    /**
     * Update tab button appearance
     */
    updateTabButton(tabId) {
        const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
        if (!tabButton) return;

        const status = this.tabCompletionStatus[tabId];

        // Remove all status classes
        tabButton.classList.remove('completed', 'in-progress');

        // Add appropriate status class
        if (status.completed) {
            tabButton.classList.add('completed');
        } else if (status.inProgress) {
            tabButton.classList.add('in-progress');
        }

        // Update title attribute
        if (status.requiredFields > 0) {
            tabButton.title = `${status.completedFields}/${status.requiredFields} required fields completed`;
        }
    },

    /**
     * Update all tab statuses
     */
    updateAllTabStatus() {
        this.updateTabCompletionStatus();
    },

    /**
     * Setup section collapse/expand functionality
     */
    setupSectionCollapse() {
        // Find all h3 elements within tab-content
        const headers = document.querySelectorAll('.tab-content h3');

        headers.forEach(header => {
            // Don't make every h3 collapsible - only those that have content sections after them
            const nextElement = header.nextElementSibling;
            if (!nextElement) return;

            // Skip if the next element is already a collapsible section
            if (nextElement.classList.contains('collapsible-section')) return;

            // Wrap following content in collapsible section
            const section = document.createElement('div');
            section.className = 'collapsible-section';

            // Collect siblings until next h2, h3, or end
            let sibling = header.nextElementSibling;
            const elementsToMove = [];

            while (sibling && !['H2', 'H3'].includes(sibling.tagName)) {
                elementsToMove.push(sibling);
                sibling = sibling.nextElementSibling;
            }

            // Only make collapsible if there's content
            if (elementsToMove.length > 0) {
                header.style.cursor = 'pointer';

                // Move elements into section
                elementsToMove.forEach(el => section.appendChild(el));
                header.after(section);

                // Add click handler
                header.addEventListener('click', () => {
                    this.toggleSection(header, section);
                });
            } else {
                // Remove collapse indicator if no content
                header.style.cursor = 'default';
                header.style.justifyContent = 'flex-start';
            }
        });
    },

    /**
     * Toggle section collapse/expand
     */
    toggleSection(header, section) {
        const isCollapsed = section.classList.contains('collapsed');

        if (isCollapsed) {
            section.classList.remove('collapsed');
            header.classList.remove('collapsed');
        } else {
            section.classList.add('collapsed');
            header.classList.add('collapsed');
        }

        // Save state to localStorage
        const tabId = header.closest('.tab-content').id;
        const headerText = header.textContent.trim();
        this.saveCollapsedState(tabId, headerText, !isCollapsed);
    },

    /**
     * Save collapsed state to localStorage
     */
    saveCollapsedState(tabId, headerText, isCollapsed) {
        const key = 'collapsedSections';
        const state = JSON.parse(localStorage.getItem(key) || '{}');

        if (!state[tabId]) state[tabId] = {};
        state[tabId][headerText] = isCollapsed;

        localStorage.setItem(key, JSON.stringify(state));
    },

    /**
     * Restore collapsed state from localStorage
     */
    restoreCollapsedStates() {
        const key = 'collapsedSections';
        const state = JSON.parse(localStorage.getItem(key) || '{}');

        Object.keys(state).forEach(tabId => {
            const tabState = state[tabId];
            const tabContent = document.getElementById(tabId);
            if (!tabContent) return;

            Object.keys(tabState).forEach(headerText => {
                const isCollapsed = tabState[headerText];
                const header = Array.from(tabContent.querySelectorAll('h3'))
                    .find(h => h.textContent.trim() === headerText);

                if (header && isCollapsed) {
                    const section = header.nextElementSibling;
                    if (section && section.classList.contains('collapsible-section')) {
                        section.classList.add('collapsed');
                        header.classList.add('collapsed');
                    }
                }
            });
        });
    },

    /**
     * Get completion percentage for current form
     */
    getCompletionPercentage() {
        const tabs = Object.values(this.tabCompletionStatus);
        const totalRequired = tabs.reduce((sum, tab) => sum + tab.requiredFields, 0);
        const totalCompleted = tabs.reduce((sum, tab) => sum + tab.completedFields, 0);

        if (totalRequired === 0) return 0;
        return Math.round((totalCompleted / totalRequired) * 100);
    },

    /**
     * Show completion summary
     */
    showCompletionSummary() {
        const percentage = this.getCompletionPercentage();
        const tabs = Object.entries(this.tabCompletionStatus);
        const completedTabs = tabs.filter(([_, status]) => status.completed).length;
        const totalTabs = tabs.length;

        return {
            percentage,
            completedTabs,
            totalTabs,
            isComplete: completedTabs === totalTabs
        };
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ProgressiveDisclosure.init();
    ProgressiveDisclosure.restoreCollapsedStates();

    // Update status periodically
    setInterval(() => {
        ProgressiveDisclosure.updateAllTabStatus();
    }, 2000);
});

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ProgressiveDisclosure = ProgressiveDisclosure;
}
