// src/utils/recommendations.js
// Helper that maps top factor -> tailored advice (educational only)

export function getRiskCategory(prob) {
  if (prob === null || prob === undefined) return { label: "Unknown", color: "gray" };
  if (prob >= 0.7) return { label: "High (Critical)", color: "red" };
  if (prob >= 0.4) return { label: "Moderate", color: "orange" };
  return { label: "Low", color: "green" };
}

export function topFactorFromReport(report) {
  // prefer real feature_importances if present as [{feature, importance}, ...]
  try {
    const raw = (report && report.raw) || {};
    if (Array.isArray(raw.feature_importances) && raw.feature_importances.length) {
      // pick highest importance
      const sorted = raw.feature_importances.slice().sort((a,b) => (b.importance||0) - (a.importance||0));
      return sorted[0].feature;
    }
  } catch (e) { /* ignore */ }

  // fallback: pick largest numeric deviation from common numeric fields
  try {
    const inputs = report.inputs || {};
    const keys = ["age","trestbps","chol","thalch","oldpeak","ca"];
    const values = keys.map(k => ({k, v: Math.abs(Number(inputs[k] || 0))}));
    values.sort((a,b) => b.v - a.v);
    return values[0].k;
  } catch (e) {
    return null;
  }
}

export function remediesForFactor(factor) {
  // educational remedies (short), not medical advice
  const map = {
    age: [
      "Maintain regular exercise (150 min/week moderate-intensity).",
      "Annual health check-ups and monitor BP/lipids."
    ],
    trestbps: [
      "Reduce salt intake and processed foods; follow DASH-style diet.",
      "Monitor blood pressure at home and consult GP if persistently high.",
      "Regular aerobic exercise and weight management."
    ],
    chol: [
      "Reduce saturated fats, increase dietary fiber (oats, legumes).",
      "Consider seeking lipid panel & advice from physician.",
      "Increase physical activity and avoid smoking."
    ],
    thalch: [
      "Improve cardiovascular fitness with gradual aerobic exercise.",
      "If unusually low, consult physician for exercise testing / ECG."
    ],
    oldpeak: [
      "Oldpeak indicates exercise-induced ST changes — seek cardiology review if high.",
      "Avoid strenuous exercise until cleared; get stress test if recommended."
    ],
    ca: [
      "Number of vessels (ca) can indicate existing coronary disease — seek cardiologist.",
      "Cardiac imaging or angiography might be considered by a specialist."
    ],
    thal: [
      "Abnormal thalassemia encoding in dataset — consult clinician for further testing.",
      "Consider hemoglobin and related blood tests if indicated."
    ],
    cp: [
      "Chest pain requires careful evaluation — any persistent/atypical pain should be seen promptly."
    ],
    default: [
      "Maintain a heart-healthy lifestyle: balanced diet, regular activity, quit smoking, limit alcohol.",
      "Monitor vitals (blood pressure, heart rate) and follow up with your primary care doctor."
    ]
  };
  return map[factor] || map["default"];
}

export function testsForRiskCategory(categoryLabel) {
  if (categoryLabel.includes("High")) {
    return [
      "Immediate GP/Primary care assessment",
      "Referral to cardiologist",
      "12-lead ECG; cardiac enzymes if symptomatic",
      "Lipid profile, fasting blood sugar/HbA1c, kidney function",
      "Consider stress testing / echocardiography as advised"
    ];
  }
  if (categoryLabel.includes("Moderate")) {
    return [
      "GP visit for clinical review",
      "Lipid profile and blood pressure monitoring",
      "Lifestyle modification plan and follow-up in 4–12 weeks"
    ];
  }
  return [
    "Continue preventive measures: healthy diet, exercise, regular screening",
    "Routine check-ups and monitoring of blood pressure and lipids"
  ];
}
