from fastapi import FastAPI
from routers.health import router as health_router
from routers.db_test import router as db_router
from routers.apps_router import router as apps_router
from routers.dashboard_router import router as dashboard_router
from routers import (
	users,
	roles,
	role_app_permissions,
	user_app_overrides,
	user_points,
	points_transactions,
	swag_items,
	swag_redemptions,
	playbench_sessions,
	playbench_messages,
	llm_models,
	audit_log,
)

app = FastAPI(title="Motiveminds Hub API")

app.include_router(health_router)
app.include_router(db_router)
app.include_router(apps_router)
app.include_router(dashboard_router)

# CRUD routers
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(role_app_permissions.router)
app.include_router(user_app_overrides.router)
app.include_router(user_points.router)
app.include_router(points_transactions.router)
app.include_router(swag_items.router)
app.include_router(swag_redemptions.router)
app.include_router(playbench_sessions.router)
app.include_router(playbench_messages.router)
app.include_router(llm_models.router)
app.include_router(audit_log.router)