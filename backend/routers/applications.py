# routers/applications.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .dependencies import get_db, get_current_user
from ..models.application import ApplicationMaster
from ..schemas.application import Application, LaunchResponse

router = APIRouter()

@router.get("/applications", response_model=list[Application])
def list_applications(db: Session = Depends(get_db)):
    return db.query(ApplicationMaster).all()

@router.post("/applications/{app_id}/launch", response_model=LaunchResponse)
def launch_application(app_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    app = db.query(ApplicationMaster).filter_by(id=app_id).first()
    if not app or not app.is_enabled:
        raise HTTPException(status_code=404, detail="Application not found")

    # RBAC check
    if not user.has_access(app_id):
        raise HTTPException(status_code=403, detail="Access denied")

    if app.supports_sso:
        # TODO: Implement proper SSO redirect logic
        return {"launchUrl": f"https://sso.company.com/{app_id}"}
    elif app.external_url:
        return {"launchUrl": app.external_url}
    elif app.route:
        return {"launchUrl": app.route}
    else:
        raise HTTPException(status_code=400, detail="Invalid app configuration")
