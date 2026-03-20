# Spatial Presentation Console PRO (WebMCP Enabled)

A high-performance, touchless presentation interface that turns your hand into a laser pointer and remote control using a standard webcam.

## 🚀 Features

-   **Laser Pointer:** Point with your index finger to highlight content.
-   **Live Annotation:** Use the "Victory" sign (Index + Middle finger) to draw over slides in real-time.
-   **Dynamic Zoom:** Move your hand closer to the camera to magnify slides.
-   **Pinch Navigation:** Pinch your thumb and index together to advance to the next slide.
-   **Spatial Smoothing:** Exponential Moving Average (EMA) filtering for jitter-free tracking.
-   **WebMCP Integration:** Built-in support for AI agents via the Web Model Context Protocol.

## 🤖 WebMCP Integration

This project is "Agent-Ready." It exposes a structured interface that allows AI agents to interact with and control the presentation console.

### Exposed Tools:
-   `presentation:next`: Advance to the next slide.
-   `presentation:prev`: Go back to the previous slide.
-   `presentation:get_content`: Retrieve the text and bullet points of the current slide.
-   `presentation:annotate`: Queue virtual annotations (experimental).

### How to use with an AI Agent:
If you are using a WebMCP-compatible browser or agent, you can call these tools directly from the console or via the `WebMCP` global object:

```javascript
// Example: Programmatic slide control
WebMCP.callTool('presentation:next');
```

## 🛠️ Tech Stack

-   **MediaPipe Hands:** For low-latency ML hand tracking.
-   **Web Audio API:** For synthesized haptic audio feedback.
-   **Canvas API:** For high-performance rendering and annotations.
-   **WebMCP:** Custom implementation for Agentic Web interaction.

## 🚦 Getting Started

1.  Open `index.html` in a modern browser (Chrome recommended).
2.  Click **INITIALIZE SYSTEM** to grant camera and audio permissions.
3.  Follow the on-screen **Gesture Legend** to control the presentation.

---
Built for the spatial and agentic web. 🚀
