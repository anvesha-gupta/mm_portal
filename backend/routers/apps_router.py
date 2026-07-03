from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Any

from database import get_db
from dependencies.auth import get_current_user, require_permission
from models.user import User
from schemas import apps as apps_schema
from schemas.launchpad import LaunchpadAppResponse
from services import apps as apps_service
from services.app_service import AppService

router = APIRouter(prefix="/api/apps", tags=["Apps"])


@router.get(
    "/",
    response_model=list[LaunchpadAppResponse],
    summary="List accessible applications",
    description="Return applications the current user is authorized to access based on role permissions and overrides.",
)
def list_apps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    apps = AppService.get_accessible_apps(db, current_user.id)
    return [AppService.map_for_launchpad(app) for app in apps]


@router.get(
    "/search",
    response_model=list[LaunchpadAppResponse],
    summary="Search accessible applications",
    description="Perform a case-insensitive search over accessible applications by name, description, or category.",
)
def search_apps(
    q: str = Query(..., min_length=1, description="Search text for application name, description, or category."),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    accessible_apps = AppService.get_accessible_apps(db, current_user.id)
    if not accessible_apps:
        return []

    accessible_ids = {app.id for app in accessible_apps}
    search_results = AppService.search_apps(db, q)
    return [AppService.map_for_launchpad(app) for app in search_results if app.id in accessible_ids]


@router.get(
    "/{id}",
    response_model=LaunchpadAppResponse,
    summary="Get accessible application details",
    description="Return a single application when the current user is authorized to access it.",
)
def get_app(
    id: Any,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = AppService.get_app_by_id(db, id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    accessible_apps = AppService.get_accessible_apps(db, current_user.id)
    if app.id not in {accessible_app.id for accessible_app in accessible_apps}:
        raise HTTPException(status_code=403, detail="Not authorized to access this application")

    return AppService.map_for_launchpad(app)


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=apps_schema.AppResponse)
def create_app(
    payload: apps_schema.AppCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    created = apps_service.create(db, payload.dict(exclude_none=True))
    return created


@router.put("/{id}", response_model=apps_schema.AppResponse)
def update_app(
    id: Any,
    payload: apps_schema.AppUpdate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    updated = apps_service.update(db, id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="App not found or no changes provided")
    return updated


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_app(
    id: Any,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    deleted = apps_service.delete(db, id)
    if not deleted:
        raise HTTPException(status_code=404, detail="App not found")
    return


@router.post("/{id}/launch")
def launch_app(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from services.application_launch_service import ApplicationLaunchService
    return ApplicationLaunchService.get_launch_info(db, current_user, id)
