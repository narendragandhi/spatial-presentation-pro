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
            
            // Register tools that an AI agent can discover
            this.tools = {
                'presentation:next': {
                    description: 'Advance to the next slide',
                    execute: () => {
                        if (window.setSlide && typeof window.currentSlide !== 'undefined') {
                            window.setSlide(window.currentSlide + 1);
                            return { success: true, message: 'Advanced to next slide' };
                        }
                        return { success: false, message: 'Presentation not initialized' };
                    }
                },
                'presentation:prev': {
                    description: 'Go back to the previous slide',
                    execute: () => {
                        if (window.setSlide && typeof window.currentSlide !== 'undefined') {
                            window.setSlide(window.currentSlide - 1);
                            return { success: true, message: 'Returned to previous slide' };
                        }
                        return { success: false, message: 'Presentation not initialized' };
                    }
                },
                'presentation:get_content': {
                    description: 'Get the content of the current slide',
                    execute: () => {
                        const activeSlide = document.querySelector('.slide.active');
                        if (activeSlide) {
                            return {
                                success: true,
                                slideNumber: activeSlide.querySelector('.slide-num')?.textContent,
                                title: activeSlide.querySelector('h1')?.textContent,
                                content: activeSlide.querySelector('p')?.textContent,
                                bulletPoints: Array.from(activeSlide.querySelectorAll('.points li')).map(li => li.textContent)
                            };
                        }
                        return { success: false, message: 'No active slide found' };
                    }
                },
                'presentation:annotate': {
                    description: 'Add a virtual annotation to the slide',
                    parameters: {
                        x: 'number (0-1)',
                        y: 'number (0-1)',
                        text: 'string'
                    },
                    execute: (params) => {
                        console.log('[WebMCP] Remote Annotation:', params);
                        // Future implementation: Add text labels to the canvas
                        return { success: true, message: 'Annotation queued' };
                    }
                }
            };

            window.dispatchEvent(new CustomEvent('webmcp:ready', { detail: { tools: Object.keys(this.tools) } }));
        },

        /**
         * Call a tool programmatically (simulating agent interaction)
         */
        callTool(name, params) {
            const tool = this.tools[name];
            if (tool) {
                console.log(`[WebMCP] Agent executing tool: ${name}`, params);
                return tool.execute(params);
            }
            return { success: false, message: `Tool ${name} not found` };
        }
    };

    window.WebMCP = WebMCP;
    
    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => WebMCP.init());
    } else {
        WebMCP.init();
    }

})(window);
