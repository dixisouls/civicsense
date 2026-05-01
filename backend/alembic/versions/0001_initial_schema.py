"""initial schema: enable postgis, create cases and user_reports

Revision ID: 0001
Revises: 
Create Date: 2025-05-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable PostGIS - must happen before any GEOGRAPHY column creation
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    # Table: cases
    op.create_table(
        "cases",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("case_id", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("opened_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("neighborhood", sa.String(), nullable=True),
        sa.Column(
            "location",
            geoalchemy2.types.Geography(geometry_type="POINT", srid=4326),
            nullable=True,
        ),
        sa.Column("source", sa.String(), nullable=True, server_default="311"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_cases_id", "cases", ["id"])
    op.create_index("ix_cases_case_id", "cases", ["case_id"], unique=True)
    op.create_index("ix_cases_category", "cases", ["category"])
    op.create_index("ix_cases_status", "cases", ["status"])
    op.create_index("ix_cases_neighborhood", "cases", ["neighborhood"])
    op.create_index(
        "ix_cases_location",
        "cases",
        ["location"],
        postgresql_using="gist",
    )

    # Table: user_reports
    op.create_table(
        "user_reports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=True),
        sa.Column("severity", sa.String(), nullable=True),
        sa.Column("ai_label", sa.String(), nullable=True),
        sa.Column("ai_confidence", sa.Float(), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("neighborhood", sa.String(), nullable=True),
        sa.Column(
            "location",
            geoalchemy2.types.Geography(geometry_type="POINT", srid=4326),
            nullable=True,
        ),
        sa.Column("photo_path", sa.Text(), nullable=True),
        sa.Column("status", sa.String(), nullable=True, server_default="stub: submitted"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=True,
        ),
        sa.Column("is_duplicate", sa.Boolean(), nullable=True, server_default="false"),
        sa.Column("duplicate_of_case_id", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_reports_id", "user_reports", ["id"])
    op.create_index("ix_user_reports_user_id", "user_reports", ["user_id"])
    op.create_index("ix_user_reports_category", "user_reports", ["category"])
    op.create_index(
        "ix_user_reports_location",
        "user_reports",
        ["location"],
        postgresql_using="gist",
    )


def downgrade() -> None:
    op.drop_table("user_reports")
    op.drop_table("cases")
    op.execute("DROP EXTENSION IF EXISTS postgis")