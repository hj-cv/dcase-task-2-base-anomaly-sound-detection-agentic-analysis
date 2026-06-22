import { Segment, Session, TestbedNode, GlobalAlert } from "./types";

export const INITIAL_SESSIONS: Session[] = [
  {
    id: "printer_session_015",
    timestamp: "2023-10-27 14:22:05 UTC",
    candidatesCount: 12,
    status: "warning",
    duration: "01:24:10",
    device: "Mic C"
  },
  {
    id: "printer_session_014",
    timestamp: "2023-10-26 09:15:30 UTC",
    candidatesCount: 3,
    status: "stable",
    duration: "02:05:00",
    device: "Mic A"
  },
  {
    id: "extruder_session_012",
    timestamp: "2023-10-25 16:40:12 UTC",
    candidatesCount: 1,
    status: "stable",
    duration: "00:55:00",
    device: "Mic B"
  }
];

export const INITIAL_SEGMENTS: Segment[] = [
  {
    id: "Seg-0042",
    duration: "00:14:22.4 - 00:14:25.1",
    timestamp: "2023-10-27 14:22:05 UTC",
    anomalyScore: 0.92,
    status: "Anomaly Candidate",
    evidenceFor: [
      "Impulsive high-frequency transient at 4.2 kHz",
      "Harmonic decay pattern matches known extrusion fault metrics"
    ],
    evidenceAgainst: ["No major drive motor deceleration synchronized"],
    uncertainty: "Low",
    possibleCause: "Fan rotor obstruction or loose blade friction",
    waveformType: "anomaly",
    waveformPoints: [10, 15, 8, 25, 45, 12, 65, 80, 50, 95, 30, 20, 10, 5, 2],
    splDb: 72.4,
    genreDetectorScore: 0.86,
    operatorNotes: "",
    diagnosticExplanation: `### Industrial Acoustic Triage Report
**ID**: Seg-0042 | **Anomaly Confidence**: 0.92 | **System Triage**: WARNING / CAN_BE_DAMAGING

#### 1. Technical Diagnostic Opinion
The acoustic segment Seg-0042 exhibits structured periodic impulses matching **Fan rotor obstruction or loose blade friction**. Harmonic energy clusters prominent near **4.2 kHz**, indicating metal-to-metal rubbing, likely caused by:
- Severe belt wear on the X/Y coordinate driver assembly.
- Bearing sliding clearance breakdown under peak RPM loads.
- Filament residue casing secondary printer gear scraping.`
  },
  {
    id: "Seg-0041",
    duration: "00:11:05.2 - 00:11:08.5",
    timestamp: "2023-10-27 14:11:05 UTC",
    anomalyScore: 0.68,
    status: "Warning",
    evidenceFor: [
      "Slight dB amplitude elevation at 2.4 kHz",
      "Intermittent rhythmic friction ticking"
    ],
    evidenceAgainst: ["Symmetric spectrogram baseline holds uniform overall"],
    uncertainty: "Medium",
    possibleCause: "Minor motor shaft belt loosening",
    waveformType: "normal",
    waveformPoints: [8, 12, 10, 24, 30, 15, 35, 40, 22, 38, 14, 18, 10, 4, 3],
    splDb: 64.1,
    genreDetectorScore: 0.68,
    operatorNotes: "",
    diagnosticExplanation: ""
  },
  {
    id: "Seg-0040",
    duration: "00:08:12.1 - 00:08:15.0",
    timestamp: "2023-10-27 13:45:12 UTC",
    anomalyScore: 0.12,
    status: "Normal",
    evidenceFor: ["Continuous stable resonance baseline"],
    evidenceAgainst: ["No periodic pulse detected", "Zero high-frequency transient peaks"],
    uncertainty: "Low",
    possibleCause: "Active manufacturing run calibration standard",
    waveformType: "normal",
    waveformPoints: [5, 8, 4, 12, 18, 10, 15, 12, 8, 14, 6, 8, 4, 2, 1],
    splDb: 52.8,
    genreDetectorScore: 0.11,
    operatorNotes: "",
    diagnosticExplanation: ""
  },
  {
    id: "Seg-0039",
    duration: "00:05:45.9 - 00:05:48.2",
    timestamp: "2023-10-27 13:20:10 UTC",
    anomalyScore: 0.05,
    status: "Normal",
    evidenceFor: ["Flawless harmonic alignment with baseline model limits"],
    evidenceAgainst: ["Absolute noise variance inside thermal normal envelopes"],
    uncertainty: "Low",
    possibleCause: "Active manufacturing run stable baseline",
    waveformType: "normal",
    waveformPoints: [4, 6, 3, 10, 15, 8, 12, 10, 6, 11, 4, 6, 3, 1, 1],
    splDb: 48.9,
    genreDetectorScore: 0.05,
    operatorNotes: "",
    diagnosticExplanation: ""
  }
];

export const INITIAL_TESTBED_NODES: TestbedNode[] = [
  {
    id: "Mic A",
    label: "A",
    type: "mic",
    status: "normal",
    operationStatus: "Active",
    splDb: 52.2,
    genreScore: 0.10
  },
  {
    id: "Mic B",
    label: "B",
    type: "mic",
    status: "normal",
    operationStatus: "Active",
    splDb: 49.5,
    genreScore: 0.08
  },
  {
    id: "Mic C",
    label: "C",
    type: "mic",
    status: "anomaly",
    operationStatus: "Active anomaly candidate trigger",
    splDb: 72.4,
    genreScore: 0.86
  },
  {
    id: "Mic D",
    label: "D",
    type: "mic",
    status: "normal",
    operationStatus: "Active",
    splDb: 51.0,
    genreScore: 0.12
  },
  {
    id: "3D-01",
    label: "3D-01",
    type: "machine",
    status: "normal",
    operationStatus: "operation: printing baseline model",
    splDb: 53.0,
    genreScore: 0.08,
    x: 40,
    y: 35
  },
  {
    id: "3D-02",
    label: "3D-02",
    type: "machine",
    status: "normal",
    operationStatus: "operation: standby idle status",
    splDb: 46.1,
    genreScore: 0.03,
    x: 65,
    y: 35
  },
  {
    id: "Fan Unit",
    label: "Fan Unit",
    type: "machine",
    status: "anomaly",
    operationStatus: "operation: fan running (unbalance recorded)",
    splDb: 72.4,
    genreScore: 0.86,
    x: 30,
    y: 60
  },
  {
    id: "Rig",
    label: "Rig",
    type: "machine",
    status: "normal",
    operationStatus: "operation: mounting calibration testbed",
    splDb: 49.2,
    genreScore: 0.09,
    x: 65,
    y: 60
  }
];

export const INITIAL_ALERTS: GlobalAlert[] = [
  {
    id: "alert-001",
    timestamp: "14:22:05 UTC",
    type: "CANDIDATE",
    micId: "Mic C",
    machineId: "Fan Unit",
    description: "Fan Unit - Irregular high-frequency harmonic"
  },
  {
    id: "alert-002",
    timestamp: "13:45:12 UTC",
    type: "WARNING",
    micId: "Mic A",
    machineId: "3D Printer 01",
    description: "3D Printer 01 - Slight dB elevation on calibration"
  }
];
