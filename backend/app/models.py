from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    String,
    Numeric,
    JSON,
    TIMESTAMP,
    ForeignKey,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.database import Base, DATABASE_URL

if DATABASE_URL.startswith("sqlite"):
    from sqlalchemy.types import TypeDecorator
    from geoalchemy2.elements import WKTElement
    from geoalchemy2.shape import to_shape

    class SQLiteGeometry(TypeDecorator):
        impl = Text
        cache_ok = True

        def process_bind_param(self, value, dialect):
            if value is None:
                return None
            if isinstance(value, str):
                return value
            if hasattr(value, "desc"):
                s = to_shape(value)
                return s.wkt
            if hasattr(value, "wkt"):
                return value.wkt
            return str(value)

        def process_result_value(self, value, dialect):
            if value is None:
                return None
            return WKTElement(value, srid=4326)

    GeometryColumnType = SQLiteGeometry
else:
    from geoalchemy2 import Geometry
    GeometryColumnType = Geometry(geometry_type="POLYGON", srid=4326)


class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True)
    ulpin = Column(String(32), unique=True, index=True, nullable=False)
    geometry = Column(GeometryColumnType, nullable=False)

    area_sqm = Column(Numeric, nullable=True)
    owner_name = Column(String(200), nullable=True)
    village_or_city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)

    ror_data = Column(JSON, nullable=True)
    encumbrance_data = Column(JSON, nullable=True)
    land_use = Column(String(100), nullable=True)
    property_tax_due = Column(Numeric, default=0)

    region_key = Column(String(50), index=True, nullable=True)
    parcel_id = Column(String(50), nullable=True)
    khasra_no = Column(String(50), nullable=True)
    sector = Column(String(100), nullable=True)
    survey_agency = Column(String(200), nullable=True)
    survey_date = Column(String(20), nullable=True)
    dispute_flag = Column(Boolean, default=False, nullable=False)
    boundary_source = Column(String(300), nullable=True)
    centroid_lat = Column(Numeric(10, 7), index=True, nullable=True)
    centroid_lon = Column(Numeric(10, 7), index=True, nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.now())

    department_records = relationship(
        "DepartmentRecord",
        back_populates="parcel",
        cascade="all, delete-orphan",
        lazy="joined"
    )
    mutations = relationship(
        "Mutation",
        back_populates="parcel",
        cascade="all, delete-orphan",
        lazy="joined"
    )


class DepartmentRecord(Base):
    __tablename__ = "department_records"

    id = Column(Integer, primary_key=True, index=True)
    ulpin = Column(String(32), ForeignKey("parcels.ulpin", ondelete="CASCADE"), index=True, nullable=False)
    department_name = Column(String(100), nullable=False, index=True)
    owner_name = Column(String(200), nullable=False)
    land_use = Column(String(100), nullable=True)
    area_sqm = Column(Numeric, nullable=True)
    record_status = Column(String(50), default="ACTIVE")
    record_details = Column(JSON, nullable=True)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    parcel = relationship("Parcel", back_populates="department_records")


class Mutation(Base):
    __tablename__ = "mutations"

    id = Column(Integer, primary_key=True, index=True)
    mutation_id = Column(String(50), unique=True, index=True, nullable=False)
    ulpin = Column(String(32), ForeignKey("parcels.ulpin", ondelete="CASCADE"), index=True, nullable=False)
    old_owner = Column(String(200), nullable=False)
    proposed_new_owner = Column(String(200), nullable=False)
    department = Column(String(100), default="Revenue", nullable=False)
    submitted_at = Column(TIMESTAMP, default=lambda: datetime.now(timezone.utc), nullable=False)
    sla_days = Column(Integer, default=7, nullable=False)
    sla_deadline = Column(TIMESTAMP, nullable=False)
    status = Column(String(50), default="PENDING", nullable=False)
    resolved_at = Column(TIMESTAMP, nullable=True)
    remarks = Column(String(500), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    parcel = relationship("Parcel", back_populates="mutations")


class CitizenGrievance(Base):
    __tablename__ = "citizen_grievances"

    id = Column(Integer, primary_key=True, index=True)
    tracking_id = Column(String(50), unique=True, index=True, nullable=False)
    ulpin = Column(String(32), ForeignKey("parcels.ulpin", ondelete="CASCADE"), index=True, nullable=False)
    citizen_name = Column(String(200), nullable=True)
    phone = Column(String(50), nullable=True)
    discrepancy_type = Column(String(100), nullable=False)
    description = Column(String(1000), nullable=True)
    status = Column(String(50), default="PENDING")
    created_at = Column(TIMESTAMP, server_default=func.now())

    parcel = relationship("Parcel", backref="grievances")
