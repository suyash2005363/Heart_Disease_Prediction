// src/pages/About.jsx
import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

/**
 * About.jsx - simplified, robust version
 * - uses import-safe components
 * - reads lastReport from localStorage if present
 * - falls back to mock data
 */

function mockImportances() {
  const features = ["thalch", "oldpeak", "trestbps", "age", "chol", "ca", "thal", "cp"];
  return features.map((f, i) => ({ feature: f, importance: +(((features.length - i) / (features.length * 2)).toFixed(3)) }));
}

function mockRocPoints() {
  return [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.05, tpr: 0.35 },
    { fpr: 0.1, tpr: 0.55 },
    { fpr: 0.2, tpr: 0.72 },
    { fpr: 0.3, tpr: 0.82 },
    { fpr: 0.4, tpr: 0.88 },
    { fpr: 0.6, tpr: 0.94 },
    { fpr: 1.0, tpr: 1.0 },
  ];
}

export default function About() {
  const [modelInfo] = useState({
    name: "RandomForestClassifier",
    dataset: "Heart Disease (cleaned)",
    trained_on: "Unknown",
    notes: "Model object loaded from saved pickle (frontend does not have full training metrics).",
  });

  const [importances, setImportances] = useState([]);
  const [rocPoints, setRocPoints] = useState([]);
  const [aucMock, setAucMock] = useState(null);

  useEffect(() => {
    try {
      const r = localStorage.getItem("lastReport");
      if (r) {
        const parsed = JSON.parse(r);
        const raw = parsed.raw || {};
        if (Array.isArray(raw.feature_importances) && raw.feature_importances.length) {
          setImportances(raw.feature_importances.map((f) => ({ feature: f.feature, importance: Number(f.importance) })));
        } else {
          setImportances(mockImportances());
        }

        if (Array.isArray(raw.roc) && raw.roc.length) {
          setRocPoints(raw.roc);
          setAucMock(null);
        } else {
          const mr = mockRocPoints();
          setRocPoints(mr);
          let auc = 0;
          for (let i = 1; i < mr.length; i++) {
            const x0 = mr[i - 1].fpr, y0 = mr[i - 1].tpr;
            const x1 = mr[i].fpr, y1 = mr[i].tpr;
            auc += (x1 - x0) * (y0 + y1) / 2;
          }
          setAucMock(Number(auc.toFixed(3)));
        }
      } else {
        setImportances(mockImportances());
        const mr = mockRocPoints();
        setRocPoints(mr);
        let auc = 0;
        for (let i = 1; i < mr.length; i++) {
          const x0 = mr[i - 1].fpr, y0 = mr[i - 1].tpr;
          const x1 = mr[i].fpr, y1 = mr[i].tpr;
          auc += (x1 - x0) * (y0 + y1) / 2;
        }
        setAucMock(Number(auc.toFixed(3)));
      }
    } catch (e) {
      setImportances(mockImportances());
      setRocPoints(mockRocPoints());
    }
  }, []);

  function exportInfo() {
    const payload = { modelInfo, importances, roc: rocPoints, auc: aucMock };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = "model_info.json";
    a.click();
  }

  const chartData = importances.map((d) => ({ name: d.feature, value: Number(d.importance) }));

  return (
    <div className="container" style={{ paddingTop: 18 }}>
      <section className="form-card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <Typography variant="h5" component="h1" sx={{ marginBottom: 0 }}>
              About the Model
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Details about the trained Random Forest model and visualizations. If you have a saved pipeline with metrics, you can replace the mock values.
            </Typography>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outlined" onClick={exportInfo}>Export JSON</Button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
          <div style={{ background: "#fff", padding: 12, borderRadius: 10 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Model summary</Typography>
            <div style={{ color: "#374151", fontWeight: 600 }}>{modelInfo.name}</div>
            <div style={{ color: "#6b7280", marginTop: 6 }}>{modelInfo.dataset}</div>
            <div style={{ color: "#6b7280", marginTop: 6, fontSize: 13 }}>{modelInfo.trained_on}</div>
            <div style={{ marginTop: 12, color: "#374151" }}>
              <strong>AUC (approx):</strong> {aucMock ?? "N/A"}
            </div>
            <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>{modelInfo.notes}</div>
          </div>

          <div style={{ background: "#fff", padding: 12, borderRadius: 10 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>ROC Curve</Typography>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rocPoints}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fpr" name="False Positive Rate" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip formatter={(v) => (typeof v === "number" ? v.toFixed(3) : v)} />
                  <Line type="monotone" dataKey="tpr" stroke="#2563eb" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>
              The ROC curve above is illustrative.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, background: "#fff", padding: 12, borderRadius: 10 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Feature importances</Typography>

          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip formatter={(v) => (Number(v))} />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: 10, color: "#6b7280", fontSize: 13 }}>
  If your backend returns <code>raw.feature_importances</code> as{" "}
  <code>[{"{"}feature{","} importance{"}"}]</code>, this chart will show the real
  importances.
</div>

        </div>
      </section>
    </div>
  );
}
