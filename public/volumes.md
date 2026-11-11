# Volúmenes en Docker

## Fundamentos

Un contenedor es **efímero**: la capa donde escribe el proceso vive dentro del contenedor. Si lo eliminas (`docker rm`), todo lo que se guardó ahí desaparece.

Además, cada vez que reconstruyes una imagen y recreas el contenedor, empiezas de cero. Eso está bien para el código, pero **no** para:

- Una base de datos.
- Archivos que sube el usuario.
- Cualquier dato que deba sobrevivir a un reinicio.

Un **volumen** es un almacenamiento que vive **fuera** del contenedor y se "conecta" a él. El contenedor va y viene; el volumen se queda.

## Tipos de montajes

En Docker hay cuatro formas de conectar almacenamiento a un contenedor. Se configuran con `-v` o `--mount` (ver sección 3).

| Tipo                 | Ejemplo (compose)   | ¿Dónde vive?                  | ¿Lo maneja? | Sobrevive a `docker rm` |
| -------------------- | ------------------- | ----------------------------- | ----------- | ----------------------- |
| **Volumen nombrado** | `datos:/data`       | Área de Docker (`volume ls`)  | Docker      | Sí                      |
| **Volumen anónimo**  | `/app/node_modules` | Área de Docker, con ID random | Docker      | Solo si no lo borras    |
| **Bind mount**       | `.:/app`            | Una carpeta tuya del host     | Tú          | Sí (es tu carpeta)      |
| **tmpfs**            | `tmpfs: /tmp`       | Memoria RAM                   | Docker      | No (se borra al parar)  |

### Volumen nombrado

Tiene nombre (`datos`) y Docker decide dónde guardarlo físicamente. Es la opción recomendada para **datos persistentes** (bases de datos, uploads). Es portable: no depende de rutas de tu máquina.

### Volumen anónimo

Igual que el anterior pero sin nombre; Docker le asigna un ID. Útil para "tapar" una carpeta del contenedor sin que la del host la sobrescriba (ver `node_modules` en la sección 5).

### Bind mount

Montas una carpeta **tuya** del host dentro del contenedor (`.:/app` significa "el directorio actual del host → `/app` del contenedor"). Perfecto para **desarrollo**: editas en tu editor y el cambio aparece dentro del contenedor al instante. En producción suele ser mala idea, porque ata el contenedor a una ruta concreta del servidor.

## En Docker Compose

Un servicio puede declarar sus montajes en `volumes:` y los volúmenes **nombrados** deben además declararse al final del archivo:

```yaml
services:
    api:
        volumes:
            - .:/app # bind mount
            - /app/node_modules # volumen anónimo
            - datos:/data # volumen nombrado

volumes:
    datos: # aquí Docker crea el volumen con este nombre
```

Sin la declaración global, `datos` no es un volumen nombrado.

## En este proyecto

Mirando `docker-compose.yml`:

```yaml
volumes:
    - .:/app # bind mount
    - /app/node_modules # volumen anónimo
```

- **`.:/app` (bind mount):** el código de tu máquina se monta en el contenedor. Editas `src/*.ts` y el watcher recompila y reinicia solo (hot reload).
- **`/app/node_modules` (volumen anónimo):** "tapa" la carpeta `node_modules` del host para que no se mezcle con la del contenedor. Así se usan las dependencias instaladas dentro de la imagen y no las de tu máquina.

> Este proyecto guarda los datos **en memoria** (repositorios con diccionarios), así que no necesita un volumen nombrado para persistir nada: al reiniciar, los datos se pierden.

## Casos de uso típicos

| Necesito...                                        | Uso                                            |
| -------------------------------------------------- | ---------------------------------------------- |
| Que una base de datos no se borre                  | Volumen nombrado (`db-data:/var/lib/...`)      |
| Editar código con hot reload                       | Bind mount (`.:/app`)                          |
| Aislar `node_modules` del host                     | Volumen anónimo (`/app/node_modules`)          |
| Leer una config sin que el contenedor la modifique | Bind mount en solo lectura (`./conf:/conf:ro`) |
| Datos temporales muy rápidos                       | tmpfs                                          |
