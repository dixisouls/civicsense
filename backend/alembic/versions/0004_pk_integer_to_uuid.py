"""alter cases and user_reports primary key from INTEGER to UUID

Revision ID: 0004
Revises: 0003
Create Date: 2026-04-30

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- cases ---
    op.drop_index("ix_cases_id", table_name="cases")
    op.drop_constraint("cases_pkey", "cases", type_="primary")
    op.drop_column("cases", "id")
    op.add_column(
        "cases",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
    )
    op.create_primary_key("cases_pkey", "cases", ["id"])

    # --- user_reports ---
    op.drop_index("ix_user_reports_id", table_name="user_reports")
    op.drop_constraint("user_reports_pkey", "user_reports", type_="primary")
    op.drop_column("user_reports", "id")
    op.add_column(
        "user_reports",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
    )
    op.create_primary_key("user_reports_pkey", "user_reports", ["id"])


def downgrade() -> None:
    # --- user_reports ---
    op.drop_constraint("user_reports_pkey", "user_reports", type_="primary")
    op.drop_column("user_reports", "id")
    op.add_column(
        "user_reports",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
        ),
    )
    op.create_primary_key("user_reports_pkey", "user_reports", ["id"])

    # --- cases ---
    op.drop_constraint("cases_pkey", "cases", type_="primary")
    op.drop_column("cases", "id")
    op.add_column(
        "cases",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
        ),
    )
    op.create_primary_key("cases_pkey", "cases", ["id"])
