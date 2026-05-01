"""add missing columns to user_reports

Revision ID: 0003
Revises: 0002
Create Date: 2025-05-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("user_reports", "photo_path", new_column_name="media_url")
    op.add_column("user_reports", sa.Column("ai_explanation", sa.Text(), nullable=True))
    op.add_column("user_reports", sa.Column("source", sa.String(), nullable=True, server_default="user"))


def downgrade() -> None:
    op.alter_column("user_reports", "media_url", new_column_name="photo_path")
    op.drop_column("user_reports", "ai_explanation")
    op.drop_column("user_reports", "source")