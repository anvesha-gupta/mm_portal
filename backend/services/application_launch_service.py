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
        # 1. Read Application Master details
        app = db.query(App).filter(App.id == app_id).one_or_none()
        
        # 2. If application not found or disabled -> Return 404
        if not app or not app.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Application '{app_id}' not found or is currently disabled."
            )
            
        # 3. Check permissions (RBAC) -> Return 403 if user has no access
        if not has_app_access(db, user.id, app_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: You do not have permission to access the application '{app.name}'."
            )
            
        # 4. Determine launch type
        launch_type = app.launch_type
        
        # 5. Handle SSO launch type
        if app.sso_enabled or launch_type == "sso":
            # For internally hosted Entra ID apps (like Wyngs and Estimatrix)
            if app.id in ["wyngs", "estimatrix"]:
                tenant_id = os.getenv("AZURE_TENANT_ID")
                client_id = os.getenv("AZURE_CLIENT_ID")
                
                if not tenant_id or not client_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="SSO configuration missing: Microsoft Entra ID configuration (AZURE_TENANT_ID or AZURE_CLIENT_ID) is not set on the server."
                    )
                    
                redirect_uri = app.external_url
                if not redirect_uri:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"SSO configuration missing: external_url is not configured for the application '{app.name}'."
                    )
                    
                state = f"app_id={app.id}"
                params = {
                    "client_id": client_id,
                    "response_type": "code",
                    "redirect_uri": redirect_uri,
                    "response_mode": "query",
                    "scope": "openid profile email",
                    "state": state
                }
                
                redirect_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize?{urllib.parse.urlencode(params)}"
            else:
                # For SaaS apps with pre-configured SSO entrypoint (like Keka)
                redirect_url = app.external_url
                if not redirect_url:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"SSO configuration missing: external_url is not configured for SSO-enabled SaaS application '{app.name}'."
                    )
                    
            return {
                "launch_type": "sso",
                "redirect_url": redirect_url
            }
            
        # 6. Handle Internal launch type
        elif launch_type == "internal":
            route = app.internal_route
            if not route:
                # Fallback to launch_url or root
                route = app.launch_url if (app.launch_url and app.launch_url.startswith('/')) else "/playbench"
                
            return {
                "launch_type": "internal",
                "route": route
            }
            
        # 7. Handle External launch type (without SSO)
        else:
            url = app.external_url
            if not url:
                # Fallback to launch_url
                url = app.launch_url if app.launch_url else "https://placeholder.com"
                
            return {
                "launch_type": "external",
                "url": url
            }
