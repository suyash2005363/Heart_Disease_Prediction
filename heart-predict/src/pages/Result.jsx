// src/pages/Result.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import SaveIcon from "@mui/icons-material/Save";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import EditIcon from "@mui/icons-material/Edit";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function niceDate(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function pickTopFactorsFromRaw(raw) {
  if (!raw) return null;
  if (Array.isArray(raw.feature_importances) && raw.feature_importances.length) {
    const arr = raw.feature_importances.slice().sort((a, b) => (b.importance || 0) - (a.importance || 0)).map(d => ({ name: d.feature, value: Number(d.importance) || 0 }));
    return arr;
  }
  return null;
}

function fallbackFactorsFromInputs(inputs) {
  const numericKeys = ["age", "trestbps", "chol", "thalch", "oldpeak", "ca"];
  const arr = numericKeys.map(k => {
    const v = Number(inputs?.[k] ?? 0);
    return { name: k, raw: Math.abs(isFinite(v) ? v : 0) };
  }).filter(d => !isNaN(d.raw));
  const max = Math.max(...arr.map(d => d.raw), 1);
  return arr.map(d => ({ name: d.name, value: +(d.raw / max).toFixed(3) }));
}

export default function Result() {
  const [report, setReport] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [percent, setPercent] = useState(null);
  const [predictionLabel, setPredictionLabel] = useState("—");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const r = localStorage.getItem("lastReport");
    if (!r) { setReport(null); return; }
    try {
      const parsed = JSON.parse(r);
      setReport(parsed);
      const prob = Number(parsed.probability ?? 0);
      setPercent(Math.round(prob * 100));
      setPredictionLabel(prob >= 0.7 ? "High (Critical)" : prob >= 0.4 ? "Moderate" : "Low");

      const raw = parsed.raw || null;
      const fromRaw = pickTopFactorsFromRaw(raw);
      if (fromRaw && fromRaw.length) {
        const top = fromRaw.slice(0, 6);
        const maxVal = Math.max(...top.map(d => d.value), 1);
        const normalized = top.map(d => ({ ...d, value: +(d.value / maxVal).toFixed(3) }));
        setChartData(normalized);
      } else {
        const fallback = fallbackFactorsFromInputs(parsed.inputs || {});
        setChartData(fallback.slice(0, 6));
      }
    } catch (e) {
      console.error("Failed to parse lastReport:", e);
      setReport(null);
    }
  }, []);

  async function downloadPDF() {
    if (!ref.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth - 40;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
      pdf.save(`patient_result_${report?.timestamp ? Date.parse(report.timestamp) : Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function saveToHistory() {
    if (!report) return;
    setSaving(true);
    try {
      const hist = JSON.parse(localStorage.getItem("history") || "[]");
      hist.unshift({ ...report, savedAt: new Date().toISOString() });
      localStorage.setItem("history", JSON.stringify(hist.slice(0, 500)));
      setTimeout(() => {
        setSaving(false);
        alert("Saved to history.");
      }, 300);
    } catch (e) {
      setSaving(false);
      console.error("Failed to save history:", e);
      alert("Failed to save to history.");
    }
  }

  if (!report) {
    return (
      <div className="container">
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6">No result available</Typography>
          <Typography sx={{ color: "text.secondary", mt: 1 }}>
            Run a prediction first from the Input page.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => navigate("/form")}>
              Go to Input
            </Button>
          </Box>
        </Paper>
      </div>
    );
  }

  return (
    <div className="container">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, gap: 2 }}>
        <div>
          <Typography variant="h5">Prediction Result</Typography>
          <Typography variant="body2" color="text.secondary">
            Generated: {niceDate(report.timestamp)}
          </Typography>
        </div>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button startIcon={<EditIcon />} variant="outlined" onClick={() => navigate("/form")}>
            Edit Inputs
          </Button>

          <Button startIcon={<TipsAndUpdatesIcon />} variant="contained" onClick={() => navigate("/recommendations")}>
            See Recommendations
          </Button>

          <Button startIcon={<SaveIcon />} variant="outlined" onClick={saveToHistory} disabled={saving}>
            {saving ? "Saving..." : "Save to History"}
          </Button>

          <Button startIcon={<PictureAsPdfIcon />} variant="contained" onClick={downloadPDF} disabled={loading}>
            {loading ? "Preparing PDF..." : "Download Report"}
          </Button>
        </Box>
      </Box>

      <Paper ref={ref} sx={{ mt: 3, p: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
          <Box sx={{ flex: "0 0 320px", minWidth: 260 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Prediction
            </Typography>

            <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ width: 120 }}>
                <div
                  style={{
                    height: 120,
                    width: 120,
                    borderRadius: 999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: percent >= 70 ? "linear-gradient(180deg,#fecaca,#f87171)" : percent >= 40 ? "linear-gradient(180deg,#fef3c7,#f59e0b)" : "linear-gradient(180deg,#bbf7d0,#10b981)",
                    boxShadow: "0 8px 24px rgba(16,24,40,0.06)",
                    fontWeight: 700,
                    fontSize: 24,
                    color: "#0f172a",
                  }}
                  aria-hidden
                >
                  {percent}%
                </div>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">{predictionLabel}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {predictionLabel.includes("High")
                    ? "High predicted risk. Please consult a clinician urgently if symptomatic."
                    : predictionLabel.includes("Moderate")
                    ? "Moderate predicted risk. Consider clinical review and follow recommended tests."
                    : "Low predicted risk. Continue preventive measures."}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">Probability</Typography>
                  <Box sx={{ height: 12, background: "#f1f5f9", borderRadius: 8, mt: 1, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${percent}%`,
                        height: "100%",
                        transition: "width .6s ease",
                        background: percent >= 70 ? "#f43f5e" : percent >= 40 ? "#f59e0b" : "#10b981",
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
                    {percent}% chance
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <div>
              <Typography variant="subtitle2">Key inputs</Typography>
              <ul style={{ marginTop: 8 }}>
                <li>Age: {report.inputs.age}</li>
                <li>Resting BP: {report.inputs.trestbps}</li>
                <li>Cholesterol: {report.inputs.chol}</li>
                <li>Max heart rate: {report.inputs.thalch}</li>
              </ul>
            </div>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Most affecting factors
            </Typography>

            <Box sx={{ mt: 2, height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 8, right: 12, left: 12, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip formatter={(val) => (typeof val === "number" ? val.toFixed(3) : val)} />
                  <Bar dataKey="value" fill="#2563eb">
                    <LabelList dataKey="value" position="right" formatter={(v) => (v > 1 ? v : (v * 100).toFixed(0) + "%")} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {report.raw && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2">Model details</Typography>
                <pre style={{ background: "#f8fafc", padding: 12, borderRadius: 6, fontSize: 12, overflowX: "auto" }}>
                  {JSON.stringify(report.raw, null, 2)}
                </pre>
              </>
            )}
          </Box>
        </Box>
      </Paper>
    </div>
  );
}
