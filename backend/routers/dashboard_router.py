from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user
from models.user import User
from schemas.launchpad import LaunchpadAppCategoryResponse
from services.app_service import AppService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/apps",
    response_model=list[LaunchpadAppCategoryResponse],
    summary="List dashboard applications",
    description=(
        "Return applications accessible to the current user grouped by category. "
        "Applications are filtered using RBAC role permissions and user overrides, and sorted by display order."
    ),
)
def get_dashboard_apps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    accessible_apps = AppService.get_accessible_apps(db, current_user.id)
    grouped_apps: dict[str, list] = defaultdict(list)

    for app in accessible_apps:
        category = app.category_tag or "Other"
        grouped_apps[category].append(app)

    grouped_response = []
    for category, apps in grouped_apps.items():
        sorted_apps = sorted(apps, key=lambda item: (item.sort_order, item.name or ""))
        grouped_response.append(
            {
                "category": category,
                "applications": [AppService.map_for_launchpad(app) for app in sorted_apps],
            }
        )

    grouped_response.sort(
        key=lambda group: (
            group["applications"][0]["display_order"] if group["applications"] else 0,
            group["category"],
        )
    )

    return grouped_response
