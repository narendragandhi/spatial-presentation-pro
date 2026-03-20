const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('--- Gesture Recognition Test Suite ---');

    // 1. Load the application
    try {
        await page.goto('http://localhost:8000/gesture-calculator/');
    } catch (e) {
        console.error('FAILED: Could not connect to http://localhost:8000. Is the server running?');
        process.exit(1);
    }

    // 2. Verify all templates are loaded
    const templateNames = await page.evaluate(() => {
        return templates.map(t => t.name);
    });
    console.log(`Loaded ${templateNames.length} templates: ${templateNames.join(', ')}`);

    // 3. Test recognition for each template
    let passed = 0;
    let failed = 0;

    for (const name of templateNames) {
        process.stdout.write(`Testing [${name}]... `);

        const recognitionResult = await page.evaluate(async (targetName) => {
            const template = templates.find(t => t.name === targetName);
            if (!template) return { success: false, error: 'Template not found' };

            // Mock a drawing stroke by copying the template points
            // and adding a tiny bit of noise to simulate real drawing
            window.currentStroke = template.points.map(p => ({
                x: p[0] + (Math.random() * 2 - 1), 
                y: p[1] + (Math.random() * 2 - 1), 
                t: performance.now()
            }));

            // Directly call finalizeGesture (it will reset currentStroke at the end)
            window.finalizeGesture();

            const resultDiv = document.getElementById('result');
            return {
                text: resultDiv.textContent,
                success: resultDiv.textContent.includes(targetName)
            };
        }, name);

        if (recognitionResult.success) {
            console.log('PASSED');
            passed++;
        } else {
            console.log(`FAILED (Result: ${recognitionResult.text})`);
            failed++;
        }
        
        // Brief pause to allow the UI to update visually if we were watching
        await page.waitForTimeout(50);
    }

    console.log('\n--- Summary ---');
    console.log(`Total Tests: ${templateNames.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    await browser.close();

    if (failed > 0) process.exit(1);
})();
