# CalendarReels 🎬📅

Aplicación web creada con **Next.js (App Router) + TypeScript**, **Tailwind CSS** y **Prisma ORM + Supabase (PostgreSQL)** para que una creadora de videos pueda organizar sus pedidos en un calendario interactivo y registrar el precio e ingresos de cada video creado.

## 🚀 Cómo iniciar el proyecto

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Genera el cliente de Prisma:
   ```bash
   npx prisma generate
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🗄️ Conexión con Supabase / PostgreSQL

- **Modo Local Automático**: Si aún no has configurado tu `DATABASE_URL` en el archivo `.env`, la aplicación funcionará automáticamente guardando los pedidos en `data/orders.json` para que puedas usarla y probarla desde el primer minuto.
- **Conectar a Supabase**:
  1. Crea un proyecto gratis en [Supabase](https://supabase.com/).
  2. Copia la URL de conexión PostgreSQL (`Settings` -> `Database` -> `Connection string` -> `URI`).
  3. Pégala en el archivo `.env`:
     ```env
     DATABASE_URL="postgresql://postgres.[TU-PROYECTO]:[TU-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
     ```
  4. Sincroniza las tablas con tu base de datos:
     ```bash
     npm run db:push
     ```
