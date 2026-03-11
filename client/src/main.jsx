import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./state/auth.jsx";
import { ThemeProvider } from "./state/theme.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                fontFamily: "'Courier Prime', 'Courier New', monospace",
                fontSize: "13px",
                letterSpacing: "0.02em",
                borderRadius: "3px",
                border: "1px solid",
                boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                padding: "10px 14px",
              },
              success: {
                style: {
                  background: "#f0f7f0",
                  color: "#2d6a2d",
                  borderColor: "#a8d5a8",
                },
                iconTheme: {
                  primary: "#2d6a2d",
                  secondary: "#f0f7f0",
                },
              },
              error: {
                style: {
                  background: "#fdf0f0",
                  color: "#8b1a1a",
                  borderColor: "#e0a0a0",
                },
                iconTheme: {
                  primary: "#8b1a1a",
                  secondary: "#fdf0f0",
                },
              },
              loading: {
                style: {
                  background: "#faf6ee",
                  color: "#2c1a0e",
                  borderColor: "#c4aa88",
                },
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
