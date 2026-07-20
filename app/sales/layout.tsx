import { requireRole } from "@/lib/dal";
import { NavLinks } from "@/components/nav-links";
import { LogoutButton } from "@/components/logout-button";
import { Brand } from "@/components/brand";

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
      <aside className="flex flex-col justify-between border-b border-zinc-200 p-4 md:w-56 md:border-b-0 md:border-r print:hidden">
        <div>
          <div className="mb-6 px-3">
            <Brand subtitle={`Sales · ${session.name}`} />
          </div>
          <NavLinks links={links} />
        </div>
        <LogoutButton />
      </aside>
      <main className="flex-1 bg-zinc-50 p-4 md:p-8 print:bg-white print:p-0">
        {children}
      </main>
    </div>
  );
}
