export type JobStatus = "OPEN" | "PAUSED" | "CLOSED";
export type CandidateStage =
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Job {
  id: string;
  owner_id: string;
  title: string;
  department: string | null;
  location: string | null;
  status: JobStatus;
  candidate_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  job_id: string;
  name: string;
  email: string;
  stage: CandidateStage;
  score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PipelineSummary {
  jobId: string;
  totalCandidates: number;
  stages: Array<{ stage: CandidateStage; count: number }>;
}
