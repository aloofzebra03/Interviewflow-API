import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import type { Candidate, CandidateStage, Job, PipelineSummary } from "./types";

const STAGES: CandidateStage[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
];

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("interviewflow_token") || "");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [summary, setSummary] = useState<PipelineSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) || null,
    [jobs, selectedJobId],
  );

  const loadJobs = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.listJobs(token);
      setJobs(data);
      setSelectedJobId((current) => current || data[0]?.id || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load jobs");
    }
  }, [token]);

  const loadCandidates = useCallback(async () => {
    if (!token || !selectedJobId) {
      setCandidates([]);
      setSummary(null);
      return;
    }
    try {
      const [candidateData, summaryData] = await Promise.all([
        api.listCandidates(token, selectedJobId),
        api.pipelineSummary(token, selectedJobId),
      ]);
      setCandidates(candidateData);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load candidates");
    }
  }, [selectedJobId, token]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const name = String(form.get("name") || "");

    try {
      const result =
        mode === "register"
          ? await api.register(name, email, password)
          : await api.login(email, password);
      localStorage.setItem("interviewflow_token", result.token);
      setToken(result.token);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const job = await api.createJob(token, {
        title: String(form.get("title") || ""),
        department: String(form.get("department") || "") || undefined,
        location: String(form.get("location") || "") || undefined,
      });
      setJobs((current) => [job, ...current]);
      setSelectedJobId(job.id);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create job");
    }
  }

  async function handleCreateCandidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedJobId) return;
    setError("");
    const form = new FormData(event.currentTarget);
    const scoreValue = String(form.get("score") || "");

    try {
      await api.createCandidate(token, selectedJobId, {
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        score: scoreValue ? Number(scoreValue) : undefined,
        notes: String(form.get("notes") || "") || undefined,
      });
      event.currentTarget.reset();
      await loadCandidates();
      await loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add candidate");
    }
  }

  async function changeStage(candidateId: string, stage: CandidateStage) {
    setError("");
    try {
      const updated = await api.updateCandidateStage(token, candidateId, stage);
      setCandidates((current) =>
        current.map((candidate) => (candidate.id === candidateId ? updated : candidate)),
      );
      if (selectedJobId) {
        setSummary(await api.pipelineSummary(token, selectedJobId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update stage");
    }
  }

  function logout() {
    localStorage.removeItem("interviewflow_token");
    setToken("");
    setJobs([]);
    setCandidates([]);
    setSummary(null);
    setSelectedJobId("");
  }

  if (!token) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <div className="brand">InterviewFlow</div>
          <h1>{mode === "login" ? "Recruiter sign in" : "Create recruiter account"}</h1>
          <p className="muted">A small full-stack hiring pipeline built with React, Express, and PostgreSQL.</p>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleAuth} className="stack">
            {mode === "register" && <input name="name" placeholder="Full name" minLength={2} required />}
            <input name="email" type="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password" minLength={8} required />
            <button disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Register"}</button>
          </form>
          <button className="link-button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand">InterviewFlow</div>
          <span className="muted">Hiring pipeline dashboard</span>
        </div>
        <button className="secondary" onClick={logout}>Log out</button>
      </header>

      {error && <div className="error page-error">{error}</div>}

      <div className="layout">
        <aside className="sidebar card">
          <h2>Jobs</h2>
          <div className="job-list">
            {jobs.map((job) => (
              <button
                key={job.id}
                className={`job-item ${selectedJobId === job.id ? "active" : ""}`}
                onClick={() => setSelectedJobId(job.id)}
              >
                <strong>{job.title}</strong>
                <span>{job.department || "General"} · {job.candidate_count ?? 0} candidates</span>
              </button>
            ))}
            {jobs.length === 0 && <p className="muted">No jobs yet.</p>}
          </div>

          <form onSubmit={handleCreateJob} className="stack compact-form">
            <h3>Create job</h3>
            <input name="title" placeholder="Job title" required />
            <input name="department" placeholder="Department" />
            <input name="location" placeholder="Location" />
            <button>Create job</button>
          </form>
        </aside>

        <section className="content">
          {!selectedJob ? (
            <div className="card empty-state">Create a job to start managing candidates.</div>
          ) : (
            <>
              <section className="card job-header">
                <div>
                  <span className="eyebrow">{selectedJob.status}</span>
                  <h1>{selectedJob.title}</h1>
                  <p className="muted">{selectedJob.department || "General"} · {selectedJob.location || "Location not set"}</p>
                </div>
                <div className="summary-total">
                  <strong>{summary?.totalCandidates ?? candidates.length}</strong>
                  <span>Candidates</span>
                </div>
              </section>

              <section className="stage-grid">
                {STAGES.map((stage) => {
                  const count = summary?.stages.find((item) => item.stage === stage)?.count ?? 0;
                  return (
                    <div className="stage-card" key={stage}>
                      <span>{stage}</span>
                      <strong>{count}</strong>
                    </div>
                  );
                })}
              </section>

              <section className="card">
                <div className="section-heading">
                  <div>
                    <h2>Candidates</h2>
                    <p className="muted">Update a candidate's stage directly from the table.</p>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Score</th><th>Stage</th></tr>
                    </thead>
                    <tbody>
                      {candidates.map((candidate) => (
                        <tr key={candidate.id}>
                          <td><strong>{candidate.name}</strong></td>
                          <td>{candidate.email}</td>
                          <td>{candidate.score ?? "—"}</td>
                          <td>
                            <select
                              value={candidate.stage}
                              onChange={(event) => void changeStage(candidate.id, event.target.value as CandidateStage)}
                            >
                              {STAGES.map((stage) => <option key={stage}>{stage}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                      {candidates.length === 0 && (
                        <tr><td colSpan={4} className="empty-cell">No candidates for this job yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="card">
                <h2>Add candidate</h2>
                <form onSubmit={handleCreateCandidate} className="candidate-form">
                  <input name="name" placeholder="Candidate name" required />
                  <input name="email" type="email" placeholder="Candidate email" required />
                  <input name="score" type="number" min="0" max="100" placeholder="Score (0-100)" />
                  <input name="notes" placeholder="Notes" />
                  <button>Add candidate</button>
                </form>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
