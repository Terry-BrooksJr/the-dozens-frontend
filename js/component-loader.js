/**
 * Simple component loader for static HTML includes
 */

class ComponentLoader {
    /**
     * Load HTML component from file and inject into target element
     */
    static async loadComponent(path, targetId) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${response.status}`);
            }

            const html = await response.text();
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.innerHTML = html;

                // Trigger custom event for component loaded
                const event = new CustomEvent('componentLoaded', {
                    detail: { path, targetId }
                });
                targetElement.dispatchEvent(event);
            } else {
                console.warn(`Target element #${targetId} not found for component ${path}`);
            }
        } catch (error) {
            console.error(`Error loading component ${path}:`, error);
        }
    }

    /**
     * Load multiple components at once
     */
    static async loadComponents(components) {
        const promises = components.map(({ path, targetId }) =>
            this.loadComponent(path, targetId)
        );

        return Promise.allSettled(promises);
    }

    /**
     * Initialize all components specified in data attributes
     */
    static initializeComponents() {
        const components = document.querySelectorAll('[data-component]');

        components.forEach(element => {
            const componentPath = element.dataset.component;
            const targetId = element.id || element.dataset.target;

            if (componentPath && targetId) {
                this.loadComponent(componentPath, targetId);
            }
        });
    }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    ComponentLoader.initializeComponents();

    // Load main modal components sequentially to avoid container conflicts
    const loadComponentsSequentially = async () => {
        const modalContainer = document.getElementById('modals-container');
        if (!modalContainer) {
            console.warn('Modal container not found');
            return;
        }

        try {
            // Load each component and append to container
            const components = [
                './includes/history-modal.html',
                './includes/joke-reporting-form.html',
                './includes/getting-started.html'
            ];

            for (const componentPath of components) {
                const response = await fetch(componentPath);
                if (response.ok) {
                    const html = await response.text();
                    modalContainer.innerHTML += html;
                } else {
                    console.warn(`Failed to load component: ${componentPath}`);
                }
            }
        } catch (error) {
            console.error('Error loading modal components:', error);
        }
    };

    loadComponentsSequentially();
});

// Export for global use
window.ComponentLoader = ComponentLoader;