import { requireRole } from "@/lib/dal";
import { NavLinks } from "@/components/nav-links";
import { LogoutButton } from "@/components/logout-button";
import { Brand } from "@/components/brand";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/approvals", label: "Approvals" },
  { href: "/admin/users", label: "Sales Team" },
  { href: "/admin/ledger", label: "Ledger & Reports" },
  { href: "/admin/items", label: "Items" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("admin");

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="flex flex-col justify-between border-b border-zinc-200 p-4 md:w-56 md:border-b-0 md:border-r">
        <div>
          <div className="mb-6 px-3">
            <Brand subtitle={`Admin · ${session.name}`} />
          </div>
          <NavLinks links={links} />
        </div>
        <LogoutButton />
      </aside>
      <main className="flex-1 bg-zinc-50 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
