// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Form from "./pages/Form";
import About from "./pages/About";
import Result from "./pages/Result";
import Recommendations from "./pages/Recommendations";
import Report from "./pages/Report";
import "./styles.css";
import { getDesignTokens } from "./theme";

export default function App() {
  const [mode, setMode] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("hp_theme");
    if (saved === "dark" || saved === "light") setMode(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("hp_theme", mode);
  }, [mode]);

  const themeObj = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeProvider theme={themeObj}>
      <CssBaseline />
      <Router>
        <Navbar mode={mode} setMode={setMode} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/form" element={<Form />} />
            <Route path="/result" element={<Result />} />
            <Route path="/report" element={<Report />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/about" element={<About />} />
            {/* future routes: about, history, admin */}
          </Routes>
        </main>
      </Router>
    </ThemeProvider>
  );
}
