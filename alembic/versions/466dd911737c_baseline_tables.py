"""baseline tables

Revision ID: 466dd911737c
Revises: 
Create Date: 2025-09-25 13:51:59.417353

"""
from typing import Sequence, Union



# revision identifiers, used by Alembic.
revision: str = '466dd911737c'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    from alembic import op
    import sqlalchemy as sa
    
    op.create_table(
        'audits',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('event', sa.String(length=100), nullable=False),
        sa.Column('payload', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table(
        'action_plans',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('sender_email', sa.String(length=320), nullable=False),
        sa.Column('action', sa.String(length=32), nullable=False),
        sa.Column('reason', sa.String(length=200), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table(
        'undo_windows',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('decision_id', sa.Integer(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    from alembic import op
    
    op.drop_table('undo_windows')
    op.drop_table('action_plans')
    op.drop_table('audits')
