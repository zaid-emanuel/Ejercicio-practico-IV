import os

import pymysql
from pymysql.cursors import DictCursor

# Los valores de conexion se leen de variables de entorno.
# Si no existen (por ejemplo, en desarrollo local sin configurar nada),
# se usan estos valores por defecto como respaldo.
DB_CONFIG = {
    "host": os.environ.get("MYSQLHOST", "altaria.proxy.rlwy.net"),
    "user": os.environ.get("MYSQLUSER", "root"),
    "password": os.environ.get("MYSQLPASSWORD", "tfkOlWTJHggDXfgdegTVXMzOgkMCXWQw"),
    "database": os.environ.get("MYSQLDATABASE", "railway"),
    "port": int(os.environ.get("MYSQLPORT", 50222)),
    "cursorclass": DictCursor,
}


def get_connection():
    return pymysql.connect(**DB_CONFIG)