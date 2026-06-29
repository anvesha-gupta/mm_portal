from typing import Iterable
from uuid import UUID

from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from models.app import App
from services.rbac_service import get_role_permissions, get_user_role, get_user_overrides


class AppService:
    @staticmethod
    def get_all_apps(db: Session) -> list[App]:
        return (
            db.query(App)
            .filter(App.is_active.is_(True))
            .order_by(App.category_tag, App.sort_order, App.name)
            .all()
        )

    @staticmethod
    def get_app_by_id(db: Session, app_id: str) -> App | None:
        return (
            db.query(App)
            .filter(App.id == app_id, App.is_active.is_(True))
            .one_or_none()
        )

    @staticmethod
    def get_accessible_apps(db: Session, user_id: UUID) -> list[App]:
        # TODO: Replace the database role lookup with Azure AD group claims when SSO is implemented.
        role = get_user_role(db, user_id)
        if not role:
            return []

        allowed_app_ids = {permission.app_id for permission in get_role_permissions(db, role.id)}
        for override in get_user_overrides(db, user_id):
            override_type = override.override_type.lower()
            if override_type == 'grant':
                allowed_app_ids.add(override.app_id)
            elif override_type == 'revoke' and override.app_id in allowed_app_ids:
                allowed_app_ids.remove(override.app_id)

        if not allowed_app_ids:
            return []

        return (
            db.query(App)
            .filter(App.id.in_(allowed_app_ids), App.is_active.is_(True))
            .order_by(App.category_tag, App.sort_order, App.name)
            .all()
        )

    @staticmethod
    def search_apps(db: Session, search_text: str) -> list[App]:
        query_text = search_text.strip()
        if not query_text:
            return AppService.get_all_apps(db)

        pattern = f"%{query_text}%"
        return (
            db.query(App)
            .filter(
                App.is_active.is_(True),
                or_(
                    func.lower(App.name).like(func.lower(pattern)),
                    func.lower(App.description).like(func.lower(pattern)),
                    func.lower(App.category_tag).like(func.lower(pattern)),
                ),
            )
            .order_by(App.category_tag, App.sort_order, App.name)
            .all()
        )

    @staticmethod
    def map_for_launchpad(app: App) -> dict:
        return {
            'id': app.id,
            'display_name': app.name,
            'description': app.description,
            'category': app.category_tag,
            'launch_url': app.launch_url,
            'icon': app.icon_name,
            'is_internal': bool(app.launch_url and app.launch_url.startswith('/')),
            'display_order': app.sort_order,
        }
