// src/pages/Report.jsx
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function niceDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export default function Report() {
  const [report, setReport] = useState(null);
  const ref = useRef();

  useEffect(() => {
    const r = localStorage.getItem("lastReport");
    if (r) {
      try {
        setReport(JSON.parse(r));
      } catch {
        setReport(null);
      }
    }
  }, []);

  async function downloadPDF() {
    if (!ref.current) return;
    // enlarge scale for better quality
    const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // compute image size preserving aspect ratio
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth - 40; // margins
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
    pdf.save(`patient_report_${(report && report.timestamp) || Date.now()}.pdf`);
  }

  if (!report) {
    return (
      <div className="container">
        <div className="form-card" style={{ marginTop: 26 }}>
          <h2>No report found</h2>
          <p>Run a prediction first on the Form page — the last result is saved locally and will appear here.</p>
        </div>
      </div>
    );
  }

  const { timestamp, inputs, prediction, probability, raw } = report;
  const percent = Math.round((probability ?? 0) * 100);

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 12, alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>Patient Report</h2>
          <div style={{ color: "#6b7280", marginTop: 6 }}>Generated: {niceDate(timestamp)}</div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="contained" color="primary" onClick={downloadPDF}>
            Download PDF
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              // clear last report
              localStorage.removeItem("lastReport");
              setReport(null);
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      <div ref={ref} style={{ marginTop: 18, padding: 18, background: "#fff", borderRadius: 8, boxShadow: "0 8px 24px rgba(16,24,40,0.06)" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <img src="/logo.jpg" alt="logo" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>HeartPredict</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>AI Heart Risk Screening</div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, color: "#374151", fontWeight: 700 }}>{percent}% Risk</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{prediction === 1 ? "Predicted: High risk" : "Predicted: Low/Moderate risk"}</div>
          </div>
        </div>

        <hr style={{ margin: "18px 0", border: "none", borderTop: "1px solid #f3f4f6" }} />

        {/* Inputs + values */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <h4 style={{ margin: "0 0 8px 0" }}>Patient Inputs</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {Object.entries(inputs || {}).map(([k,v]) => (
                  <tr key={k}>
                    <td style={{ padding: "6px 8px", color: "#6b7280", width: 160, verticalAlign: "top" }}>{k}</td>
                    <td style={{ padding: "6px 8px", color: "#111827", verticalAlign: "top" }}>{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h4 style={{ margin: "0 0 8px 0" }}>Prediction Summary</h4>

            <div style={{ background: "#f1f5f9", height: 14, borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", width: `${percent}%`, background: "linear-gradient(90deg,#60a5fa,#2563eb)" }} />
            </div>

            <div style={{ fontSize: 16, fontWeight: 700 }}>{percent}%</div>
            <div style={{ color: "#6b7280", marginTop: 8 }}>
              {prediction === 1 ? (
                <div><strong>Recommendation:</strong> High risk — seek medical consultation.</div>
              ) : (
                <div><strong>Recommendation:</strong> Low / moderate risk — consult a physician if symptoms persist.</div>
              )}
            </div>

            <div style={{ marginTop: 12, color: "#6b7280", fontSize: 12 }}>
              Note: This report is for educational/demo purposes only — not for clinical use.
            </div>
          </div>
        </div>

        {/* Optional raw info */}
        {raw && (
          <>
            <hr style={{ margin: "18px 0", border: "none", borderTop: "1px solid #f3f4f6" }} />
            <div>
              <h4 style={{ margin: "0 0 8px 0" }}>Model details</h4>
              <pre style={{ background: "#f8fafc", padding: 10, borderRadius: 6, fontSize: 12, overflowX: "auto" }}>{JSON.stringify(raw, null, 2)}</pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
