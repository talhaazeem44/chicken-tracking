import { requireRole } from "@/lib/dal";
import { NavLinks } from "@/components/nav-links";
import { LogoutButton } from "@/components/logout-button";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Sales Team" },
  { href: "/admin/ledger", label: "Ledger & Reports" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("admin");

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="flex flex-col justify-between border-b border-zinc-200 p-4 md:w-56 md:border-b-0 md:border-r dark:border-zinc-800">
        <div>
          <div className="mb-6 px-3">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Poultry Chicken
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Admin &middot; {session.name}
            </p>
          </div>
          <NavLinks links={links} />
        </div>
        <LogoutButton />
      </aside>
      <main className="flex-1 bg-zinc-50 p-4 md:p-8 dark:bg-black">
        {children}
      </main>
    </div>
  );
}
