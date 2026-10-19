# Plan de Proyecto: CalendarReels 🎬📅

Aplicación web diseñada para que una creadora de contenido/videos pueda organizar sus pedidos en un calendario interactivo, llevar el seguimiento de entregas y registrar el precio de cada video creado.

---

## 1. Stack Tecnológico Elegido

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework Fullstack** | **Next.js (App Router) + TypeScript** | Interfaz en React y rutas de servidor (Server Actions / API Routes) en un solo proyecto tipado. |
| **Estilos y UI** | **Tailwind CSS + shadcn/ui + Lucide Icons** | Diseño moderno, adaptable a móvil y escritorio, con modales, formularios y selectores accesibles. |
| **Calendario & Fechas** | **date-fns** + Vista de Calendario personalizada | Visualización mensual/semanal clara de los pedidos agendados por fecha de entrega o grabación. |
| **Base de Datos & ORM** | **PostgreSQL (Supabase) + Prisma ORM** | Almacenamiento relacional seguro en la nube y consultas tipadas desde Next.js. |

---

## 2. Modelo de Datos (`prisma/schema.prisma`)

```prisma
enum OrderStatus {
  PENDING     // Pendiente por grabar
  IN_PROGRESS // Grabando / Editando
  COMPLETED   // Entregado / Listo
}

model VideoOrder {
  id          String      @id @default(uuid())
  title       String      // Título o concepto del video (ej. "Reel Unboxing Skincare")
  clientName  String      // Cliente o marca
  platform    String      @default("Reels") // Reels, TikTok, Shorts, UGC
  description String?     // Notas del guion o requerimientos
  scheduledAt DateTime    // Fecha agendada en el calendario
  price       Decimal     @db.Decimal(10, 2) // Precio del video creado
  isPaid      Boolean     @default(false)    // Estado del cobro
  status      OrderStatus @default(PENDING)  // Estado de producción del video
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

---

## 3. Funcionalidades Implementadas

1. **Calendario Interactivo de Pedidos** ([CalendarDashboard.tsx](./src/components/CalendarDashboard.tsx)):
   - Vista mensual y vista de **Lista de Precios**.
   - Clic en cualquier día del calendario para agendar un nuevo pedido en esa fecha.
   - Indicadores por color según el estado (`Pendiente`, `Grabando`, `Entregado`).
2. **Gestión de Pedidos y Precios** ([OrderModal.tsx](./src/components/OrderModal.tsx)):
   - Modal para crear, editar o eliminar pedidos.
   - Registro del **precio del video ($)** y botón para marcar como **Pagado / Por cobrar**.
3. **Resumen Financiero Mensual** ([StatsCards.tsx](./src/components/StatsCards.tsx)):
   - Cálculo automático de **Ingresos del Mes**, **Cobrado**, **Por Cobrar** y **Entregas del Mes**.
