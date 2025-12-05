import psycopg2
from psycopg2.extras import RealDictCursor

def get_connection():
    return psycopg2.connect(
        host="localhost",
        port=5432,
        database="n8n_db",
        user="n8n_user",
        password="n8n_pass",
        cursor_factory=RealDictCursor
    )
