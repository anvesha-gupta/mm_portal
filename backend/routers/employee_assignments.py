from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any
from uuid import UUID

from database import get_db
from dependencies.auth import require_permission
from models.user import User
from services import employee_assignments as svc
from schemas import employee_assignments as schema

router = APIRouter(prefix="/api/employee_assignments", tags=["EmployeeAssignments"])


@router.get("/", response_model=list[schema.EmployeeAssignmentResponse])
def list_items(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    return svc.get_all(db)


@router.get("/{employee_id}/{llm_id}", response_model=schema.EmployeeAssignmentResponse)
def get_item(
    employee_id: UUID,
    llm_id: str,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    item = svc.get_by_ids(db, employee_id, llm_id)
    if not item:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return item


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schema.EmployeeAssignmentResponse)
def create_item(
    payload: schema.EmployeeAssignmentCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    # Check if assignment already exists
    existing = svc.get_by_ids(db, payload.employee_id, payload.llm_id)
    if existing:
        raise HTTPException(status_code=400, detail="Assignment already exists for this employee and model")
    return svc.create(db, payload.dict())


@router.put("/{employee_id}/{llm_id}", response_model=schema.EmployeeAssignmentResponse)
def update_item(
    employee_id: UUID,
    llm_id: str,
    payload: schema.EmployeeAssignmentUpdate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    updated = svc.update(db, employee_id, llm_id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return updated


@router.delete("/{employee_id}/{llm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    employee_id: UUID,
    llm_id: str,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    deleted = svc.delete(db, employee_id, llm_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return


@router.post("/reset")
def reset_quotas(
    employee_id: UUID | None = None,
    llm_id: str | None = None,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    from sqlalchemy import text
    if employee_id and llm_id:
        db.execute(
            text(
                """
                UPDATE public.employee_assignments
                SET used_tokens = 0, remaining_tokens = assigned_tokens
                WHERE employee_id = :employee_id AND llm_id = :llm_id
                """
            ),
            {"employee_id": employee_id, "llm_id": llm_id},
        )
    elif employee_id:
        db.execute(
            text(
                """
                UPDATE public.employee_assignments
                SET used_tokens = 0, remaining_tokens = assigned_tokens
                WHERE employee_id = :employee_id
                """
            ),
            {"employee_id": employee_id},
        )
    else:
        db.execute(
            text(
                """
                UPDATE public.employee_assignments
                SET used_tokens = 0, remaining_tokens = assigned_tokens
                """
            )
        )
    db.commit()
    return {"message": "Quotas reset successfully"}
