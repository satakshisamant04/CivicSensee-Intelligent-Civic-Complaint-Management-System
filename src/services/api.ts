import {
  Complaint,
  ComplaintCategory,
  PriorityLevel,
  ComplaintStatus,
  MLPredictionResult,
  AnalyticsSummary,
  ModelEvaluationMetrics,
  UserSession
} from '../types/index.js';

export async function fetchComplaints(params?: {
  search?: string;
  category?: string;
  priority?: string;
  status?: string;
  location?: string;
  citizenEmail?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}): Promise<{ complaints: Complaint[]; total: number; page: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
  }
  const res = await fetch(`/api/complaints?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch complaints');
  return res.json();
}

export async function fetchComplaintById(id: string): Promise<{ complaint: Complaint }> {
  const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Complaint ${id} not found`);
  }
  return res.json();
}

export async function createComplaintApi(payload: {
  title: string;
  description: string;
  location: { city: string; area: string; landmark?: string; latitude?: number; longitude?: number };
  daysPending: number;
  previousComplaints: number;
  citizenName: string;
  citizenEmail: string;
  citizenPhone?: string;
  customCategory?: ComplaintCategory;
}): Promise<{ complaint: Complaint }> {
  const res = await fetch('/api/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit complaint');
  }
  return res.json();
}

export async function updateComplaintStatusApi(
  id: string,
  status: ComplaintStatus,
  note?: string,
  updatedBy?: string
): Promise<{ complaint: Complaint }> {
  const res = await fetch(`/api/complaints/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note, updatedBy })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update complaint status');
  }
  return res.json();
}

export async function deleteComplaintApi(id: string): Promise<{ message: string }> {
  const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete complaint');
  }
  return res.json();
}

export async function predictComplaintMLApi(
  text: string,
  daysPending: number = 0,
  previousComplaints: number = 0
): Promise<{ data: MLPredictionResult; source: string }> {
  const res = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      complaint_text: text,
      days_pending: daysPending,
      previous_complaints: previousComplaints
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to run ML prediction');
  }
  return res.json();
}

export async function fetchAnalyticsApi(): Promise<{ analytics: AnalyticsSummary }> {
  const res = await fetch('/api/analytics');
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchModelEvaluationApi(): Promise<{ data: ModelEvaluationMetrics }> {
  const res = await fetch('/api/model-evaluation');
  if (!res.ok) throw new Error('Failed to fetch model metrics');
  return res.json();
}

export async function loginApi(
  email: string,
  password?: string,
  role?: string
): Promise<{ user: UserSession; token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

export async function registerApi(payload: {
  name: string;
  email: string;
  password?: string;
  role: string;
}): Promise<{ user: UserSession; token: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Registration failed');
  }
  return res.json();
}
