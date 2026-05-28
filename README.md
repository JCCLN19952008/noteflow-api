# NoteFlow API

Este es el Back-End para las REST APIs que componen la parte no visible de NoteFlow, desarrollado en reposiotrio separado del original que aloja la aplicacion, desarrollada de manera nativa para Android. Se ha desarrollado con  Next.js API Routes, Prisma, y una base de datos Neon empleando  PostgreSQL.Despliegue realizado en Vercel.

**Notion Pages**
https://www.notion.so/NoteFlow-API-Setup-368d747a11da806c8049f1cce1683419?source=copy_link

https://www.notion.so/NoteFlow-API-Dev-Log-368d747a11da803395aae49c8cfb7800?source=copy_link


---

## Tech Stack

| Herramienta | Proposito |
|---|---|
| Next.js 16 (App Router) | Entorno para API Routes |
| Prisma | Mapeo objeto.relacional y migracion de  base de datos desde LocalStorage |
| Neon |  Base de Datos basada en PostgreSQL ; de tipo serverless  |
| Vercel | Despliegue y hosting de la app , interfa grafica no es representada en esta debido a ser una aplicacion nativa solo emulable en dispositivo Android |
| AWS S3 | Almacenamiento de imágenes adjuntas a las notas |
| Bruno | Testeo de las APIs |

---

## Live URL

https://noteflow-api-ten.vercel.app


---

## Endpoints
### Notes

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/api/notes` | Recopila todas las notas existentes, con y sin tags |
| POST | `/api/notes` | Crea una nueva nota |
| PATCH | `/api/notes/[id]` | Actualiza el titulo, el cuerpo de la nota y, en su caso, el tag |
| DELETE | `/api/notes/[id]` | Borrar una nota |
| PATCH | `/api/notes/[id]/pin` | Funcionalidad de pin de notas |

![Screenshot-BrunoAPI](assets/screenshots/Screenshot-BrunoAPI.png)

### Tags

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/api/tags` | Recopila todo los tags |
| POST | `/api/tags` | Crea un nuevo tag |
| DELETE | `/api/tags/[id]` | Borra un  tag |

### Imágenes

| Metodo | Endpoint | Descripcion |
|---|---|---|
| POST | `/api/upload` | Sube una imagen a AWS S3 y devuelve la URL pública |


---

## Schema de la Base de Datos

Dos tablas con cardinalidad relacional M-M, configurada por Prisma. Cada nota y tag incluye un `userId` vinculado al UID de Firebase Auth, garantizando el aislamiento de datos entre cuentas:

- **Note** — Sus atributos: id, userId, title, body, pinned, imageUrl, createdAt y  updatedAt-
- **Tag** — Sus atributos: id, userId, label, color y createdAt.
- **_NoteTags** — La operación "join" es automáticamente gestionada por Prisma.


![Screenshot-NeonDB](assets/screenshots/Screenshot-NeonDB.png)

![Screenshot-NeonDBTable](assets/screenshots/Screenshot-NeonDBTable.png)

![Screenshot-PrismaConfig](assets/screenshots/Screenshot-PrismaConfig.png)

![Screenshot-PrismaSchema](assets/screenshots/Screenshot-PrismaSchema.png)

---

## Servicios Externos

### Firebase Auth

La API no gestiona autenticación directamente — eso lo hace Firebase Auth en el cliente. Sin embargo, todos los endpoints de notas y tags reciben un `userId` (el UID generado por Firebase) que se usa para filtrar los datos en la base de datos. Esto garantiza que cada usuario solo acceda a sus propias notas y tags.

### AWS S3

El endpoint `/api/upload` recibe una imagen desde la app, la sube al bucket `noteflow-images` en S3 bajo una carpeta con el `userId` del usuario, y devuelve la URL pública de la imagen. Las credenciales de AWS se configuran como variables de entorno en Vercel y nunca se exponen al cliente.

---

## Variables de Entorno en Vercel

DATABASE_URL=neon_connection_string
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=eu-central-1
AWS_BUCKET_NAME=noteflow-images


## Local Development

```bash
# Instalar depednencias
npm install

# Set up de las Variables de Entorno
# Crear .env con:
DATABASE_URL="neon_connection_string"

# Ejecutar la migracion de base de datos
npx prisma migrate dev

# Arrancar el server de desarrollo
npm run dev
```

El server corre en la direccion: `http://localhost:3000`.


![Screenshot-NextJS](assets/screenshots/Screenshot-NextJS.png)
---

## Despliegue

Desplegado automaticamente a  Vercel con cada psuhal repo remoto en Github, en la rama  `main`. La `DATABASE_URL` variable de entorno esta configurada dentro de los ajustes de proyecto de Vercel.

![Screenshot-Vercel](assets/screenshots/Screenshot-Vercel.png)

---