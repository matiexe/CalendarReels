# Guía de Despliegue (Deploy): CalendarReels 🚀

Para publicar **CalendarReels** en internet gratis y que la creadora de videos pueda usarla desde cualquier celular o computadora, la combinación recomendada es **Supabase** (Base de datos PostgreSQL) + **Vercel** (Hosting de Next.js).

---

## Paso 1: Crear la Base de Datos en Supabase

1. Ingresa a [supabase.com](https://supabase.com/) e inicia sesión (puedes usar tu cuenta de GitHub).
2. Haz clic en **"New Project"**:
   - **Name**: `calendar-reels`
   - **Database Password**: Crea una contraseña segura y **guárdala**.
   - **Region**: Elige la más cercana (ej. *South America - São Paulo*).
3. Una vez creado el proyecto (tarda ~1 minuto), haz clic en el botón **"Connect"** arriba en la barra superior (o ve a *Project Settings -> Database*).
4. Ve a la pestaña **ORM -> Prisma** y copia las URLs de conexión:
   - Si usas el **Transaction Pooler (puerto 6543)**, tu URL tendrá este formato:
     ```env
     DATABASE_URL="postgresql://postgres.[TU-PROJECT-ID]:[TU-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
     ```
5. En tu computadora, pega esa URL dentro de tu archivo `.env` local y ejecuta en la terminal para crear la tabla `VideoOrder` en Supabase:
   ```powershell
   npm run db:push
   ```

---

## Paso 2: Subir el código a GitHub

En la carpeta `D:\Proyectos\calendarReels`, inicializa Git y súbelo a un repositorio en tu cuenta de GitHub:

```powershell
git init
git add .
git commit -m "Primera version de CalendarReels"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/calendar-reels.git
git push -u origin main
```
*(El archivo `.gitignore` ya protege tu archivo `.env` para que tus contraseñas no se suban a GitHub).*

---

## Paso 3: Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..." -> "Project"** e importa tu repositorio `calendar-reels`.
3. En la sección **"Environment Variables"** (Variables de Entorno), agrega:
   - **Key**: `DATABASE_URL`
   - **Value**: *(Pega la misma URL de conexión de Supabase del Paso 1)*
4. Haz clic en **"Deploy"**.

¡Listo! En aproximadamente 1 minuto Vercel te dará un enlace público (`https://calendar-reels-tuusuario.vercel.app`) listo para usar en el navegador del celular o PC.
