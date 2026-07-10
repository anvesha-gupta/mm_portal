import json
import os
import urllib.parse
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from models.user import User
from models.app import App
from services.rbac_service import has_app_access


class ApplicationLaunchService:
    @staticmethod
    def get_launch_info(db: Session, user: User, app_id: str) -> dict:
        # 1. Fetch app record
        app = db.query(App).filter(App.id == app_id).one_or_none()

        if not app or not app.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application '{app_id}' not found or is currently disabled."
            )

        # 2. RBAC check
        if not has_app_access(db, user.id, app_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: You do not have permission to access '{app.name}'."
            )

        launch_type = app.launch_type
        config = {}
        try:
            config = json.loads(app.long_description or "{}")
        except Exception:
            pass

        # 3. SSO launch
        if app.sso_enabled or launch_type == "sso":
            sso_type = config.get("sso_type", "microsoft")

            if sso_type == "direct":
                # App has its own pre-built SSO entry URL (e.g. Keka)
                redirect_url = app.external_url
                if not redirect_url:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"SSO configuration missing: external_url not set for '{app.name}'."
                    )
            else:
                # Microsoft Entra ID OAuth2 SSO (all other SSO apps)
                tenant_id = os.getenv("AZURE_TENANT_ID")
                client_id = os.getenv("AZURE_CLIENT_ID")

                if not tenant_id or not client_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="SSO configuration missing: AZURE_TENANT_ID or AZURE_CLIENT_ID not set on the server."
                    )

                redirect_uri = app.external_url
                if not redirect_uri:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"SSO configuration missing: external_url not set for '{app.name}'."
                    )

                params = {
                    "client_id": client_id,
                    "response_type": "code",
                    "redirect_uri": redirect_uri,
                    "response_mode": "query",
                    "scope": "openid profile email",
                    "state": f"app_id={app.id}",
                    "login_hint": user.email,
                }
                redirect_url = (
                    f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize"
                    f"?{urllib.parse.urlencode(params)}"
                )

            return {"launch_type": "sso", "redirect_url": redirect_url}

        # 4. Internal launch
        elif launch_type == "internal":
            route = app.internal_route or (
                app.launch_url if (app.launch_url and app.launch_url.startswith("/")) else "/playbench"
            )
            return {"launch_type": "internal", "route": route}

        # 5. External launch (no SSO)
        else:
            url = app.external_url or app.launch_url or "https://placeholder.com"
            return {"launch_type": "external", "url": url}
