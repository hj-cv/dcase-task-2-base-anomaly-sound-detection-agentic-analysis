export interface Segment {
  id: string;
  duration: string;
  timestamp: string;
  anomalyScore: number;
  status: "Anomaly Candidate" | "Normal" | "Warning";
  evidenceFor: string[];
  evidenceAgainst: string[];
  uncertainty: "Low" | "Medium" | "High";
  possibleCause: string;
  waveformType: "normal" | "anomaly";
  waveformPoints: number[];
  splDb: number;
  genreDetectorScore: number;
  isConfirmed?: boolean;
  isDismissed?: boolean;
  isReviewed?: boolean;
  operatorNotes?: string;
  diagnosticExplanation?: string;
}

export interface Session {
  id: string;
  timestamp: string;
  candidatesCount: number;
  status: "warning" | "stable";
  duration: string;
  device: string;
}

export interface TestbedNode {
  id: string;
  label: string;
  type: "machine" | "mic";
  status: "normal" | "anomaly" | "warning";
  x?: number; // percentage positions for rendering
  y?: number;
  assignedSensor?: string;
  operationStatus: string;
  splDb: number;
  genreScore: number;
}

export interface GlobalAlert {
  id: string;
  timestamp: string;
  type: "CANDIDATE" | "WARNING" | "CRITICAL";
  micId: string;
  machineId: string;
  description: string;
  isDismissed?: boolean;
}
