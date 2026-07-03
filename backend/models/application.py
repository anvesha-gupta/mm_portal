# models/application.py
from sqlalchemy import Column, String, Boolean, Integer
from .database import Base

class ApplicationMaster(Base):
    __tablename__ = "application_master"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    icon = Column(String)
    category = Column(String)
    description = Column(String)
    display_order = Column(Integer)
    is_internal = Column(Boolean, default=False)
    route = Column(String, nullable=True)
    external_url = Column(String, nullable=True)
    supports_sso = Column(Boolean, default=False)
    is_enabled = Column(Boolean, default=True)
