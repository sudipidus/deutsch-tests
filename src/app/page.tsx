import { getAllTests } from "@/lib/tests";
import { DashboardClient } from "./DashboardClient";

export default function Dashboard() {
  const tests = getAllTests();
  return <DashboardClient tests={tests.map((t) => ({ id: t.id, title: t.title }))} />;
}
