async (page) => {
    // 1. Grant permissions and Navigate
    await page.context().grantPermissions(['camera']);
    await page.goto('http://localhost:8000/gesture-calculator/');
    
    // 2. Wait for app initialization
    await page.waitForFunction(() => typeof templates !== 'undefined' && typeof onResults === 'function');
    
    console.log('--- Gesture Recognition Integration Test Suite ---');
    
    const results = await page.evaluate(async () => {
        const testReport = [];
        
        // Mock isIndexOnlyExtended to allow manual control of drawing state
        let mockDrawingState = false;
        window.isIndexOnlyExtended = () => mockDrawingState;
        
        for (const template of templates) {
            // Start drawing
            mockDrawingState = true;
            
            // For each point in the template, simulate an onResults call
            // We need to provide landmarks where the index tip (landmark 8) is at the point
            for (const p of template.points) {
                const mockLandmarks = new Array(21).fill({x: 0, y: 0});
                // We use coordinates in 0-1 range as MediaPipe does
                // Templates are 0-100, so we divide by 100
                mockLandmarks[8] = { x: p[0] / 100, y: p[1] / 100 };
                // Also need landmark 6 (PIP) to be below tip for drawing pose
                mockLandmarks[6] = { x: p[0] / 100, y: (p[1] / 100) + 0.1 };
                // Middle finger tip (12) and PIP (10) must be same level to not be 'up'
                mockLandmarks[12] = { x: 0.5, y: 0.5 };
                mockLandmarks[10] = { x: 0.5, y: 0.5 };
                
                window.onResults({ multiHandLandmarks: [mockLandmarks] });
            }
            
            // Stop drawing to trigger finalizeGesture
            mockDrawingState = false;
            window.onResults({ multiHandLandmarks: [] }); // This triggers finalization
            
            // Capture the result from the UI
            const resultText = document.getElementById('result').textContent;
            const success = resultText.toLowerCase().includes(template.name.toLowerCase());
            
            testReport.push({
                name: template.name,
                success,
                text: resultText
            });
            
            // Clear the canvas for next test
            document.getElementById('clearBtn').click();
        }
        
        return testReport;
    });
    
    // 3. Print the report
    let passed = 0;
    results.forEach(r => {
        if (r.success) passed++;
        console.log(`[${r.name}]: ${r.success ? 'PASSED' : 'FAILED (' + r.text + ')'}`);
    });
    
    return `\nSummary: ${passed}/${results.length} Passed`;
}
