async (page) => {
    const templateNames = await page.evaluate(() => templates.map(t => t.name));
    console.log('--- Gesture Recognition Test Results ---');
    let passCount = 0;
    for (const name of templateNames) {
        const result = await page.evaluate(async (targetName) => {
            const template = templates.find(t => t.name === targetName);
            if (!template) return { success: false, text: 'Template not found' };
            // Simulate a drawing by mimicking the template points
            window.currentStroke = template.points.map(p => ({ x: p[0], y: p[1], t: performance.now() }));
            // Call the finalization logic
            window.finalizeGesture();
            const text = document.getElementById('result').textContent;
            return { success: text.includes(targetName), text };
        }, name);
        if (result.success) passCount++;
        console.log(`[${name}]: ${result.success ? 'PASSED' : 'FAILED (' + result.text + ')'}`);
    }
    console.log(`\nFinal Score: ${passCount}/${templateNames.length} Passed`);
}
