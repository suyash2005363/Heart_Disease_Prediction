// src/pages/Recommendations.jsx
import React, { useEffect, useState, useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";

/* small helpers (lightweight) */
function getRiskCategory(prob) {
  if (prob === null || prob === undefined) return { label: "Unknown", color: "gray" };
  if (prob >= 0.7) return { label: "High (Critical)", color: "red" };
  if (prob >= 0.4) return { label: "Moderate", color: "orange" };
  return { label: "Low", color: "green" };
}

function topFactorFromReport(report) {
  try {
    const raw = (report && report.raw) || {};
    if (Array.isArray(raw.feature_importances) && raw.feature_importances.length) {
      const sorted = raw.feature_importances.slice().sort((a,b) => (b.importance||0)-(a.importance||0));
      return sorted[0].feature;
    }
  } catch (e) {}
  try {
    const inputs = report.inputs || {};
    const keys = ["age","trestbps","chol","thalch","oldpeak","ca"];
    const values = keys.map(k => ({k, v: Math.abs(Number(inputs[k] || 0))}));
    values.sort((a,b) => b.v - a.v);
    return values[0].k;
  } catch (e) { return null; }
}

function remediesForFactor(factor) {
  const map = {
    age: ["Maintain regular exercise (150 min/week).","Annual health check-ups and monitor BP/lipids."],
    trestbps: ["Reduce salt intake and processed foods.","Monitor blood pressure at home and consult GP if persistently high.","Regular aerobic exercise and weight management."],
    chol: ["Reduce saturated fats, increase dietary fiber.","Consider seeking lipid panel & advice from physician.","Increase physical activity and avoid smoking."],
    thalch: ["Improve cardiovascular fitness with gradual aerobic exercise.","If unusually low, consult physician for exercise testing / ECG."],
    oldpeak: ["Oldpeak indicates exercise-induced ST changes — seek cardiology review if high.","Avoid strenuous exercise until cleared; get stress test if recommended."],
    ca: ["Number of vessels may indicate coronary disease — seek cardiologist.","Cardiac imaging or angiography might be considered by a specialist."],
    thal: ["Consider clinician evaluation and blood tests if indicated."],
    cp: ["Chest pain requires medical review; seek urgent care for acute symptoms."],
    default: ["Maintain a heart-healthy lifestyle: balanced diet, regular activity, quit smoking, limit alcohol.","Monitor BP and lipids; consult primary care as needed."]
  };
  return map[factor] || map["default"];
}

function testsForRiskCategory(categoryLabel) {
  if (categoryLabel.includes("High")) {
    return ["Immediate GP/Primary care assessment","Referral to cardiologist","12-lead ECG; cardiac enzymes if symptomatic","Lipid profile, fasting blood sugar/HbA1c","Consider stress testing / echocardiography"];
  }
  if (categoryLabel.includes("Moderate")) {
    return ["GP visit for clinical review","Lipid profile and BP monitoring","Lifestyle modification plan and follow-up in 4–12 weeks"];
  }
  return ["Continue preventive measures: healthy diet, exercise, regular screening","Routine check-ups and monitoring of BP and lipids"];
}

export default function Recommendations() {
  const [report, setReport] = useState(null);
  const [topFactor, setTopFactor] = useState(null);
  const [risk, setRisk] = useState({ label: "Unknown", color: "gray" });
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const r = localStorage.getItem("lastReport");
    if (!r) { setReport(null); return; }
    try {
      const parsed = JSON.parse(r);
      setReport(parsed);
      const prob = Number(parsed.probability ?? 0);
      setRisk(getRiskCategory(prob));
      const tf = topFactorFromReport(parsed);
      setTopFactor(tf);
    } catch (e) { setReport(null); }
  }, []);

  function saveToHistory() {
    try {
      const h = JSON.parse(localStorage.getItem("history") || "[]");
      h.unshift({ ...report, savedAt: new Date().toISOString() });
      localStorage.setItem("history", JSON.stringify(h.slice(0,200)));
      alert("Saved to history");
    } catch (e) { alert("Failed to save history"); }
  }

  async function downloadPlanPDF() {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth - 40;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
    pdf.save(`recommendation_plan_${Date.now()}.pdf`);
  }

  if (!report) {
    return (
      <div className="container">
        <Box sx={{ mt:3, p:3, borderRadius:2, boxShadow:3, background:"background.paper" }}>
          <Typography variant="h6">No report available</Typography>
          <Typography sx={{ mt:1, color:"text.secondary" }}>Run a prediction first on the Input page.</Typography>
          <Box sx={{ mt:2 }}><Button variant="contained" onClick={() => navigate("/form")}>Go to Input</Button></Box>
        </Box>
      </div>
    );
  }

  const prob = Number(report.probability ?? 0);
  const category = getRiskCategory(prob);
  const remedies = remediesForFactor(topFactor);
  const tests = testsForRiskCategory(category.label);

  return (
    <div className="container">
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mt:2 }}>
        <div>
          <Typography variant="h5">Personalized Recommendations</Typography>
          <Typography variant="body2" color="text.secondary">Based on the last prediction — educational only.</Typography>
        </div>

        <div style={{ display:"flex", gap:8 }}>
          <Button variant="outlined" onClick={() => navigate("/result")}>Back to Result</Button>
          <Button variant="contained" onClick={downloadPlanPDF}>Download Plan (PDF)</Button>
        </div>
      </Box>

      <Divider sx={{ my:2 }} />

      <div ref={ref} style={{ padding:18, borderRadius:10, background:"#fff", boxShadow:"0 8px 24px rgba(16,24,40,0.06)" }}>
        <Box sx={{ display:"flex", gap:3, alignItems:"center", flexWrap:"wrap" }}>
          <div>
            <Typography variant="subtitle2" color="text.secondary">Risk score</Typography>
            <Typography variant="h3" sx={{ color: category.color === "red" ? "#b91c1c" : category.color === "orange" ? "#b45309" : "#065f46", fontWeight:700 }}>
              {Math.round(prob*100)}%
            </Typography>
            <Typography sx={{ color:"text.secondary" }}>{category.label}</Typography>
          </div>

          <div style={{ flex:1 }}>
            <Typography variant="subtitle2">Top contributing factor</Typography>
            <Typography variant="h6" sx={{ mt:0.5 }}>{topFactor || "Unknown"}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt:1 }}>
              This is the most affecting factor identified. Recommendations below are tailored to address it.
            </Typography>
          </div>

          <div style={{ minWidth:220 }}>
            <Typography variant="subtitle2">Immediate actions</Typography>
            <ul>
              {category.label.includes("High") ? (
                <>
                  <li>Contact your GP or local urgent care. If severe symptoms, call emergency services.</li>
                  <li>Bring this report to your appointment.</li>
                </>
              ) : (
                <>
                  <li>Consider scheduling a GP appointment within 1–4 weeks for assessment.</li>
                  <li>Start lifestyle measures and re-check in ~3 months.</li>
                </>
              )}
            </ul>
          </div>
        </Box>

        <Divider sx={{ my:2 }} />

        <Box sx={{ display:"grid", gridTemplateColumns:{ xs:"1fr", md:"1fr 320px" }, gap:2 }}>
          <div>
            <Typography variant="subtitle1">Targeted remedies for <strong>{topFactor || "health"}</strong></Typography>
            <ol>
              {remedies.map((r,i) => <li key={i} style={{ margin:"8px 0" }}>{r}</li>)}
            </ol>

            <Typography variant="subtitle1" sx={{ mt:2 }}>Recommended tests & referrals</Typography>
            <ul>{tests.map((t,i)=> <li key={i}>{t}</li>)}</ul>

            <Typography variant="subtitle1" sx={{ mt:2 }}>Action plan (simple checklist)</Typography>
            <ol>
              <li>Share this report with your primary care physician.</li>
              <li>Book recommended tests (blood tests, ECG) as advised.</li>
              <li>Adopt lifestyle goals: ≈150 min/week moderate exercise, reduce salt/saturated fat.</li>
              <li>Monitor blood pressure & symptoms daily for two weeks.</li>
              <li>Follow up with clinician and update plan.</li>
            </ol>
          </div>

          <div>
            <Typography variant="subtitle1">Quick resources</Typography>
            <ul>
              <li><a href="https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)" target="_blank" rel="noreferrer">WHO — Cardiovascular diseases</a></li>
              <li><a href="https://www.heart.org" target="_blank" rel="noreferrer">American Heart Association</a></li>
            </ul>

            <Box sx={{ mt:2 }}>
              <Typography variant="subtitle2">Save plan</Typography>
              <Typography variant="body2" color="text.secondary">Save this plan to your local history for later review.</Typography>
              <Box sx={{ mt:1 }}><Button variant="outlined" onClick={saveToHistory}>Save to History</Button></Box>
            </Box>

            <Box sx={{ mt:2 }}>
              <Typography variant="caption" color="text.secondary">⚠️ This report is an educational aid only and not medical advice.</Typography>
            </Box>
          </div>
        </Box>
      </div>

      <Box sx={{ mt:2, display:"flex", gap:2 }}>
        <Button variant="contained" onClick={downloadPlanPDF}>Download Plan (PDF)</Button>
        <Button variant="outlined" onClick={() => navigate("/form")}>Edit Inputs</Button>
      </Box>
    </div>
  );
}
