import { getOrdersAction } from "@/actions/orders";
import { CalendarDashboard } from "@/components/CalendarDashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { orders, storageMode } = await getOrdersAction();

  return (
    <CalendarDashboard
      initialOrders={orders}
      storageMode={storageMode}
    />
  );
}
