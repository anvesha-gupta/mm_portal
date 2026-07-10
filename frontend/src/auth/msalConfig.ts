import { Configuration, LogLevel, RedirectRequest } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID as string;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID as string;
const redirectUri =
  (import.meta.env.VITE_AZURE_REDIRECT_URI as string | undefined)?.trim() ||
  "https://localhost:5173";

if (!clientId?.trim()) {
  throw new Error("VITE_AZURE_CLIENT_ID is not configured.");
}

if (!tenantId?.trim()) {
  throw new Error("VITE_AZURE_TENANT_ID is not configured.");
}

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId.trim(),
    authority: `https://login.microsoftonline.com/${tenantId.trim()}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
    navigateToLoginRequestUrl: false,
  },

  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },

  system: {
    allowRedirectInIframe: false,
    loggerOptions: {
      loggerCallback(level, message, containsPii) {
        if (containsPii) return;

        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
        }
      },
    },
  },
};

export const loginRequest: RedirectRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
  redirectUri,
  prompt: "select_account",
};