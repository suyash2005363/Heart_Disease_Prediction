// src/pages/Home.jsx
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState("unknown");

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/openapi.json");
        if (!mounted) return;
        setBackendStatus(res.ok ? "ok" : "down");
      } catch {
        if (!mounted) return;
        setBackendStatus("down");
      }
    };
    check();
    const id = setInterval(check, 8000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="container">
      {/* HERO - stacked, centered */}
      <section className="hero-centered">
        <img src="/logo.jpg" alt="main visual" className="hero-image" />

        <h1 className="hero-title">CardioAI - The Heart Disease Predictor</h1>

        <p className="hero-sub">
          Enter patient information on the Form page to get an AI-powered prediction of heart disease risk.
        </p>

        <div className="hero-buttons">
          <Link className="btn-primary" to="/form">Go to Form</Link>
          <Link className="btn-secondary" to="/about">About the Model</Link>
        </div>

        <div className="hero-note">
          This tool is for educational demonstration only — not for medical diagnosis.
        </div>

        {/* backend status small line */}
        <div style={{ marginTop: 10 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: backendStatus === "ok" ? "#065f46" : backendStatus === "down" ? "#991b1b" : "#374151",
              fontSize: 13,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: backendStatus === "ok" ? "#16a34a" : backendStatus === "down" ? "#ef4444" : "#9ca3af",
                display: "inline-block",
              }}
            />
            {backendStatus === "ok" ? "Backend connected" : backendStatus === "down" ? "Backend not reachable" : "Checking backend..."}
          </span>
        </div>
      </section>

      {/* info cards */}
      <section className="info-grid" aria-label="info">
        <div className="card">
          <h3>Quick Start</h3>
          <p>Go to the Form page, fill patient details, and press Predict.</p>
        </div>

        <div className="card">
          <h3>Explainability</h3>
          <p>The About page will show feature importance and ROC curve.</p>
        </div>

        <div className="card">
          <h3>Note</h3>
          <p>Educational demo only — not a clinical tool.</p>
        </div>
      </section>
    </div>
  );
}
