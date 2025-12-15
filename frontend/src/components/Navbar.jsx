// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar({ mode, setMode }) {
  const [backendStatus, setBackendStatus] = useState("unknown");

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/openapi.json", { method: "GET" });
        if (!mounted) return;
        setBackendStatus(res.ok ? "ok" : "down");
      } catch (err) {
        if (!mounted) return;
        setBackendStatus("down");
      }
    };
    check();
    const id = setInterval(check, 6000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const statusDotClass =
    backendStatus === "ok" ? "backend-dot ok" : backendStatus === "down" ? "backend-dot down" : "backend-dot unknown";

  return (
    <header className="navbar">
      <div className="container nav-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.jpg" alt="logo" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
          <div>
            <div style={{ fontWeight: 700 }}>CardioAI</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>AI Heart Risk Screening</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <nav style={{ display: "flex", gap: 12 }}>
            <Link to="/">Home</Link>
            <Link to="/form">Form</Link>
            <Link to="/about">About</Link>
            <Link to="/result">Result</Link>
            <Link to="/report">Report</Link>
            <Link to="/recommendations">Recommendations</Link>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={statusDotClass} aria-hidden />
              <small style={{ fontSize: 12, color: "#374151" }}>
                {backendStatus === "ok" ? "Backend: Connected" : backendStatus === "down" ? "Backend: Down" : "Backend: ..."}
              </small>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
