// src/theme.js
import { createTheme } from "@mui/material/styles";

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          primary: { main: "#2563eb" },
          background: { default: "#f3f4f6", paper: "#fff" },
          text: { primary: "#0f172a" },
        }
      : {
          primary: { main: "#60a5fa" },
          background: { default: "#0b1220", paper: "#071024" },
          text: { primary: "#e6eef8" },
        }),
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial',
  },
  shape: { borderRadius: 12 },
});
