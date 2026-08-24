import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Ledger from "@/components/Ledger";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <Ledger userEmail={user.email ?? ""} />;
}
