"""Remove phone field from User model

Revision ID: 71d1cd6a687b
Revises: 2d7b9d60515d
Create Date: 2024-12-17 21:47:15.455527

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '71d1cd6a687b'
down_revision = '2d7b9d60515d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('phone')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('phone', mysql.VARCHAR(length=20), nullable=True))

    # ### end Alembic commands ###
