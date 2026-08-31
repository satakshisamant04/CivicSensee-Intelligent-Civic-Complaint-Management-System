export type ComplaintCategory =
  | 'Streetlight'
  | 'Garbage'
  | 'Road/Pothole'
  | 'Water Supply'
  | 'Drainage'
  | 'Electricity'
  | 'Public Transport'
  | 'Traffic'
  | 'Sewage'
  | 'Other';

export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type UserRole = 'citizen' | 'admin';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export interface LocationData {
  city: string;
  area: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}

export interface StatusTimelineEvent {
  status: ComplaintStatus;
  timestamp: string;
  note: string;
  updatedBy: string;
}

export interface ExplainabilityDetails {
  primaryDrivers: string[];
  nlpUrgencyScore: number;
  daysPendingWeight: number;
  reoccurrenceWeight: number;
  modelConfidence: number;
  probabilities: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
}

export interface Complaint {
  id: string; // e.g., CIV-2026-00124
  title: string;
  description: string;
  category: ComplaintCategory;
  predictedCategory: ComplaintCategory;
  categoryConfidence: number;
  priority: PriorityLevel;
  confidence: number;
  location: LocationData;
  daysPending: number;
  previousComplaints: number;
  status: ComplaintStatus;
  citizenName: string;
  citizenEmail: string;
  citizenPhone?: string;
  assignedOfficer?: string;
  assignedDepartment?: string;
  resolutionNotes?: string;
  explainability: ExplainabilityDetails;
  timeline: StatusTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface MLPredictionResult {
  category: ComplaintCategory;
  categoryConfidence: number;
  priority: PriorityLevel;
  confidence: number;
  probabilities: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  topKeywords: string[];
  supportingFactors: string[];
  modelVersion: string;
}

export interface AnalyticsSummary {
  totalComplaints: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  resolved: number;
  pending: number;
  inProgress: number;
  avgResolutionDays: number;
  byCategory: { name: string; count: number; highPriorityCount: number }[];
  byPriority: { name: string; count: number; percentage: number; color: string }[];
  byStatus: { name: string; count: number; color: string }[];
  timeline: { date: string; submitted: number; resolved: number }[];
  categoryResolutionRate: { category: string; rate: number; total: number }[];
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'Citizen' | 'Admin';
  token: string;
}

export interface ModelEvaluationMetrics {
  datasetSize: number;
  timestamp: string;
  categoryMetrics: {
    accuracy: number;
    classes: string[];
    classificationReport: Record<string, { precision: number; recall: number; 'f1-score': number; support: number }>;
    confusionMatrix: number[][];
    modelComparison: {
      logisticRegressionAcc: number;
      randomForestAcc: number;
    };
  };
  priorityMetrics: {
    accuracy: number;
    macroPrecision: number;
    macroRecall: number;
    macroF1: number;
    classes: string[];
    classificationReport: Record<string, { precision: number; recall: number; 'f1-score': number; support: number }>;
    confusionMatrix: number[][];
    modelComparison: {
      logisticRegressionAcc: number;
      randomForestAcc: number;
    };
  };
}
