import { redirect } from "next/navigation";

import { DashboardScreen } from "./dashboard-screen";
import { getDashboardData } from "@/lib/db/dashboard";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const data = await getDashboardData(supabase, user.id);

  return <DashboardScreen data={data} />;
}
