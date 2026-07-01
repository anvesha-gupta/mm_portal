import {
  PublicClientApplication,
  AccountInfo,
  RedirectRequest,
} from "@azure/msal-browser";
import { loginRequest } from "./msalConfig";

export interface AuthUser {
  account: AccountInfo;
  token: string | null;
}

export default class AuthService {
  constructor(private msal: PublicClientApplication) {}

  async initialize(): Promise<void> {
    await this.msal.initialize();
    const redirectResponse = await this.msal.handleRedirectPromise();

    if (redirectResponse?.account) {
      this.msal.setActiveAccount(redirectResponse.account);
    }
  }

  async login(): Promise<void> {
    await this.msal.loginRedirect(loginRequest as RedirectRequest);
  }

  async logout(): Promise<void> {
    await this.msal.logoutRedirect();
  }

  async getUser(): Promise<AuthUser | null> {
    const account = this.msal.getActiveAccount() || this.msal.getAllAccounts()[0];
    if (!account) {
      return null;
    }

    let token: string | null = null;

    try {
      const result = await this.msal.acquireTokenSilent({
        account,
        scopes: loginRequest.scopes,
      });
      token = result.accessToken || result.idToken || null;
    } catch (error) {
      console.warn("Silent token acquisition failed:", error);
    }

    return { account, token };
  }

  async getAccessToken(): Promise<string | null> {
    const account = this.msal.getActiveAccount() || this.msal.getAllAccounts()[0];
    if (!account) {
      return null;
    }

    try {
      const result = await this.msal.acquireTokenSilent({
        account,
        scopes: loginRequest.scopes,
      });
      return result.accessToken || result.idToken || null;
    } catch (error) {
      console.warn("Failed to acquire access token silently:", error);
      return null;
    }
  }
}
