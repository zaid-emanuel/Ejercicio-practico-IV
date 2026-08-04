# Mecanografía

Aplicación Flask para medir la velocidad de escritura en palabras por minuto.

Ejecuta `database.sql` en tu servidor MySQL (por ejemplo desde MySQL Workbench o `mysql -u root -p < database.sql`). Esto crea la base de datos, las tablas y algunos textos de ejemplo.

Abre `config.py` y ajusta `host`, `user`, `password` y `port` según tu instalación de MySQL.

4. Levanta la aplicación:

```
python app.py
```

5. Entra a `http://localhost:5000`.

## Estructura de la base de datos

- **Usuario**: datos de la cuenta (nombre, edad, usuario, contraseña con hash).
- **Texto**: textos disponibles para practicar, separados por tipo (`codigo`, `plano`, `personalizado`).
- **Marcador**: resultados de las pruebas, cada fila liga un `usuario_id` con la velocidad obtenida.

## Flujo de la aplicación

1. Login / registro de usuario.
2. Menú con tres tipos de práctica: código Python, texto plano o un archivo propio (.txt / .py).
3. Prueba de escritura palabra por palabra durante 60 segundos, con conteo regresivo y barra de progreso.
4. Al terminar el tiempo (o el texto), se calculan las palabras por minuto y se guardan en `Marcador`.


# ACTIVIDAD

## Errores

Cambiar el color del botón ‘Entrar’ en la página principal a un color de la paleta de la aplicación.

Cambiar el texto que está mal escrito en la página en donde el usuario elige el tipo de texto que quiere escribir. El texto debe decir “**¿Con qué texto quieres practicar?**”.

## Modificaciones

El texto que se desea escribir se debe mostrar oración por oración (una sola línea a la vez).

El texto que muestra el tiempo (60s) debe mostrarse más grande

Mover la base de datos local a un servidor en railway.

## Nuevas funciones

Después de los 4 intentos fallidos de inicio sesion, se debe bloquear la cuenta. 

Después de atinar 4 palabras seguidas añadir un símbolo o animación de racha.

Al terminar el test, se debe de mostrar una imagen alusiva a la velocidad del usuario de acuerdo a la siguiente relación:
Caracol <30 p/m

Liebre>31 p/m

Chita >60 p/m
