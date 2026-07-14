import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { MsalProvider } from "@azure/msal-react";

import App from "./App";
import { createAppTheme } from "./theme";
import { AuthProvider } from "./auth/AuthProvider";
import { msalInstance } from "./auth/msalInstance";
import { PointsProvider } from "./context/PointsContext";
import { ColorModeProvider, useColorMode } from "./context/ColorModeContext";

function ThemedApp() {
  const { mode } = useColorMode();
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <PointsProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </PointsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <ColorModeProvider>
        <ThemedApp />
      </ColorModeProvider>
    </MsalProvider>
  </React.StrictMode>
);
