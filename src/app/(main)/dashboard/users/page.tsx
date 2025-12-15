import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { UserTable } from "./_components/user-table";

export default async function Page() {
  const session = await auth();

  // Only SUPER_ADMIN can access this page
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <UserTable />
    </div>
  );
}
