"""add scan ownership

Revision ID: 06c5e72e1005
Revises: 3d85cfff7be1
Create Date: 2026-09-18 14:42:12.489582

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "06c5e72e1005"
down_revision: Union[str, Sequence[str], None] = "412d30bf68c9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add ownership information to existing scans."""

    # Add the column as nullable first because existing scan records
    # do not have a user_id yet.
    op.add_column(
        "scans",
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
    )

    # Existing scans were created before scan ownership existed.
    # Assign them to the existing John user.
    op.execute(
        """
        UPDATE scans
        SET user_id = '2bd63f5a-a32b-45f8-afe1-7926ceba56f4'::uuid
        WHERE user_id IS NULL
        """
    )

    # Every existing scan now has an owner, so make the column mandatory.
    op.alter_column(
        "scans",
        "user_id",
        existing_type=postgresql.UUID(as_uuid=True),
        nullable=False,
    )

    # Enforce referential integrity with the users table.
    op.create_foreign_key(
        "fk_scans_user_id_users",
        "scans",
        "users",
        ["user_id"],
        ["id"],
    )

    # Speed up ownership-based queries.
    op.create_index(
        "ix_scans_user_id",
        "scans",
        ["user_id"],
    )


def downgrade() -> None:
    """Remove scan ownership."""

    op.drop_index(
        "ix_scans_user_id",
        table_name="scans",
    )

    op.drop_constraint(
        "fk_scans_user_id_users",
        "scans",
        type_="foreignkey",
    )

    op.drop_column(
        "scans",
        "user_id",
    )