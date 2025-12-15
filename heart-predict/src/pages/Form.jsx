// src/pages/Form.jsx
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

/*
  Input-only Form page:
  - collects inputs
  - single Predict button
  - calls backend, saves lastReport to localStorage, navigates to /result
*/

async function callBackendPrediction(features) {
  const res = await fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(features),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Prediction error");
  }
  return res.json();
}

export default function Form() {
  const [age, setAge] = useState(54);
  const [trestbps, setTrestbps] = useState(130);
  const [chol, setChol] = useState(246);
  const [thalach, setThalach] = useState(149);
  const [oldpeak, setOldpeak] = useState(1.0);
  const [ca, setCa] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  function buildFeatures() {
    return {
      age,
      sex: 1,
      cp: 0,
      trestbps,
      chol,
      fbs: 0,
      restecg: 0,
      thalch: thalach,
      exang: 0,
      oldpeak,
      slope: 1,
      ca,
      thal: 1,
      dataset: 0,
    };
  }

  const onPredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const features = buildFeatures();
      const data = await callBackendPrediction(features);

      // save report and go to result page
      const now = new Date().toISOString();
      const lastReport = {
        timestamp: now,
        inputs: features,
        prediction: Number(data.prediction),
        probability: Number(data.probability),
        raw: data.raw || null,
      };
      localStorage.setItem("lastReport", JSON.stringify(lastReport));

      navigate("/result");
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Box sx={{ mt: 3, background: "background.paper", p: 3, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h5" gutterBottom>
          Patient Inputs
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Fill patient values and press <strong>Predict</strong>. Results will be shown on a separate page with graphs and report download.
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <Box>
            <Typography variant="caption">Age</Typography>
            <Slider value={age} min={18} max={100} onChange={(e, v) => setAge(v)} />
            <TextField value={age} onChange={(e) => setAge(Number(e.target.value || 0))} size="small" />
          </Box>

          <Box>
            <Typography variant="caption">Resting BP (trestbps)</Typography>
            <Slider value={trestbps} min={60} max={250} onChange={(e, v) => setTrestbps(v)} />
            <TextField value={trestbps} onChange={(e) => setTrestbps(Number(e.target.value || 0))} size="small" />
          </Box>

          <Box>
            <Typography variant="caption">Cholesterol (chol)</Typography>
            <Slider value={chol} min={100} max={600} onChange={(e, v) => setChol(v)} />
            <TextField value={chol} onChange={(e) => setChol(Number(e.target.value || 0))} size="small" />
          </Box>

          <Box>
            <Typography variant="caption">Max heart rate (thalach)</Typography>
            <Slider value={thalach} min={60} max={220} onChange={(e, v) => setThalach(v)} />
            <TextField value={thalach} onChange={(e) => setThalach(Number(e.target.value || 0))} size="small" />
          </Box>

          <Box>
            <Typography variant="caption">Oldpeak (ST depression)</Typography>
            <Slider value={oldpeak} min={0} max={6} step={0.1} onChange={(e, v) => setOldpeak(Number(v))} />
            <TextField value={oldpeak} onChange={(e) => setOldpeak(Number(e.target.value || 0))} size="small" />
          </Box>

          <Box>
            <Typography variant="caption">Number of major vessels (ca)</Typography>
            <Slider value={ca} min={0} max={3} step={1} onChange={(e, v) => setCa(Number(v))} />
            <TextField value={ca} onChange={(e) => setCa(Number(e.target.value || 0))} size="small" />
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button variant="contained" onClick={onPredict} disabled={loading}>
            {loading ? "Predicting..." : "Predict"}
          </Button>
          <Button variant="outlined" onClick={() => navigate("/report")}>View Last Report</Button>
        </Box>

        {error && <Typography sx={{ color: "error.main", mt: 2 }}>{error}</Typography>}
      </Box>
    </div>
  );
}
