import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./msalConfig";

export const msalInstance = new PublicClientApplication(msalConfig);

/**
 * Initializes MSAL before the React application starts.
 * Safe to call once during application startup.
 */
export async function initializeMsal(): Promise<void> {
  await msalInstance.initialize();

  // Handle Azure redirect response (does nothing if not returning from login)
  const response = await msalInstance.handleRedirectPromise();

  if (response?.account) {
    msalInstance.setActiveAccount(response.account);
    return;
  }

  // Restore previously signed-in account
  const accounts = msalInstance.getAllAccounts();

  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }
}