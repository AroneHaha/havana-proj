import { AdminOrders } from "@/components/admin/orders-page";

export const metadata = {
  title: "Orders | Havana Admin",
  description: "Manage and track all customer orders",
};

export default function OrdersPage() {
  return <AdminOrders />;
}
