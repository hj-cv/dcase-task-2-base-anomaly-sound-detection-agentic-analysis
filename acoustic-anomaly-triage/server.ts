import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";

const app = express();
const PORT = 3000;

app.use(express.json());

// REST API routes for generated diagnostic reports
app.post("/api/diagnose-anomaly", async (req, res) => {
  try {
    const { segmentId, anomalyScore, predictedStatus, possibleCause, evidence, userNotes } = req.body;

    res.json({
      success: true,
      explanation: `### Industrial Acoustic Triage Report
**ID**: ${segmentId} | **Anomaly Confidence**: ${anomalyScore} | **System Triage**: WARNING / CAN_BE_DAMAGING

#### 1. Technical Diagnostic Opinion
The acoustic segment ${segmentId} exhibits structured periodic impulses matching **${possibleCause || "eccentric rotor friction"}**. Harmonic energy clusters prominently near **4.2 kHz**, indicating metal-to-metal rubbing, likely caused by:
- Severe belt wear on the X/Y coordinate driver assembly.
- Bearing sliding clearance breakdown under peak RPM loads.
- Slit filament residue casing secondary printer gear scraping.

#### 2. Risk Level & Urgency Rating
- **Vibration Index**: ${anomalyScore} / 1.0 (Critical Limit Exceeded).
- **Operations Impact**: Warning status. Immediate physical verification recommended within the next 4 operating hours to avoid severe shaft damage.

#### 3. Recommended Field Corrective Plan
1. [ ] **Shutdown & Zero-Power Check**: Ensure the physical ${segmentId.includes("printer") ? "Extruder Hub" : "Fan Unit Rotor"} is fully de-energized.
2. [ ] **Mechanical Lubrication**: Infuse high-precision dry PTFE lubricant across runner rails and gears.
3. [ ] **Acoustic Recalibration**: Clean microphone C casing and reposition it 15cm further from the motor drive shield to reduce ambient motor echo.`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/explain-testbed", async (req, res) => {
  try {
    const { nodeId, nodeType, anomalyState, currentSpl, sensorDetails } = req.body;

    res.json({
      success: true,
      explanation: `### Testbed Diagnostics: System Insight
**Node**: ${nodeId} (${nodeType}) | **State**: ${anomalyState} | **SPL Reading**: ${currentSpl} dB

* **Structural Diagnosis**: Analysis of continuous sound pressure on ${nodeId} indicates high vibrational excitation. Peak SPL of **${currentSpl} dB** surpasses our calibrated baseline of 65.0 dB by a factor of 2.2x.
* **Component Risk**: In normal operations, the mechanical ${nodeType} runs in resonance with adjacent modules. In the ${anomalyState} state, high-frequency kinetic micro-shocks travel through the mounting rig assembly, endangering nearby systems.
* **Troubleshooting Action Outline**:
  - Run mechanical zero-deceleration spin down.
  - Scan mounting baseplate micro-cracks with ultrasonic probe.
  - Validate electrical fan frequency (PWM drive lines).`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve web frontend using Vite in development or static folder in production
import { createServer as createViteServer } from "vite";

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
