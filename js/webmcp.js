/**
 * WebMCP - Spatial Presentation Console Integration
 * Exposes structured tools for AI agents to interact with the presentation.
 */
(function (window) {
    'use strict';

    const WebMCP = {
        version: '1.0.0',
        
        /**
         * Initialize WebMCP tools
         */
        init() {
            console.log('[WebMCP] Initializing Spatial Console Tools...');
            this.logElement = document.getElementById('agent-log');
            
            // Register tools that an AI agent can discover
            this.tools = {
                'presentation:next': {
                    description: 'Advance to the next slide',
                    execute: () => {
                        this.log('Tool: presentation:next', 'agent');
                        if (window.setSlide && typeof window.currentSlide !== 'undefined') {
                            window.setSlide(window.currentSlide + 1);
                            this.log('Action: Slide Advanced', 'action');
                            return { success: true, message: 'Advanced to next slide' };
                        }
                        return { success: false, message: 'Presentation not initialized' };
                    }
                },
                'presentation:prev': {
                    description: 'Go back to the previous slide',
                    execute: () => {
                        this.log('Tool: presentation:prev', 'agent');
                        if (window.setSlide && typeof window.currentSlide !== 'undefined') {
                            window.setSlide(window.currentSlide - 1);
                            this.log('Action: Slide Reversed', 'action');
                            return { success: true, message: 'Returned to previous slide' };
                        }
                        return { success: false, message: 'Presentation not initialized' };
                    }
                },
                'presentation:get_content': {
                    description: 'Get the content of the current slide',
                    execute: () => {
                        this.log('Tool: presentation:get_content', 'agent');
                        const activeSlide = document.querySelector('.slide.active');
                        if (activeSlide) {
                            const data = {
                                success: true,
                                title: activeSlide.querySelector('h1')?.textContent,
                                bulletPoints: Array.from(activeSlide.querySelectorAll('.points li')).map(li => li.textContent)
                            };
                            this.log(`Audit: Found "${data.title}"`, 'action');
                            return data;
                        }
                        return { success: false, message: 'No active slide found' };
                    }
                }
            };

            window.dispatchEvent(new CustomEvent('webmcp:ready', { detail: { tools: Object.keys(this.tools) } }));
        },

        /**
         * Internal logging for the Demo Panel
         */
        log(message, type = 'system') {
            if (!this.logElement) return;
            const entry = document.createElement('div');
            entry.className = `log-entry ${type}`;
            entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            this.logElement.appendChild(entry);
            this.logElement.scrollTop = this.logElement.scrollHeight;
        },

        /**
         * Call a tool programmatically (simulating agent interaction)
         */
        callTool(name, params) {
            const tool = this.tools[name];
            if (tool) {
                return tool.execute(params);
            }
            return { success: false, message: `Tool ${name} not found` };
        }
    };

    /**
     * Simulation: Content Audit
     * Shows how an agent might "scrape" and "understand" the page using WebMCP tools
     */
    window.simulateContentAudit = async () => {
        WebMCP.log('Agent initiating content audit...', 'system');
        
        // 1. Get current content
        const content = WebMCP.callTool('presentation:get_content');
        
        // 2. "Analyze" content (Simulated delay)
        WebMCP.log(`Agent analyzed: ${content.bulletPoints.length} points found`, 'system');
        
        // 3. Move to next slide to continue audit
        setTimeout(() => {
            WebMCP.callTool('presentation:next');
            WebMCP.log('Audit Step 1 Complete', 'system');
        }, 1000);
    };

    window.WebMCP = WebMCP;
    
    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => WebMCP.init());
    } else {
        WebMCP.init();
    }

})(window);
