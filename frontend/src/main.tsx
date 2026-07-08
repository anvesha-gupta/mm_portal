import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { MsalProvider } from "@azure/msal-react";

import App from "./App";
import theme from "./theme";
import { AuthProvider } from "./auth/AuthProvider";
import { msalInstance } from "./auth/msalInstance";
import { PointsProvider } from "./context/PointsContext";

async function bootstrap() {
  await msalInstance.initialize();

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
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
      </MsalProvider>
    </React.StrictMode>
  );
}

bootstrap();