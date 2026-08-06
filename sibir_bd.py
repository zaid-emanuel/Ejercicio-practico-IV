import os

import pymysql

conexion = pymysql.connect(
    host=os.environ.get("MYSQLHOST", "altaria.proxy.rlwy.net"),
    port=int(os.environ.get("MYSQLPORT", 50222)),
    user=os.environ.get("MYSQLUSER", "root"),
    password=os.environ.get("MYSQLPASSWORD", "tfkOlWTJHggDXfgdegTVXMzOgkMCXWQw"),
    database=os.environ.get("MYSQLDATABASE", "railway"),
)

with open("database.sql", "r", encoding="utf-8") as archivo:
    contenido = archivo.read()

# Separa el script en sentencias individuales
sentencias = [s.strip() for s in contenido.split(";") if s.strip()]

try:
    with conexion.cursor() as cursor:
        for sentencia in sentencias:
            # Salta las lineas de crear/usar base de datos, Railway ya nos dio una
            if sentencia.upper().startswith("CREATE DATABASE") or sentencia.upper().startswith("USE "):
                continue
            cursor.execute(sentencia)
    conexion.commit()
    print("Base de datos subida correctamente a Railway.")
finally:
    conexion.close()