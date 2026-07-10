import {
  AuthenticationResult,
  PublicClientApplication,
} from "@azure/msal-browser";
import { loginRequest, msalConfig } from "./msalConfig";

export const msalInstance = new PublicClientApplication(msalConfig);

const PENDING_ROLE_KEY = "mm_pending_login_role";

let msalReady: Promise<AuthenticationResult | null> | null = null;

/**
 * Single MSAL bootstrap: initialize once, drain any pending redirect promise,
 * and return the redirect result (if this page load is returning from Microsoft login).
 */
export async function initializeMsal(): Promise<AuthenticationResult | null> {
  if (!msalReady) {
    msalReady = (async () => {
      await msalInstance.initialize();
      const redirectResponse = await msalInstance.handleRedirectPromise();

      if (redirectResponse?.account) {
        msalInstance.setActiveAccount(redirectResponse.account);
      } else {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          msalInstance.setActiveAccount(accounts[0]);
        }
      }

      return redirectResponse;
    })();
  }

  return msalReady;
}

/**
 * Redirect-based Microsoft sign-in. Navigates the current tab away to
 * Microsoft's login page; the browser comes back to this app afterward
 * on a fresh page load. Stashes the chosen role so it survives that reload.
 */
export async function loginWithMicrosoftRedirect(role: string): Promise<void> {
  await initializeMsal();
  sessionStorage.setItem(PENDING_ROLE_KEY, role);
  await msalInstance.loginRedirect(loginRequest);
  // Execution does not continue past this point — the browser navigates away.
}

/** Reads and clears the role that was stashed before redirecting to Microsoft. */
export function takePendingLoginRole(): string | null {
  const role = sessionStorage.getItem(PENDING_ROLE_KEY);
  sessionStorage.removeItem(PENDING_ROLE_KEY);
  return role;
}