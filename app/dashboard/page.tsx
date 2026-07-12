import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  redirect("/login");
}

  const { data: dbUser } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: purchases } = await supabase
    .from("purchases")
    .select(`
  *,
  semesters (
    name,
    price
  )
`)
    .eq("user_id", user.id)
    .eq("paid", true);

  return (
    <main className="max-w-6xl mx-auto p-8">

      <h1 className="text-4xl font-bold text-blue-700">
        My Dashboard
      </h1>

      <p className="text-gray-500 mt-2">
        Welcome, {dbUser?.name} 👋
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-10">

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Purchased Semesters
          </h2>

          <p className="text-4xl font-bold mt-3">
            {purchases?.length ?? 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Active Subscriptions
          </h2>

          <p className="text-4xl font-bold mt-3">
            {purchases?.length ?? 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Email
          </h2>

          <p className="mt-3 break-all">
            {dbUser?.email}
          </p>
        </div>

      </div>

      <div className="mt-12">

        <h2 className="text-2xl font-bold mb-6">
          Purchase History
        </h2>

        <div className="space-y-4">

          {purchases?.length ? (
            purchases.map((purchase: any) => (
              <div
                key={purchase.id}
                className="rounded-xl bg-white shadow p-5 flex justify-between"
              >
                <div>
                  <h3 className="font-semibold">
                    {purchase.semesters?.name}
                  </h3>

                  <p className="text-gray-500">
  ₹{purchase.semesters?.price} Paid
</p>
                </div>

                <div className="text-sm text-gray-500">
                  Expires:
                  <br />
                  {new Date(
                    purchase.expiry_date
                  ).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              No purchases yet.
            </p>
          )}

        </div>

      </div>

    </main>
  );
}