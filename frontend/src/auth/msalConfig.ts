import { Configuration, RedirectRequest } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;

// Use explicit redirect URI if provided, otherwise use current origin.
// For local HTTPS this will automatically become https://localhost:5173
const redirectUri =
  import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin;

// Fail early if required environment variables are missing.
if (!clientId) {
  throw new Error(
    "VITE_AZURE_CLIENT_ID is missing. Check your frontend .env file."
  );
}

if (!tenantId) {
  throw new Error(
    "VITE_AZURE_TENANT_ID is missing. Check your frontend .env file."
  );
}

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },

  cache: {
    cacheLocation: "localStorage",
  },
};

export const loginRequest: RedirectRequest = {
  scopes: [
    "openid",
    "profile",
    "email",
    "User.Read",
  ],
};