import type {
  AuthResponse,
  Candidate,
  CandidateStage,
  Job,
  PipelineSummary,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  listJobs: (token: string) => request<Job[]>("/api/jobs", {}, token),

  createJob: (
    token: string,
    data: { title: string; department?: string; location?: string },
  ) =>
    request<Job>(
      "/api/jobs",
      { method: "POST", body: JSON.stringify(data) },
      token,
    ),

  listCandidates: (token: string, jobId: string) =>
    request<Candidate[]>(`/api/jobs/${jobId}/candidates`, {}, token),

  createCandidate: (
    token: string,
    jobId: string,
    data: { name: string; email: string; score?: number; notes?: string },
  ) =>
    request<Candidate>(
      `/api/jobs/${jobId}/candidates`,
      { method: "POST", body: JSON.stringify(data) },
      token,
    ),

  updateCandidateStage: (
    token: string,
    candidateId: string,
    stage: CandidateStage,
  ) =>
    request<Candidate>(
      `/api/candidates/${candidateId}`,
      { method: "PATCH", body: JSON.stringify({ stage }) },
      token,
    ),

  pipelineSummary: (token: string, jobId: string) =>
    request<PipelineSummary>(`/api/jobs/${jobId}/pipeline-summary`, {}, token),
};
