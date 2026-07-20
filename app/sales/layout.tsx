import { requireRole } from "@/lib/dal";
import { NavLinks } from "@/components/nav-links";
import { LogoutButton } from "@/components/logout-button";

const links = [
  { href: "/sales", label: "Dashboard" },
  { href: "/sales/new-sale", label: "New Sale" },
  { href: "/sales/stock", label: "Stock" },
  { href: "/sales/ledger", label: "My Sales" },
];

export default async function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("sales");

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="flex flex-col justify-between border-b border-zinc-200 p-4 md:w-56 md:border-b-0 md:border-r dark:border-zinc-800 print:hidden">
        <div>
          <div className="mb-6 px-3">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Poultry Chicken
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Sales &middot; {session.name}
            </p>
          </div>
          <NavLinks links={links} />
        </div>
        <LogoutButton />
      </aside>
      <main className="flex-1 bg-zinc-50 p-4 md:p-8 dark:bg-black print:bg-white print:p-0">
        {children}
      </main>
    </div>
  );
}
